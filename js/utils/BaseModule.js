/**
 * BaseModule - Abstract base class for all feature modules
 * Provides common functionality and structure
 */
export class BaseModule {
  constructor(storageManager, eventBus, storageKey) {
    if (new.target === BaseModule) {
      throw new Error('BaseModule is abstract and cannot be instantiated directly');
    }
    
    this.storage = storageManager;
    this.eventBus = eventBus;
    this.storageKey = storageKey;
    this.data = this.loadData();
  }

  loadData() {
    return this.storage.get(this.storageKey, []);
  }

  saveData() {
    this.storage.set(this.storageKey, this.data);
    this.eventBus.emit('data:changed', { module: this.constructor.name });
  }

  create(item) {
    const newItem = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data.unshift(newItem);
    this.saveData();
    return newItem;
  }

  findById(id) {
    return this.data.find(item => item.id === id);
  }

  update(id, updates) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      return this.data[index];
    }
    return null;
  }

  delete(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }

  getAll() {
    return [...this.data];
  }

  count() {
    return this.data.length;
  }

  clear() {
    this.data = [];
    this.saveData();
  }
}
