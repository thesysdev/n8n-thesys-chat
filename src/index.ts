import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { C1Chat } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";
import type { ChatConfig, ChatInstance, N8NMessage } from "./types";
import "./styles/widget.css";

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
 *   agentName: 'My Bot'
 * });
 * ```
 */
export function createChat(config: ChatConfig): ChatInstance {
  // Validate required config
  if (!config.webhookUrl) {
    throw new Error("webhookUrl is required");
  }

  // Default mode to fullscreen
  const mode = config.mode || "fullscreen";

  // Create container element
  const container = document.createElement("div");
  container.id = "thesys-chat-root";
  document.body.appendChild(container);

  // Create React root
  const root = createRoot(container);

  // Track current session ID
  let currentSessionId: string | null = null;

  // Map mode to C1Chat formFactor
  const formFactor = mode === "sidepanel" ? "side-panel" : "full-page";

  // Render C1Chat with appropriate mode
  root.render(
    createElement(C1Chat, {
      processMessage: async ({
        threadId,
        messages,
        responseId,
        abortController,
      }) => {
        // Use threadId from C1Chat as session ID
        currentSessionId = threadId;

        // Call onSessionStart callback on first message
        if (messages.length === 1) {
          config.onSessionStart?.(threadId);
        }

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        const prompt = lastMessage?.content || "";

        // Create n8n message
        const message: N8NMessage = {
          chatInput: prompt,
          sessionId: threadId,
        };

        try {
          // Prepare webhook request configuration
          const webhookMethod = config.webhookConfig?.method || "POST";
          const customHeaders = config.webhookConfig?.headers || {};

          // Merge custom headers with default Content-Type
          const headers = {
            "Content-Type": "application/json",
            ...customHeaders,
          };

          // Call n8n webhook with custom configuration
          const response = await fetch(config.webhookUrl, {
            method: webhookMethod,
            headers: headers,
            body: JSON.stringify(message),
          });

          if (!response.ok) {
            throw new Error(
              `Webhook error: ${response.status} ${response.statusText}`
            );
          }

          // For non-streaming, get JSON and return as text
          if (!config.enableStreaming) {
            const data = await response.json();
            return new Response(
              data.output || data.message || JSON.stringify(data)
            );
          }

          // For streaming, transform n8n format to plain text stream
          if (!response.body) {
            throw new Error("Response body is null");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          // Create a ReadableStream to process n8n's line-delimited JSON
          const stream = new ReadableStream({
            async start(controller) {
              let buffer = "";

              try {
                while (true) {
                  const { done, value } = await reader.read();

                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");

                  // Keep the last incomplete line in the buffer
                  buffer = lines.pop() || "";

                  // Process each complete line
                  for (const line of lines) {
                    if (line.trim()) {
                      try {
                        const data = JSON.parse(line);
                        // n8n sends: { "type": "item", "content": "text" }
                        if (data.type === "item" && data.content) {
                          controller.enqueue(
                            new TextEncoder().encode(data.content)
                          );
                        }
                      } catch (e) {
                        console.error(
                          "Failed to parse streaming line:",
                          line,
                          e
                        );
                      }
                    }
                  }
                }

                // Process any remaining data in buffer
                if (buffer.trim()) {
                  try {
                    const data = JSON.parse(buffer);
                    if (data.type === "item" && data.content) {
                      controller.enqueue(
                        new TextEncoder().encode(data.content)
                      );
                    }
                  } catch (e) {
                    console.error(
                      "Failed to parse final streaming data:",
                      buffer,
                      e
                    );
                  }
                }
              } catch (error) {
                console.error("Streaming error:", error);
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
        } catch (error) {
          console.error("Chat error:", error);
          const errorMessage =
            error instanceof Error
              ? `Error: ${error.message}`
              : "An unexpected error occurred";
          return new Response(errorMessage);
        }
      },
      theme: config.theme,
      agentName: config.agentName || "Assistant",
      formFactor: formFactor,
    })
  );

  // Return ChatInstance API
  const instance: ChatInstance = {
    open: () => {
      // Show the chat (useful for sidepanel mode if we add hide/show functionality)
      container.style.display = "";
    },

    close: () => {
      // Hide the chat (useful for sidepanel mode if we add hide/show functionality)
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
