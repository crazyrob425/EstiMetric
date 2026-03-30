/**
 * EstiMetric Data Vault
 * Handles project persistence and historical pricing indices.
 */

const DB_NAME = 'EstiMetricVault';
const STORE_NAME = 'ProjectHistory';
const PRICE_STORE = 'PriceIndex';
const REFERENCE_STORE = 'CatalogReferences';
const DB_VERSION = 3;

export interface PriceRecord {
  material: string;
  price: number;
  timestamp: number;
  source: string;
}

export interface ReferenceAsset {
  id: string;
  url: string;
  category: string;
  title: string;
  isCustom: boolean;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      if (typeof indexedDB === 'undefined') {
        reject(new Error("IndexedDB not supported"));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(PRICE_STORE)) db.createObjectStore(PRICE_STORE, { keyPath: 'material' });
        if (!db.objectStoreNames.contains(REFERENCE_STORE)) db.createObjectStore(REFERENCE_STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch(e) {
      reject(e);
    }
  });
};

export const StorageService = {
  async savePricePoint(record: PriceRecord): Promise<void> {
    try {
      const db = await openDB();
      const transaction = db.transaction(PRICE_STORE, 'readwrite');
      transaction.objectStore(PRICE_STORE).put(record);
    } catch(e) { console.warn("Storage write failed", e); }
  },

  async getPricePoint(material: string): Promise<PriceRecord | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(PRICE_STORE, 'readonly').objectStore(PRICE_STORE).get(material);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch(e) { return null; }
  },

  async getUsageEstimate(): Promise<number> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
        request.onsuccess = () => {
          const total = request.result.reduce((acc: number, curr: any) => acc + (JSON.stringify(curr).length), 0);
          resolve(total);
        };
        request.onerror = () => resolve(0);
      });
    } catch(e) { return 0; }
  },

  async getAllProjects(): Promise<any[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      });
    } catch(e) { return []; }
  },

  async getAllReferences(): Promise<ReferenceAsset[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(REFERENCE_STORE, 'readonly').objectStore(REFERENCE_STORE).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch(e) { return []; }
  },

  async deleteReference(id: string): Promise<void> {
    try {
      const db = await openDB();
      const transaction = db.transaction(REFERENCE_STORE, 'readwrite');
      transaction.objectStore(REFERENCE_STORE).delete(id);
    } catch(e) {}
  },

  async saveReference(asset: Partial<ReferenceAsset>): Promise<void> {
    try {
      const db = await openDB();
      const transaction = db.transaction(REFERENCE_STORE, 'readwrite');
      const data = {
        id: asset.id || Math.random().toString(36).substr(2, 9),
        timestamp: asset.timestamp || Date.now(),
        ...asset
      };
      transaction.objectStore(REFERENCE_STORE).put(data);
    } catch(e) {}
  }
};