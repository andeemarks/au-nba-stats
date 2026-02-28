interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const read = <T>(key: string): CacheEntry<T> | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
};

export const cacheSet = <T>(key: string, value: T): void => {
  try {
    const entry: CacheEntry<T> = { value, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage may be full — ignore
  }
};

/** Returns cached value if present and not older than ttlMs, otherwise null. */
export const cacheGetWithTTL = <T>(key: string, ttlMs: number): T | null => {
  const entry = read<T>(key);
  if (!entry) return null;
  return Date.now() - entry.timestamp < ttlMs ? entry.value : null;
};

/** Returns cached value regardless of age (for immutable data like completed boxscores). */
export const cacheGet = <T>(key: string): T | null => read<T>(key)?.value ?? null;
