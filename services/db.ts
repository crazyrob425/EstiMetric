/**
 * EstiMetric Unified Data Store — Dexie.js
 * Single source of truth for all app data.
 * Replaces the split localStorage / IndexedDB pattern.
 */

import Dexie, { type Table } from 'dexie';
import { BidData, AppSettings } from '../types.ts';

export interface PriceRecord {
  material: string;
  price: string;
  sourceName: string;
  confidence: string;
  timestamp: number;
}

export interface ReferenceAsset {
  id?: number;
  url: string;
  category: string;
  title: string;
  isCustom: boolean;
  timestamp: number;
}

export class EstiMetricDatabase extends Dexie {
  bids!: Table<BidData>;
  prices!: Table<PriceRecord>;
  references!: Table<ReferenceAsset>;

  constructor() {
    super('EstiMetricDB');
    this.version(1).stores({
      bids: 'id, clientName, projectName, status, date',
      prices: 'material, timestamp',
      references: '++id, category, timestamp',
    });
  }
}

export const db = new EstiMetricDatabase();

// ---------------------------------------------------------------------------
// Settings helpers (small enough to stay in localStorage as simple JSON)
// ---------------------------------------------------------------------------

const SETTINGS_KEY = 'estimetric_settings_v2';

export function loadSettings<T>(defaults: T): T {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {
    // ignore corrupt data
  }
  return defaults;
}

export function saveSettings(settings: unknown): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}
