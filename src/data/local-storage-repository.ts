/**
 * LocalStorage repository utility with error guards.
 * Adapts storage needs to the domain layer.
 */
export const LocalStorageRepository = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`LocalStorage failed to read key "${key}":`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`LocalStorage failed to write key "${key}":`, e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`LocalStorage failed to remove key "${key}":`, e);
    }
  }
};
