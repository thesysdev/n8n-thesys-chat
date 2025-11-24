import type { Message } from "@thesysai/genui-sdk";
import type { Thread } from "@crayonai/react-core";

/**
 * Abstract storage interface for persisting chat threads and messages.
 * Implementations can use localStorage, Firebase, IndexedDB, or any other storage backend.
 */
export interface StorageAdapter {
  /**
   * Save messages for a specific thread
   * @param threadId - The unique identifier for the thread
   * @param messages - Array of messages to save
   */
  saveThread(threadId: string, messages: Message[]): Promise<void>;

  /**
   * Retrieve messages for a specific thread
   * @param threadId - The unique identifier for the thread
   * @returns Array of messages or null if thread doesn't exist
   */
  getThread(threadId: string): Promise<Message[] | null>;

  /**
   * Save the list of thread metadata
   * @param threads - Array of thread metadata to save
   */
  saveThreadList(threads: Thread[]): Promise<void>;

  /**
   * Retrieve the list of all thread metadata
   * @returns Array of thread metadata
   */
  getThreadList(): Promise<Thread[]>;

  /**
   * Delete a thread and its messages
   * @param threadId - The unique identifier for the thread to delete
   */
  deleteThread(threadId: string): Promise<void>;

  /**
   * Update thread metadata
   * @param thread - Updated thread metadata
   */
  updateThread(thread: Thread): Promise<void>;
}
