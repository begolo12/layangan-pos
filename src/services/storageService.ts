const STORAGE_PREFIX = 'pos-';

export interface StorageService {
  set<T>(key: string, value: T): void;
  get<T>(key: string, defaultValue?: T): T | null;
  remove(key: string): void;
  clear(): void;
  exists(key: string): boolean;
  getAllKeys(): string[];
}

class LocalStorageService implements StorageService {
  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(STORAGE_PREFIX + key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
      throw new Error(`Failed to save ${key} to storage`);
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (stored === null) {
        return defaultValue;
      }
      return JSON.parse(stored) as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  exists(key: string): boolean {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }

  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.substring(STORAGE_PREFIX.length));
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }
}

// Create singleton instance
export const storageService: StorageService = new LocalStorageService();

// Utility functions for common storage operations
export const storage = {
  // Session management
  setSession: (session: any) => storageService.set('session', session),
  getSession: () => storageService.get('session'),
  clearSession: () => storageService.remove('session'),

  // App data
  setProducts: (products: any[]) => storageService.set('products', products),
  getProducts: (defaultValue: any[] = []) => storageService.get('products', defaultValue),

  setSales: (sales: any[]) => storageService.set('sales', sales),
  getSales: (defaultValue: any[] = []) => storageService.get('sales', defaultValue),

  setUsers: (users: any[]) => storageService.set('users', users),
  getUsers: (defaultValue: any[] = []) => storageService.get('users', defaultValue),

  setHistory: (history: any[]) => storageService.set('history', history),
  getHistory: (defaultValue: any[] = []) => storageService.get('history', defaultValue),

  setTheme: (themeId: string) => storageService.set('theme', themeId),
  getTheme: (defaultValue: string = 'senja') => storageService.get('theme', defaultValue),

  setProductTypes: (types: any[]) => storageService.set('product-types', types),
  getProductTypes: (defaultValue: any[] = []) => storageService.get('product-types', defaultValue),

  // Settings
  setSetting: (key: string, value: any) => storageService.set(`setting-${key}`, value),
  getSetting: (key: string, defaultValue: any = null) => storageService.get(`setting-${key}`, defaultValue),

  // Backup and restore
  exportData: () => {
    const keys = storageService.getAllKeys();
    const data: Record<string, any> = {};
    
    keys.forEach(key => {
      data[key] = storageService.get(key);
    });
    
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data
    };
  },

  importData: (backup: { version: string; data: Record<string, any> }) => {
    try {
      // Clear existing data
      storageService.clear();
      
      // Import new data
      Object.entries(backup.data).forEach(([key, value]) => {
        storageService.set(key, value);
      });
      
      return true;
    } catch (error) {
      console.error('Import data error:', error);
      return false;
    }
  },

  // Data size utilities
  getStorageSize: () => {
    let total = 0;
    const keys = storageService.getAllKeys();
    
    keys.forEach(key => {
      const value = localStorage.getItem(STORAGE_PREFIX + key);
      if (value) {
        total += value.length;
      }
    });
    
    return total;
  },

  getStorageSizeFormatted: () => {
    const bytes = storage.getStorageSize();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};