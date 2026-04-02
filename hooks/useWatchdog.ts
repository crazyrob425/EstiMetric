/**
 * useWatchdog.ts
 * Custom hook for consuming the AppWatchdog context.
 * Import this anywhere in the component tree to access watchdog features.
 * The raw context object is also defined here so it lives in a .ts file,
 * avoiding react-refresh warnings about non-component exports in .tsx files.
 */
import { createContext, useContext } from 'react';
import type { AppWatchdogContextValue } from '../contexts/watchdogTypes.ts';

export const AppWatchdogContext = createContext<AppWatchdogContextValue | null>(null);

export const useWatchdog = (): AppWatchdogContextValue => {
  const ctx = useContext(AppWatchdogContext);
  if (!ctx) throw new Error('useWatchdog must be used within AppWatchdogProvider');
  return ctx;
};

/** Alias kept for backward compatibility */
export const useAppWatchdog = useWatchdog;
