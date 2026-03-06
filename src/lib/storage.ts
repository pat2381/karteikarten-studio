// Bug-Fix: Original code used window.storage with no fallback.
// This implementation tries window.storage first, falls back to localStorage.

async function getStorageItem(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (window.storage) {
    const result = await window.storage.get(key);
    return result?.value ?? null;
  }

  return localStorage.getItem(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;

  if (window.storage) {
    await window.storage.set(key, value);
    return;
  }

  localStorage.setItem(key, value);
}

export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getStorageItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function save<T>(key: string, data: T): Promise<void> {
  try {
    await setStorageItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
