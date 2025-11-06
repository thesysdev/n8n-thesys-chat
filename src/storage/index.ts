import type { StorageAdapter } from "./StorageAdapter";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { NoOpStorageAdapter } from "./NoOpStorageAdapter";

export type { StorageAdapter } from "./StorageAdapter";
export { LocalStorageAdapter } from "./LocalStorageAdapter";
export { NoOpStorageAdapter } from "./NoOpStorageAdapter";

/**
 * Factory function to create a storage adapter based on the storage type
 * @param type - The type of storage to use
 * @returns An instance of the appropriate StorageAdapter
 */
export function createStorageAdapter(
  type: "none" | "localstorage"
): StorageAdapter {
  switch (type) {
    case "localstorage":
      return new LocalStorageAdapter();
    case "none":
    default:
      return new NoOpStorageAdapter();
  }
}
