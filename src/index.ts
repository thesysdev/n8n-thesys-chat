import { createRoot } from "react-dom/client";
import { createElement, useEffect } from "react";
import {
  C1Chat,
  useThreadManager,
  useThreadListManager,
  type Message,
} from "@thesysai/genui-sdk";
import type { Thread, UserMessage } from "@crayonai/react-core";
import "@crayonai/react-ui/styles/index.css";
import type { ChatConfig, ChatInstance, N8NMessage } from "./types";
import { createStorageAdapter } from "./storage";
import type { StorageAdapter } from "./storage";
import { log, logError } from "./utils/logger";
import "./styles/widget.css";

/**
 * Helper function to generate thread title from first user message
 */
function generateThreadTitle(message: string): string {
  const maxLength = 50;
  const cleaned = message.trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength) + "...";
}

/**
 * Helper function to call n8n webhook
 */
async function callN8NWebhook(
  webhookUrl: string,
  sessionId: string,
  prompt: string,
  enableStreaming: boolean,
  webhookConfig?: ChatConfig["webhookConfig"]
): Promise<Response> {
  const message: N8NMessage = {
    chatInput: prompt,
    sessionId: sessionId,
  };

  const webhookMethod = webhookConfig?.method || "POST";
  const customHeaders = webhookConfig?.headers || {};

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const response = await fetch(webhookUrl, {
    method: webhookMethod,
    headers: headers,
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
  }

  // For non-streaming, get JSON and return as text
  if (!enableStreaming) {
    const data = await response.json();
    return new Response(data.output || data.message || JSON.stringify(data));
  }

  // For streaming, transform n8n format to plain text stream
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.type === "item" && data.content) {
                  controller.enqueue(new TextEncoder().encode(data.content));
                }
              } catch (e) {
                logError("Failed to parse streaming line:", line, e);
              }
            }
          }
        }

        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.type === "item" && data.content) {
              controller.enqueue(new TextEncoder().encode(data.content));
            }
          } catch (e) {
            logError("Failed to parse final streaming data:", buffer, e);
          }
        }
      } catch (error) {
        logError("Streaming error:", error);
        controller.error(error);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

/**
 * React component wrapper that manages thread persistence
 */
function ChatWithPersistence({
  config,
  storage,
  onSessionIdChange,
}: {
  config: ChatConfig;
  storage: StorageAdapter;
  onSessionIdChange: (sessionId: string | null) => void;
}) {
  const formFactor = config.mode === "sidepanel" ? "side-panel" : "full-page";

  // Initialize thread list manager
  const threadListManager = useThreadListManager({
    fetchThreadList: async () => {
      return await storage.getThreadList();
    },
    createThread: async (firstMessage: UserMessage) => {
      const threadId = crypto.randomUUID();
      const title = generateThreadTitle(firstMessage.message || "New Chat");

      const thread: Thread = {
        threadId,
        title,
        createdAt: new Date(),
        isRunning: false,
      };

      await storage.updateThread(thread);

      // Convert UserMessage to Message format (react-core -> genui-sdk)
      const message: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: firstMessage.message || "",
      };
      await storage.saveThread(threadId, [message]);

      return thread;
    },
    deleteThread: async (threadId: string) => {
      await storage.deleteThread(threadId);
    },
    updateThread: async (thread: Thread) => {
      await storage.updateThread(thread);
      return thread;
    },
    onSwitchToNew: () => {
      // Called when user switches to new thread
    },
    onSelectThread: (threadId: string) => {
      // Called when user selects a thread
      onSessionIdChange(threadId);
    },
  });

  // Initialize thread manager
  const threadManager = useThreadManager({
    threadListManager,
    loadThread: async (threadId: string) => {
      log("[Storage] loadThread:", threadId);
      const messages = await storage.getThread(threadId);
      log("[Storage] Loaded", messages?.length || 0, "messages");
      return messages || [];
    },
    processMessage: async ({
      threadId,
      messages,
      responseId,
      abortController,
    }) => {
      log("[Storage] processMessage:", {
        threadId,
        messageCount: messages.length,
      });

      // Update session ID
      onSessionIdChange(threadId);

      // Call onSessionStart on first message
      if (messages.length === 1) {
        config.onSessionStart?.(threadId);
      }

      // Save user messages
      await storage.saveThread(threadId, messages);
      log("[Storage] Saved user messages");

      // Get prompt
      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage?.content || "";

      // Call webhook
      const response = await callN8NWebhook(
        config.webhookUrl,
        threadId,
        prompt,
        config.enableStreaming || false,
        config.webhookConfig
      );

      // Wrap stream to save assistant message when complete
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        const wrappedStream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                fullContent += text;
                controller.enqueue(value);
              }

              // Save complete thread after stream ends
              const assistantMessage: Message = {
                id: responseId,
                role: "assistant",
                content: fullContent,
              };
              await storage.saveThread(threadId, [
                ...messages,
                assistantMessage,
              ]);
              log(
                "[Storage] Saved assistant message, total:",
                messages.length + 1
              );

              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(wrappedStream, { headers: response.headers });
      }

      return response;
    },
    onUpdateMessage: () => {
      // Not called when threadManager is used with C1Chat
    },
  });

  return createElement(C1Chat, {
    threadManager,
    threadListManager,
    theme: config.theme,
    agentName: config.agentName || "Assistant",
    logoUrl: config.logoUrl,
    formFactor,
  });
}

/**
 * Create an embeddable chat widget in fullscreen mode
 *
 * @param config - Configuration options for the chat widget
 * @returns ChatInstance with methods to control the widget
 *
 * @example
 * ```typescript
 * import { createChat } from 'thesys/n8n-chat';
 *
 * const chat = createChat({
 *   webhookUrl: 'https://your-n8n-instance.com/webhook/xxx',
 *   agentName: 'My Bot',
 *   storageType: 'localstorage'
 * });
 * ```
 */
export function createChat(config: ChatConfig): ChatInstance {
  // Validate required config
  if (!config.webhookUrl) {
    throw new Error("webhookUrl is required");
  }

  // Set debug logging flag at window level
  if (!window.__N8N_CHAT__) {
    window.__N8N_CHAT__ = {};
  }
  window.__N8N_CHAT__.enableDebugLogging = config.enableDebugLogging || false;

  // Create storage adapter
  const storageType = config.storageType || "none";
  const storage = createStorageAdapter(storageType);

  // Create container element
  const container = document.createElement("div");
  container.id = "thesys-chat-root";
  document.body.appendChild(container);

  // Create React root
  const root = createRoot(container);

  // Track current session ID
  let currentSessionId: string | null = null;

  // Render chat with persistence
  root.render(
    createElement(ChatWithPersistence, {
      config,
      storage,
      onSessionIdChange: (sessionId: string | null) => {
        currentSessionId = sessionId;
      },
    })
  );

  // Return ChatInstance API
  const instance: ChatInstance = {
    open: () => {
      container.style.display = "";
    },

    close: () => {
      container.style.display = "none";
    },

    destroy: () => {
      root.unmount();
      container.remove();
    },

    getSessionId: () => currentSessionId || "",
  };

  return instance;
}

// Export types
export type { ChatConfig, ChatInstance } from "./types";
