export class StoreRegistry<T extends { _cleanup?: () => void }> {
  private stores = new Map<string, { store: T; refCount: number }>();

  get(key: string, factory: () => T): T {
    const existing = this.stores.get(key);

    if (existing) {
      existing.refCount++;
      console.log(`[StoreRegistry] Incrementing ref count for ${key}: ${existing.refCount}`);
      return existing.store;
    }

    // Create new store
    console.log(`[StoreRegistry] Creating new store for ${key}`);
    const store = factory();
    this.stores.set(key, { store, refCount: 1 });
    return store;
  }

  release(key: string) {
    const existing = this.stores.get(key);
    if (!existing) {
      console.warn(`[StoreRegistry] Attempted to release non-existent store: ${key}`);
      return;
    }

    existing.refCount--;
    console.log(`[StoreRegistry] Decrementing ref count for ${key}: ${existing.refCount}`);

    if (existing.refCount === 0) {
      console.log(`[StoreRegistry] Cleaning up store for ${key}`);
      if (existing.store._cleanup) {
        existing.store._cleanup();
      }
      this.stores.delete(key);
    }
  }

  // Utility method for debugging
  getActiveStores(): string[] {
    return Array.from(this.stores.keys());
  }
}