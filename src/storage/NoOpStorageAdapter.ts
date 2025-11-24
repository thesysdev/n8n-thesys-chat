import type { Message } from "@thesysai/genui-sdk";
import type { Thread } from "@crayonai/react-core";
import type { StorageAdapter } from "./StorageAdapter";

/**
 * In-memory implementation of StorageAdapter.
 * Used when persistence is disabled (storageType: "none").
 * Messages are stored in memory and available during the current session,
 * but are lost when the page is refreshed.
 */
export class NoOpStorageAdapter implements StorageAdapter {
  private threads: Map<string, Message[]> = new Map();
  private threadList: Thread[] = [];

  async saveThread(threadId: string, messages: Message[]): Promise<void> {
    this.threads.set(threadId, messages);
  }

  async getThread(threadId: string): Promise<Message[] | null> {
    return this.threads.get(threadId) || null;
  }

  async saveThreadList(threads: Thread[]): Promise<void> {
    this.threadList = threads;
  }

  async getThreadList(): Promise<Thread[]> {
    return this.threadList;
  }

  async deleteThread(threadId: string): Promise<void> {
    this.threads.delete(threadId);
    this.threadList = this.threadList.filter((t) => t.threadId !== threadId);
  }

  async updateThread(thread: Thread): Promise<void> {
    const index = this.threadList.findIndex(
      (t) => t.threadId === thread.threadId
    );
    if (index !== -1) {
      this.threadList[index] = thread;
    } else {
      this.threadList.push(thread);
    }
  }
}
