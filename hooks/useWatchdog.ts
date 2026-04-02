import { useContext } from 'react';
import { AppWatchdogContext } from '../contexts/watchdogContext.ts';
import type { WatchdogContextValue } from '../types/watchdog.ts';

export function useWatchdog(): WatchdogContextValue {
  const ctx = useContext(AppWatchdogContext);
  if (!ctx) {
    throw new Error('useWatchdog must be used inside AppWatchdogProvider');
  }
  return ctx;
}
