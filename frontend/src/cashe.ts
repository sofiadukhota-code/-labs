interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const TTL_MS = 30_000;
const store = new Map<string, CacheEntry<unknown>>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL_MS) {
      store.delete(key);
      return null;
    }
    return entry.data;
  },

  set<T>(key: string, data: T): void {
    store.set(key, { data, timestamp: Date.now() });
  },

  invalidate(prefix: string): void {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },

  clear(): void {
    store.clear();
  },
};