/**
 * Window namespace for n8n chat configuration
 */
declare global {
  interface Window {
    __N8N_CHAT__?: {
      enableDebugLogging?: boolean;
    };
  }
}

/**
 * Check if debug logging is enabled
 */
function isDebugEnabled(): boolean {
  return window.__N8N_CHAT__?.enableDebugLogging === true;
}

/**
 * Log a message to console if debug logging is enabled
 */
export function log(...args: any[]): void {
  if (isDebugEnabled()) {
    console.log(...args);
  }
}

/**
 * Log an error to console if debug logging is enabled
 */
export function logError(...args: any[]): void {
  if (isDebugEnabled()) {
    console.error(...args);
  }
}
