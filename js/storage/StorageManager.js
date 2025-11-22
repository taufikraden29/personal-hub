/**
 * StorageManager - Handles all localStorage operations
 * Provides a centralized way to manage data persistence
 */
export class StorageManager {
  constructor() {
    this.storage = window.localStorage;
  }

  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      return false;
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  has(key) {
    return this.storage.getItem(key) !== null;
  }

  exportAll() {
    const data = {};
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      data[key] = this.get(key);
    }
    return data;
  }

  importAll(data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
