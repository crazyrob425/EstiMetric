import React, { useState, useEffect, useCallback, useRef } from 'react';
import { foremanWatchdog, WatchdogAlert, AppSection, TaskMemory, BehaviorEvent } from '../services/ForemanWatchdog.ts';
import { AppSettings } from '../types.ts';
import { AppWatchdogContext } from '../hooks/useWatchdog.ts';
import type { AppWatchdogContextValue, WatchdogSensitivity } from './watchdogTypes.ts';

export type { WatchdogSensitivity } from './watchdogTypes.ts';
export type { AppWatchdogContextValue } from './watchdogTypes.ts';

// ─── Provider ──────────────────────────────────────────────────────────────────

interface AppWatchdogProviderProps {
  children: React.ReactNode;
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onSettingsPatch?: (patch: Partial<AppSettings>) => void;
}

export const AppWatchdogProvider: React.FC<AppWatchdogProviderProps> = ({
  children,
  currentSection,
  onNavigate,
  onSettingsPatch
}) => {
  const [alerts, setAlerts] = useState<WatchdogAlert[]>([]);
  const [activeAlert, setActiveAlert] = useState<WatchdogAlert | null>(null);
  const [isStrobing, setIsStrobing] = useState(false);
  const [sensitivity, setSensitivityState] = useState<WatchdogSensitivity>(() => {
    return (localStorage.getItem('foreman_sensitivity') as WatchdogSensitivity) ?? 'medium';
  });
  const [memories, setMemories] = useState<TaskMemory[]>(() => foremanWatchdog.getAllMemories());
  const [recentEvents, setRecentEvents] = useState<BehaviorEvent[]>(() => foremanWatchdog.getRecentEvents());

  const strobeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sensitivity gate ────────────────────────────────────────────────────────
  const shouldSuppressLevel = useCallback((level: WatchdogAlert['level']): boolean => {
    if (sensitivity === 'off') return true;
    if (sensitivity === 'low' && level === 'tip') return true;
    return false;
  }, [sensitivity]);

  // ── Alert ingestion ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = foremanWatchdog.onAlert((alert) => {
      if (shouldSuppressLevel(alert.level)) return;

      setAlerts(prev => {
        // Deduplicate by title within 60 s
        const dupe = prev.find(a => a.title === alert.title && Date.now() - a.timestamp < 60_000);
        if (dupe) return prev;
        return [alert, ...prev].slice(0, 50);
      });

      // Only show strobing + active for warning/critical
      if (alert.level !== 'tip' || sensitivity === 'high') {
        setActiveAlert(alert);
        setIsStrobing(true);
        if (strobeTimerRef.current) clearTimeout(strobeTimerRef.current);
        strobeTimerRef.current = setTimeout(() => setIsStrobing(false), 4000);
      }
    });

    return unsubscribe;
  }, [shouldSuppressLevel, sensitivity]);

  // ── Install watchdog on mount ────────────────────────────────────────────────
  useEffect(() => {
    foremanWatchdog.install();
    return () => foremanWatchdog.uninstall();
  }, []);

  // ── Track navigation changes ─────────────────────────────────────────────────
  useEffect(() => {
    foremanWatchdog.recordNavigation(currentSection);
    setRecentEvents(foremanWatchdog.getRecentEvents());
  }, [currentSection]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const navigateTo = useCallback((section: AppSection) => {
    onNavigate(section);
  }, [onNavigate]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setActiveAlert(prev => prev?.id === id ? null : prev);
  }, []);

  const dismissActiveAlert = useCallback(() => {
    setActiveAlert(null);
    setIsStrobing(false);
  }, []);

  const recordFormStart = useCallback(() => {
    foremanWatchdog.recordFormStart(currentSection);
  }, [currentSection]);

  const recordFormAbandon = useCallback(() => {
    foremanWatchdog.recordFormAbandon(currentSection);
  }, [currentSection]);

  const recordSubmit = useCallback((detail?: string) => {
    foremanWatchdog.recordSubmit(currentSection, detail);
    setMemories(foremanWatchdog.getAllMemories());
    setRecentEvents(foremanWatchdog.getRecentEvents());
  }, [currentSection]);

  const recordError = useCallback((detail: string) => {
    foremanWatchdog.recordError(currentSection, detail);
    setRecentEvents(foremanWatchdog.getRecentEvents());
  }, [currentSection]);

  const recordAction = useCallback((detail: string) => {
    foremanWatchdog.recordAction(currentSection, detail);
    setRecentEvents(foremanWatchdog.getRecentEvents());
  }, [currentSection]);

  const setSensitivity = useCallback((level: WatchdogSensitivity) => {
    setSensitivityState(level);
    localStorage.setItem('foreman_sensitivity', level);
  }, []);

  const storeMemoryNote = useCallback((action: string, details: Record<string, unknown>, notes?: string) => {
    foremanWatchdog.storeMemory({
      id: `mem-${Date.now()}`,
      section: currentSection,
      action,
      details,
      timestamp: Date.now(),
      outcome: 'success',
      notes
    });
    setMemories(foremanWatchdog.getAllMemories());
  }, [currentSection]);

  const recallSimilar = useCallback((limit = 5) => {
    return foremanWatchdog.recallSimilarMemories(currentSection, limit);
  }, [currentSection]);

  const clearMemories = useCallback(() => {
    foremanWatchdog.clearMemories();
    setMemories([]);
  }, []);

  const applySettingsPatch = useCallback((patch: Partial<AppSettings>) => {
    onSettingsPatch?.(patch);
  }, [onSettingsPatch]);

  const value: AppWatchdogContextValue = {
    alerts,
    activeAlert,
    isStrobing,
    sensitivity,
    currentSection,
    memories,
    recentEvents,
    navigateTo,
    dismissAlert,
    dismissActiveAlert,
    recordFormStart,
    recordFormAbandon,
    recordSubmit,
    recordError,
    recordAction,
    setSensitivity,
    storeMemoryNote,
    recallSimilar,
    clearMemories,
    applySettingsPatch
  };

  return (
    <AppWatchdogContext.Provider value={value}>
      {children}
    </AppWatchdogContext.Provider>
  );
};

