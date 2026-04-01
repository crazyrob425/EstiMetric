export type AlertSeverity = 'info' | 'tip' | 'warning' | 'error' | 'critical';
export type AlertCategory =
  | 'form_validation'
  | 'user_behavior'
  | 'performance'
  | 'data_inconsistency'
  | 'common_mistake'
  | 'app_state'
  | 'network_error'
  | 'self_healing';

export interface WatchdogSuggestion {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  message: string;
  actionLabel?: string;
  action?: () => void;
  timestamp: number;
  dismissed: boolean;
  autoHealable: boolean;
}

export type WatchdogSensitivity = 'off' | 'low' | 'medium' | 'high';

export type ForemanAlertState = 'idle' | 'attention' | 'warning' | 'error';

export interface UserBehaviorMetrics {
  currentSection: string;
  timeInSection: number; // ms
  sectionStartedAt: number;
  clickCount: number;
  formErrorCount: number;
  lastActivity: number;
  sessionStart: number;
  featureUsage: Record<string, number>;
}

export interface WatchdogState {
  isActive: boolean;
  sensitivity: WatchdogSensitivity;
  alertState: ForemanAlertState;
  suggestions: WatchdogSuggestion[];
  unreadCount: number;
  metrics: UserBehaviorMetrics;
  isForemanOpen: boolean;
}

export interface WatchdogContextValue extends WatchdogState {
  dismissSuggestion: (id: string) => void;
  clearAllSuggestions: () => void;
  openForeman: () => void;
  closeForeman: () => void;
  setSensitivity: (s: WatchdogSensitivity) => void;
  navigateTo: (tab: string) => void;
  recordFeatureUse: (feature: string) => void;
  addSuggestion: (s: Omit<WatchdogSuggestion, 'id' | 'timestamp' | 'dismissed'>) => void;
}
