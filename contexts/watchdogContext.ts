import { createContext } from 'react';
import type { WatchdogContextValue } from '../types/watchdog.ts';

export const AppWatchdogContext = createContext<WatchdogContextValue | null>(null);
