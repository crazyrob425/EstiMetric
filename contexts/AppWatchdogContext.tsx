import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  WatchdogContextValue,
  WatchdogSensitivity,
  WatchdogSuggestion,
  UserBehaviorMetrics,
  ForemanAlertState,
} from '../types/watchdog.ts';
import { foremanWatchdog } from '../services/ForemanWatchdog.ts';
import { AppWatchdogContext } from './watchdogContext.ts';

export { AppWatchdogContext } from './watchdogContext.ts';

const defaultMetrics = (): UserBehaviorMetrics => ({
  currentSection: 'home',
  timeInSection: 0,
  sectionStartedAt: Date.now(),
  clickCount: 0,
  formErrorCount: 0,
  lastActivity: Date.now(),
  sessionStart: Date.now(),
  featureUsage: {},
});

interface Props {
  children: React.ReactNode;
  navigateTo: (tab: string) => void;
}

const VALID_SENSITIVITIES: WatchdogSensitivity[] = ['off', 'low', 'medium', 'high'];

export const AppWatchdogProvider: React.FC<Props> = ({ children, navigateTo }) => {
  const [sensitivity, setSensitivityState] = useState<WatchdogSensitivity>(() => {
    const saved = localStorage.getItem('watchdog_sensitivity');
    return VALID_SENSITIVITIES.includes(saved as WatchdogSensitivity)
      ? (saved as WatchdogSensitivity)
      : 'medium';
  });
  const [suggestions, setSuggestions] = useState<WatchdogSuggestion[]>([]);
  const [isForemanOpen, setIsForemanOpen] = useState(false);
  const [metrics, setMetrics] = useState<UserBehaviorMetrics>(defaultMetrics());
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;

  // Compute alert state from top-priority unread suggestion
  const alertState: ForemanAlertState = React.useMemo(() => {
    const unread = suggestions.filter(s => !s.dismissed);
    if (unread.some(s => s.severity === 'critical')) return 'error';
    if (unread.some(s => s.severity === 'error')) return 'error';
    if (unread.some(s => s.severity === 'warning')) return 'warning';
    if (unread.length > 0) return 'attention';
    return 'idle';
  }, [suggestions]);

  const unreadCount = suggestions.filter(s => !s.dismissed).length;

  const addSuggestion = useCallback((s: Omit<WatchdogSuggestion, 'id' | 'timestamp' | 'dismissed'>) => {
    setSuggestions(prev => {
      // Avoid duplicate titles within a 30-second window
      const recentDuplicate = prev.find(
        p => p.title === s.title && Date.now() - p.timestamp < 30_000
      );
      if (recentDuplicate) return prev;
      const newSuggestion: WatchdogSuggestion = {
        ...s,
        id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        dismissed: false,
      };
      return [newSuggestion, ...prev].slice(0, 50); // cap at 50
    });
  }, []);

  // Init watchdog service
  useEffect(() => {
    foremanWatchdog.init(addSuggestion, sensitivity);
    return () => foremanWatchdog.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track section time
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timeInSection: Date.now() - prev.sectionStartedAt,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Track global clicks for behavior analytics
  useEffect(() => {
    const handler = () => {
      setMetrics(prev => ({ ...prev, clickCount: prev.clickCount + 1, lastActivity: Date.now() }));
    };
    window.addEventListener('click', handler, { passive: true });
    return () => window.removeEventListener('click', handler);
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  }, []);

  const clearAllSuggestions = useCallback(() => {
    setSuggestions(prev => prev.map(s => ({ ...s, dismissed: true })));
  }, []);

  const openForeman = useCallback(() => setIsForemanOpen(true), []);
  const closeForeman = useCallback(() => setIsForemanOpen(false), []);

  const setSensitivity = useCallback((s: WatchdogSensitivity) => {
    setSensitivityState(s);
    localStorage.setItem('watchdog_sensitivity', s);
    foremanWatchdog.updateSensitivity(s);
  }, []);

  const recordFeatureUse = useCallback((feature: string) => {
    setMetrics(prev => ({
      ...prev,
      featureUsage: { ...prev.featureUsage, [feature]: (prev.featureUsage[feature] ?? 0) + 1 },
    }));
  }, []);

  const handleNavigateTo = useCallback((tab: string) => {
    setMetrics(prev => ({
      ...prev,
      currentSection: tab,
      sectionStartedAt: Date.now(),
      timeInSection: 0,
    }));
    navigateTo(tab);
  }, [navigateTo]);

  const value: WatchdogContextValue = {
    isActive: sensitivity !== 'off',
    sensitivity,
    alertState,
    suggestions,
    unreadCount,
    metrics,
    isForemanOpen,
    dismissSuggestion,
    clearAllSuggestions,
    openForeman,
    closeForeman,
    setSensitivity,
    navigateTo: handleNavigateTo,
    recordFeatureUse,
    addSuggestion,
  };

  return (
    <AppWatchdogContext.Provider value={value}>
      {children}
    </AppWatchdogContext.Provider>
  );
};
