/**
 * ForemanWatchdog.ts
 * System-level watchdog service that monitors app state, user behavior,
 * form errors, performance, and self-heals recoverable issues.
 */
import { WatchdogSuggestion, WatchdogSensitivity } from '../types/watchdog.ts';

type SuggestionHandler = (s: Omit<WatchdogSuggestion, 'id' | 'timestamp' | 'dismissed'>) => void;

const SENSITIVITY_THRESHOLDS: Record<WatchdogSensitivity, number> = {
  off: Infinity,
  low: 3,
  medium: 2,
  high: 1,
};

class ForemanWatchdogService {
  private sensitivity: WatchdogSensitivity = 'medium';
  private addSuggestion: SuggestionHandler | null = null;
  private consoleErrorCount = 0;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private unhandledRejectionHandler: ((e: PromiseRejectionEvent) => void) | null = null;
  private globalErrorHandler: ((e: ErrorEvent) => void) | null = null;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;
  private formErrorCounts: Record<string, number> = {};
  private slowApiThresholdMs = 4000;

  constructor() {
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
  }

  init(handler: SuggestionHandler, sensitivity: WatchdogSensitivity) {
    this.addSuggestion = handler;
    this.sensitivity = sensitivity;
    if (sensitivity === 'off') return;
    this._hookConsole();
    this._hookGlobalErrors();
    this._startPeriodicChecks();
  }

  updateSensitivity(s: WatchdogSensitivity) {
    this.sensitivity = s;
    if (s === 'off') {
      this._unhook();
    } else if (!this.monitorInterval) {
      this._hookConsole();
      this._hookGlobalErrors();
      this._startPeriodicChecks();
    }
  }

  destroy() {
    this._unhook();
  }

  // ── Public API for external reporters ──────────────────────────────────────

  reportFormError(fieldId: string, message: string) {
    if (this.sensitivity === 'off') return;
    this.formErrorCounts[fieldId] = (this.formErrorCounts[fieldId] ?? 0) + 1;
    const count = this.formErrorCounts[fieldId];
    const threshold = SENSITIVITY_THRESHOLDS[this.sensitivity];
    if (count >= threshold) {
      this._emit({
        severity: 'warning',
        category: 'form_validation',
        title: 'Repeated Form Error',
        message: `I've noticed ${count} repeated errors on "${fieldId}": ${message}. Would you like help filling this in?`,
        actionLabel: 'Get Help',
        autoHealable: false,
      });
    }
  }

  reportSlowOperation(label: string, durationMs: number) {
    if (this.sensitivity === 'off' || durationMs < this.slowApiThresholdMs) return;
    this._emit({
      severity: 'warning',
      category: 'performance',
      title: 'Slow Operation Detected',
      message: `"${label}" took ${(durationMs / 1000).toFixed(1)}s — that's slower than usual. Try refreshing or checking your connection.`,
      actionLabel: 'Refresh',
      action: () => window.location.reload(),
      autoHealable: true,
    });
  }

  reportDataInconsistency(description: string) {
    if (this.sensitivity === 'off') return;
    this._emit({
      severity: 'error',
      category: 'data_inconsistency',
      title: 'Data Sync Issue',
      message: description,
      actionLabel: 'Auto-Fix',
      autoHealable: true,
    });
  }

  reportCommonMistake(title: string, message: string, autoHealable = false) {
    if (this.sensitivity === 'off') return;
    this._emit({ severity: 'tip', category: 'common_mistake', title, message, autoHealable });
  }

  reportBehaviorPattern(title: string, message: string) {
    if (this.sensitivity === 'off') return;
    this._emit({ severity: 'info', category: 'user_behavior', title, message, autoHealable: false });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _emit(s: Omit<WatchdogSuggestion, 'id' | 'timestamp' | 'dismissed'>) {
    if (this.sensitivity === 'off' || !this.addSuggestion) return;
    this.addSuggestion(s);
  }

  private _hookConsole() {
    // Intercept console.error for real-time monitoring
    console.error = (...args: unknown[]) => {
      this.originalConsoleError(...args);
      this.consoleErrorCount++;
      if (this.consoleErrorCount % 3 === 0) {
        this._emit({
          severity: 'error',
          category: 'app_state',
          title: 'Repeated App Errors',
          message: `I've detected ${this.consoleErrorCount} console errors this session. This may indicate an underlying issue. Consider refreshing.`,
          actionLabel: 'Refresh App',
          action: () => window.location.reload(),
          autoHealable: true,
        });
      }
    };
  }

  private _hookGlobalErrors() {
    this.unhandledRejectionHandler = (e: PromiseRejectionEvent) => {
      if (this.sensitivity === 'off') return;
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      this._emit({
        severity: 'error',
        category: 'network_error',
        title: 'Unhandled Error',
        message: `An unhandled error occurred: "${msg.slice(0, 100)}". This may affect app stability.`,
        autoHealable: false,
      });
    };

    this.globalErrorHandler = (e: ErrorEvent) => {
      if (this.sensitivity === 'off') return;
      this._emit({
        severity: 'critical',
        category: 'app_state',
        title: 'Critical App Error',
        message: `A critical error was caught: "${e.message}". Consider saving your work and refreshing.`,
        actionLabel: 'Refresh',
        action: () => window.location.reload(),
        autoHealable: true,
      });
    };

    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
    window.addEventListener('error', this.globalErrorHandler);
  }

  private _startPeriodicChecks() {
    this.monitorInterval = setInterval(() => {
      this._checkLocalStorageHealth();
    }, 60_000); // every 60 seconds
  }

  private _checkLocalStorageHealth() {
    try {
      const bids = localStorage.getItem('estimetric_bids');
      if (bids) {
        const parsed = JSON.parse(bids);
        if (!Array.isArray(parsed)) {
          this._emit({
            severity: 'error',
            category: 'data_inconsistency',
            title: 'Corrupted Local Data',
            message: 'Local bid data appears corrupted. Cloud sync will protect your data, but local cache should be cleared.',
            actionLabel: 'Clear Cache',
            action: () => { localStorage.removeItem('estimetric_bids'); window.location.reload(); },
            autoHealable: true,
          });
        }
      }
    } catch {
      this._emit({
        severity: 'error',
        category: 'self_healing',
        title: 'Local Storage Error',
        message: 'Could not read local storage. This may affect offline functionality.',
        autoHealable: false,
      });
    }
  }

  private _unhook() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    if (this.unhandledRejectionHandler) {
      window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
    }
    if (this.globalErrorHandler) {
      window.removeEventListener('error', this.globalErrorHandler);
    }
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

export const foremanWatchdog = new ForemanWatchdogService();
export type { SuggestionHandler };
