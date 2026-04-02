/**
 * watchdogTypes.ts
 * Pure type definitions for the Foreman Watchdog system.
 * No React imports – keeps this importable from both .ts and .tsx files
 * without creating circular dependencies.
 */
import { WatchdogAlert, AppSection, TaskMemory, BehaviorEvent } from '../services/ForemanWatchdog.ts';
import { AppSettings } from '../types.ts';

export type WatchdogSensitivity = 'off' | 'low' | 'medium' | 'high';

export interface WatchdogState {
  alerts: WatchdogAlert[];
  activeAlert: WatchdogAlert | null;
  isStrobing: boolean;
  sensitivity: WatchdogSensitivity;
  currentSection: AppSection;
  memories: TaskMemory[];
  recentEvents: BehaviorEvent[];
}

export interface WatchdogActions {
  navigateTo: (section: AppSection) => void;
  dismissAlert: (id: string) => void;
  dismissActiveAlert: () => void;
  recordFormStart: () => void;
  recordFormAbandon: () => void;
  recordSubmit: (detail?: string) => void;
  recordError: (detail: string) => void;
  recordAction: (detail: string) => void;
  setSensitivity: (level: WatchdogSensitivity) => void;
  storeMemoryNote: (action: string, details: Record<string, unknown>, notes?: string) => void;
  recallSimilar: (limit?: number) => TaskMemory[];
  clearMemories: () => void;
  applySettingsPatch: (patch: Partial<AppSettings>) => void;
}

export interface AppWatchdogContextValue extends WatchdogState, WatchdogActions {}
