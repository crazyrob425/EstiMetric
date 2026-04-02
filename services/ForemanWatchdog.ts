/**
 * ForemanWatchdog.ts
 * System-level monitoring engine for the EstiMetric Foreman AI.
 * Watches user behavior, app errors, and data consistency in real time.
 */

export type AlertLevel = 'tip' | 'warning' | 'critical';
export type AppSection = 'home' | 'vault' | 'new' | 'toolbox' | 'foreman';

export interface WatchdogAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  action?: string;
  targetTab?: AppSection;
  timestamp: number;
  dismissed?: boolean;
}

export interface TaskMemory {
  id: string;
  section: AppSection;
  action: string;
  details: Record<string, unknown>;
  timestamp: number;
  outcome?: 'success' | 'error' | 'abandoned';
  notes?: string;
}

export interface BehaviorEvent {
  type: 'nav' | 'form_start' | 'form_abandon' | 'submit' | 'error' | 'idle' | 'action';
  section: AppSection;
  detail?: string;
  timestamp: number;
}

const STORAGE_KEY_MEMORIES = 'foreman_task_memories';
const STORAGE_KEY_EVENTS   = 'foreman_behavior_events';
const MAX_EVENTS = 200;
const MAX_MEMORIES = 100;
const IDLE_THRESHOLD_MS = 45_000;

// ─── Persistence helpers ───────────────────────────────────────────────────────

function loadMemories(): TaskMemory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORIES);
    return raw ? (JSON.parse(raw) as TaskMemory[]) : [];
  } catch { return []; }
}

function saveMemories(memories: TaskMemory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories.slice(-MAX_MEMORIES)));
  } catch { /* storage full */ }
}

function loadEvents(): BehaviorEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    return raw ? (JSON.parse(raw) as BehaviorEvent[]) : [];
  } catch { return []; }
}

function saveEvents(events: BehaviorEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch { /* storage full */ }
}

// ─── Core watchdog class ───────────────────────────────────────────────────────

type AlertCallback = (alert: WatchdogAlert) => void;

class ForemanWatchdogEngine {
  private events: BehaviorEvent[] = loadEvents();
  private memories: TaskMemory[] = loadMemories();
  private listeners: AlertCallback[] = [];
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private currentSection: AppSection = 'home';
  private sessionStart = Date.now();
  private formStarted = false;
  private errorCount = 0;

