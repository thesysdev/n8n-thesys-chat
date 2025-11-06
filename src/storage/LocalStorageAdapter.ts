import type { Message } from "@thesysai/genui-sdk";
import type { Thread } from "@crayonai/react-core";
import type { StorageAdapter } from "./StorageAdapter";
import { logError } from "../utils/logger";

const STORAGE_PREFIX = "n8n-chat:";
const THREADS_KEY = `${STORAGE_PREFIX}threads`;

/**
 * LocalStorage implementation of StorageAdapter.
 * Stores threads and messages in browser's localStorage.
 */
export class LocalStorageAdapter implements StorageAdapter {
  private getThreadKey(threadId: string): string {
    return `${STORAGE_PREFIX}thread:${threadId}`;
  }

  async saveThread(threadId: string, messages: Message[]): Promise<void> {
    try {
      const key = this.getThreadKey(threadId);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      logError("Failed to save thread to localStorage:", error);
      throw new Error("Failed to save thread. Storage quota may be exceeded.");
    }
  }

  async getThread(threadId: string): Promise<Message[] | null> {
    try {
      const key = this.getThreadKey(threadId);
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as Message[];
    } catch (error) {
      logError("Failed to load thread from localStorage:", error);
      return null;
    }
  }

  async saveThreadList(threads: Thread[]): Promise<void> {
    try {
      // Convert Date objects to ISO strings for storage
      const serializedThreads = threads.map((thread) => ({
        ...thread,
        createdAt: thread.createdAt.toISOString(),
      }));
      localStorage.setItem(THREADS_KEY, JSON.stringify(serializedThreads));
    } catch (error) {
      logError("Failed to save thread list to localStorage:", error);
      throw new Error(
        "Failed to save thread list. Storage quota may be exceeded."
      );
    }
  }

  async getThreadList(): Promise<Thread[]> {
    try {
      const data = localStorage.getItem(THREADS_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data) as Array<
        Omit<Thread, "createdAt"> & { createdAt: string }
      >;

      // Convert ISO strings back to Date objects
      return parsed.map((thread) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
      }));
    } catch (error) {
      logError("Failed to load thread list from localStorage:", error);
      return [];
    }
  }

  async deleteThread(threadId: string): Promise<void> {
    try {
      // Remove thread messages
      const key = this.getThreadKey(threadId);
      localStorage.removeItem(key);

      // Update thread list
      const threads = await this.getThreadList();
      const updatedThreads = threads.filter((t) => t.threadId !== threadId);
      await this.saveThreadList(updatedThreads);
    } catch (error) {
      logError("Failed to delete thread from localStorage:", error);
      throw new Error("Failed to delete thread.");
    }
  }

  async updateThread(thread: Thread): Promise<void> {
    try {
      const threads = await this.getThreadList();
      const index = threads.findIndex((t) => t.threadId === thread.threadId);

      if (index !== -1) {
        threads[index] = thread;
      } else {
        threads.push(thread);
      }

      await this.saveThreadList(threads);
    } catch (error) {
      logError("Failed to update thread in localStorage:", error);
      throw new Error("Failed to update thread.");
    }
  }
}
