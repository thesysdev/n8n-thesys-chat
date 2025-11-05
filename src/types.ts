/**
 * Configuration options for the chat widget
 */
export interface ChatConfig {
  /**
   * The n8n webhook URL to send chat messages to
   */
  webhookUrl: string;

  /**
   * Callback fired when a session starts
   * The sessionId is the threadId from C1Chat
   */
  onSessionStart?: (sessionId: string) => void;

  /**
   * Theme configuration
   */
  theme?: {
    mode: "light" | "dark";
  };

  /**
   * Name of the agent/bot
   * @default "Assistant"
   */
  agentName?: string;

  /**
   * Enable streaming responses from n8n webhook
   * @default false
   */
  enableStreaming?: boolean;

  /**
   * Display mode for the chat widget
   * - "fullscreen": Takes up the entire viewport
   * - "sidepanel": Appears as a side panel on the right
   * @default "fullscreen"
   */
  mode?: "fullscreen" | "sidepanel";

  /**
   * Configuration for the webhook request
   * @default { method: 'POST', headers: {} }
   */
  webhookConfig?: {
    method?: string;
    headers?: Record<string, string>;
  };
}

/**
 * Chat widget instance returned by createChat
 */
export interface ChatInstance {
  /**
   * Programmatically open the chat window
   */
  open: () => void;

  /**
   * Programmatically close the chat window
   */
  close: () => void;

  /**
   * Destroy the chat widget and remove it from the DOM
   */
  destroy: () => void;

  /**
   * Get the current session ID
   */
  getSessionId: () => string;
}

/**
 * Message format sent to n8n webhook
 */
export interface N8NMessage {
  chatInput: string;
  sessionId: string;
}

/**
 * Response format from n8n webhook (non-streaming)
 */
export interface N8NResponse {
  output: string;
}

/**
 * Streaming response item from n8n
 */
export interface N8NStreamItem {
  type: "item";
  content: string;
}

/**
 * Error from n8n webhook
 */
export interface N8NError {
  message: string;
  status?: number;
}