  // ── Global error hooks ──────────────────────────────────────────────────────
  install(): void {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    this.resetIdleTimer();
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, this.resetIdleTimer, { passive: true })
    );
  }

  uninstall(): void {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
      window.removeEventListener(evt, this.resetIdleTimer)
    );
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  onAlert(cb: AlertCallback): () => void {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  recordNavigation(section: AppSection): void {
    this.currentSection = section;
    this.formStarted = false;
    this.addEvent({ type: 'nav', section, timestamp: Date.now() });
    this.analyseNavPattern();
  }

  recordFormStart(section: AppSection): void {
    this.formStarted = true;
    this.addEvent({ type: 'form_start', section, timestamp: Date.now() });
  }

  recordFormAbandon(section: AppSection): void {
    if (this.formStarted) {
      this.addEvent({ type: 'form_abandon', section, timestamp: Date.now() });
      this.formStarted = false;
      this.emit({
        id: `abandon-${Date.now()}`,
        level: 'tip',
        title: 'Unfinished bid detected',
        message: 'You left the bid wizard before completing it. Tap here to resume or start a new one.',
        action: 'Resume Bid',
        targetTab: 'new',
        timestamp: Date.now()
      });
    }
  }

  recordSubmit(section: AppSection, detail?: string): void {
    this.formStarted = false;
    this.addEvent({ type: 'submit', section, detail, timestamp: Date.now() });
    this.storeMemory({
      id: `mem-${Date.now()}`,
      section,
      action: 'submit',
      details: { detail },
      timestamp: Date.now(),
      outcome: 'success'
    });
  }

  recordError(section: AppSection, detail: string): void {
    this.errorCount++;
    this.addEvent({ type: 'error', section, detail, timestamp: Date.now() });
    if (this.errorCount >= 3) {
      this.emit({
        id: `errors-${Date.now()}`,
        level: 'critical',
        title: 'Recurring errors detected',
        message: `The Foreman has noticed ${this.errorCount} errors in this session. Ask for help to diagnose the issue.`,
        action: 'Ask Foreman',
        targetTab: 'foreman',
        timestamp: Date.now()
      });
      this.errorCount = 0;
    }
  }

  recordAction(section: AppSection, detail: string): void {
    this.addEvent({ type: 'action', section, detail, timestamp: Date.now() });
  }

  storeMemory(memory: TaskMemory): void {
    this.memories = [...this.memories, memory];
    saveMemories(this.memories);
  }

  recallSimilarMemories(section: AppSection, limit = 5): TaskMemory[] {
    return this.memories
      .filter(m => m.section === section)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getAllMemories(): TaskMemory[] {
    return [...this.memories];
  }

  clearMemories(): void {
    this.memories = [];
    saveMemories([]);
  }

  getRecentEvents(limit = 20): BehaviorEvent[] {
    return this.events.slice(-limit);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private addEvent(event: BehaviorEvent): void {
    this.events = [...this.events, event];
    saveEvents(this.events);
  }

  private emit(alert: WatchdogAlert): void {
    this.listeners.forEach(l => l(alert));
  }

  private analyseNavPattern(): void {
    const recent = this.events.filter(e => e.type === 'nav').slice(-6);
    if (recent.length < 4) return;

    // Detect rapid back-and-forth (confused user)
    const sections = recent.map(e => e.section);
    const bounces = sections.filter((s, i) => i > 0 && s === sections[i - 2]).length;
    if (bounces >= 2) {
      this.emit({
        id: `nav-bounce-${Date.now()}`,
        level: 'tip',
        title: 'Looks like you need help navigating',
        message: "The Foreman noticed you've been jumping between sections. Would you like a guided tour of the app?",
        action: 'Open Foreman',
        targetTab: 'foreman',
        timestamp: Date.now()
      });
    }

    // No vault visits after several bids submitted → remind user to review
    const submits = this.events.filter(e => e.type === 'submit' && e.section === 'new').length;
    const vaultVisits = this.events.filter(e => e.type === 'nav' && e.section === 'vault').length;
    if (submits > 0 && vaultVisits === 0) {
      this.emit({
        id: `vault-remind-${Date.now()}`,
        level: 'tip',
        title: 'Check your Project Vault',
        message: "You've completed a bid but haven't visited the Vault yet. Your work is saved there.",
        action: 'Go to Vault',
        targetTab: 'vault',
        timestamp: Date.now()
      });
    }
  }

  private handleWindowError = (event: ErrorEvent): void => {
    const section = this.currentSection;
    this.recordError(section, event.message || 'Unknown JS error');
    if (event.message && !event.message.toLowerCase().includes('script error')) {
      this.emit({
        id: `jserr-${Date.now()}`,
        level: 'warning',
        title: 'App error detected',
        message: `The Foreman caught an unexpected error: "${event.message.slice(0, 80)}". Monitoring for stability.`,
        timestamp: Date.now()
      });
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'Unknown promise rejection');
    this.recordError(this.currentSection, msg);
    this.emit({
      id: `rejection-${Date.now()}`,
      level: 'warning',
      title: 'Network or async error',
      message: `A background operation failed: "${msg.slice(0, 80)}". The Foreman is monitoring.`,
      timestamp: Date.now()
    });
  };

  private resetIdleTimer = (): void => {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      const sessionMinutes = Math.round((Date.now() - this.sessionStart) / 60_000);
      this.emit({
        id: `idle-${Date.now()}`,
        level: 'tip',
        title: "Still here?",
        message: `You've been on the ${this.currentSection} screen for a while. Need help with anything? Tap the Foreman.`,
        action: 'Open Foreman',
        targetTab: 'foreman',
        timestamp: Date.now()
      });
      // Record idle event for memory
      this.addEvent({ type: 'idle', section: this.currentSection, timestamp: Date.now(), detail: `${sessionMinutes}min session` });
    }, IDLE_THRESHOLD_MS);
  };
}

export const foremanWatchdog = new ForemanWatchdogEngine();
