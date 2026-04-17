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

// ─── Singleton DB connection ───────────────────────────────────────────────────
// Opening a new IDBDatabase on every operation wastes connections and can cause
// version-change conflicts. Reuse a single connection for the lifetime of the page.
let _dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
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
      request.onerror = () => {
        _dbPromise = null; // reset so the next call retries
        reject(request.error);
      };
      // If the database is blocked (e.g. another tab is upgrading), reset the cached promise
      request.onblocked = () => {
        _dbPromise = null;
        reject(new Error("IndexedDB version upgrade blocked"));
      };
    } catch(e) {
      _dbPromise = null;
      reject(e);
    }
  });

  return _dbPromise;
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
        request.onsuccess = () => resolve(request.result as PriceRecord ?? null);
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
          const total = (request.result as unknown[]).reduce((acc: number, curr) => acc + (JSON.stringify(curr).length), 0);
          resolve(total);
        };
        request.onerror = () => resolve(0);
      });
    } catch(e) { return 0; }
  },

  async getAllProjects(): Promise<unknown[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result as unknown[]);
        request.onerror = () => resolve([]);
      });
    } catch(e) { return []; }
  },

  async getAllReferences(): Promise<ReferenceAsset[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const request = db.transaction(REFERENCE_STORE, 'readonly').objectStore(REFERENCE_STORE).getAll();
        request.onsuccess = () => resolve((request.result as ReferenceAsset[]) || []);
        request.onerror = () => resolve([]);
      });
    } catch(e) { return []; }
  },

  async deleteReference(id: string): Promise<void> {
    try {
      const db = await openDB();
      const transaction = db.transaction(REFERENCE_STORE, 'readwrite');
      transaction.objectStore(REFERENCE_STORE).delete(id);
    } catch(e) { /* no-op */ }
  },

  async saveReference(asset: Partial<ReferenceAsset>): Promise<void> {
    try {
      if (!asset.url || !asset.category || !asset.title) {
        console.warn("StorageService.saveReference: missing required fields (url, category, title) — skipping save.");
        return;
      }
      const db = await openDB();
      const transaction = db.transaction(REFERENCE_STORE, 'readwrite');
      const data: ReferenceAsset = {
        id: asset.id || Math.random().toString(36).substr(2, 9),
        url: asset.url,
        category: asset.category,
        title: asset.title,
        isCustom: asset.isCustom ?? true,
        timestamp: asset.timestamp || Date.now(),
      };
      transaction.objectStore(REFERENCE_STORE).put(data);
    } catch(e) { /* no-op */ }
  }
};
