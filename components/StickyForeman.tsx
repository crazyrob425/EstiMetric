import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, X, ChevronRight, MessageSquare, AlertTriangle, Info, CheckCircle, Bell, BellOff, Trash2 } from 'lucide-react';
import { useAppWatchdog } from '../hooks/useWatchdog.ts';
import { WatchdogAlert, AppSection } from '../services/ForemanWatchdog.ts';
import { WatchdogSensitivity } from '../contexts/watchdogTypes.ts';

// ─── Alert Badge colours ────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<WatchdogAlert['level'], { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  tip: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-500/40',
    icon: <Info size={14} className="text-blue-400 shrink-0" />,
    label: 'Tip'
  },
  warning: {
    bg: 'bg-amber-900/90',
    border: 'border-amber-500/40',
    icon: <AlertTriangle size={14} className="text-amber-400 shrink-0" />,
    label: 'Warning'
  },
  critical: {
    bg: 'bg-red-900/90',
    border: 'border-red-500/40',
    icon: <AlertTriangle size={14} className="text-red-400 shrink-0" />,
    label: 'Critical'
  }
};

const SENSITIVITY_OPTIONS: { value: WatchdogSensitivity; label: string }[] = [
  { value: 'off',    label: 'Off'    },
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   }
];

// ─── Strobe animation variants ──────────────────────────────────────────────────
const strobeVariants = {
  strobing: {
    opacity: [1, 0.3, 1, 0.3, 1, 0.3, 1],
    scale:   [1, 1.15, 1, 1.15, 1, 1.15, 1],
    transition: { duration: 1.8, ease: 'easeInOut' }
  },
  idle: {
    opacity: 0.85,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// ─── StickyForeman Component ────────────────────────────────────────────────────

interface StickyForemanProps {
  onOpenChat: () => void;
  onNavigate: (section: AppSection) => void;
}

const StickyForeman: React.FC<StickyForemanProps> = ({ onOpenChat, onNavigate }) => {
  const {
    alerts,
    activeAlert,
    isStrobing,
    sensitivity,
    setSensitivity,
    dismissAlert,
    dismissActiveAlert,
    clearMemories,
    memories
  } = useAppWatchdog();

  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<'alerts' | 'memory' | 'settings'>('alerts');
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = alerts.filter(a => !a.dismissed).length;

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  const handleAlertAction = (alert: WatchdogAlert) => {
    if (alert.targetTab) onNavigate(alert.targetTab);
    if (alert.action === 'Open Foreman') onOpenChat();
    dismissAlert(alert.id);
    dismissActiveAlert();
    setPanelOpen(false);
  };

  return (
    <>
      {/* ── Active alert toast ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeAlert && !panelOpen && (
          <motion.div
            key={activeAlert.id}
            initial={{ opacity: 0, y: 20, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-28 right-6 z-[200] max-w-xs w-72 rounded-2xl border backdrop-blur-xl p-4 shadow-2xl ${LEVEL_STYLES[activeAlert.level].bg} ${LEVEL_STYLES[activeAlert.level].border}`}
          >
            <div className="flex items-start gap-3">
              {LEVEL_STYLES[activeAlert.level].icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">
                  {activeAlert.title}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeAlert.message}
                </p>
                {activeAlert.action && (
                  <button
                    onClick={() => handleAlertAction(activeAlert)}
                    className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300"
                  >
                    {activeAlert.action} <ChevronRight size={10} />
                  </button>
                )}
              </div>
              <button
                onClick={dismissActiveAlert}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
                aria-label="Dismiss alert"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky hardhat icon ──────────────────────────────────────────────── */}
      <motion.div
        className="fixed bottom-6 right-6 z-[210] flex flex-col items-center gap-1"
        animate={isStrobing ? 'strobing' : 'idle'}
        variants={strobeVariants}
      >
        {/* Unread badge */}
        {unreadCount > 0 && !panelOpen && (
          <motion.div
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center z-10 shadow-lg"
          >
            <span className="text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </motion.div>
        )}

        <button
          onClick={() => setPanelOpen(v => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-90 ${
            isStrobing
              ? 'bg-yellow-400 shadow-yellow-400/60 ring-4 ring-yellow-300/60'
              : 'bg-yellow-400/85 hover:bg-yellow-400 shadow-yellow-400/30'
          }`}
          aria-label="Open Foreman Watchdog panel"
          title="Foreman Watchdog"
        >
          <HardHat size={28} className="text-slate-900" strokeWidth={2.5} />
        </button>
        <span className="text-[8px] font-black uppercase tracking-widest text-yellow-400/80">
          Foreman
        </span>
      </motion.div>

      {/* ── Slide-out panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            ref={panelRef}
            key="foreman-panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-24 right-6 z-[220] w-80 rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <HardHat size={18} className="text-yellow-400" />
                <span className="text-sm font-black uppercase tracking-widest text-white">Foreman</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenChat}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Open chat"
                  aria-label="Open Foreman chat"
                >
                  <MessageSquare size={15} />
                </button>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close panel"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-white/10">
              {(['alerts', 'memory', 'settings'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    tab === t ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t === 'alerts' ? `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ''}` : t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">

              {/* ── Alerts tab ── */}
              {tab === 'alerts' && (
                <div className="p-3 space-y-2">
                  {alerts.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-slate-500">
                      <CheckCircle size={28} />
                      <p className="text-[11px] font-bold uppercase tracking-widest">All clear – no issues detected</p>
                    </div>
                  ) : (
                    alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`rounded-xl border p-3 ${LEVEL_STYLES[alert.level].bg} ${LEVEL_STYLES[alert.level].border}`}
                      >
                        <div className="flex items-start gap-2">
                          {LEVEL_STYLES[alert.level].icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-0.5">
                              {alert.title}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{alert.message}</p>
                            {alert.action && (
                              <button
                                onClick={() => handleAlertAction(alert)}
                                className="mt-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300"
                              >
                                {alert.action} <ChevronRight size={9} />
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                            aria-label={`Dismiss alert: ${alert.title}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Memory tab ── */}
              {tab === 'memory' && (
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {memories.length} task {memories.length === 1 ? 'memory' : 'memories'}
                    </p>
                    {memories.length > 0 && (
                      <button
                        onClick={clearMemories}
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300"
                        aria-label="Clear all memories"
                      >
                        <Trash2 size={10} /> Clear
                      </button>
                    )}
                  </div>
                  {memories.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-2 text-slate-500">
                      <Info size={28} />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-center">
                        No memories yet.<br />Complete tasks to build the Foreman's knowledge.
                      </p>
                    </div>
                  ) : (
                    [...memories].reverse().map(m => (
                      <div key={m.id} className="rounded-xl bg-slate-800/60 border border-white/5 p-3">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{m.section}</span>
                          <span className="text-[9px] text-slate-500">{new Date(m.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold">{m.action}</p>
                        {m.notes && <p className="text-[10px] text-slate-500 mt-0.5 italic">{m.notes}</p>}
                        {m.outcome && (
                          <span className={`mt-1 inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            m.outcome === 'success' ? 'bg-emerald-900/60 text-emerald-400' :
                            m.outcome === 'error'   ? 'bg-red-900/60 text-red-400' :
                                                      'bg-slate-700 text-slate-400'
                          }`}>
                            {m.outcome}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Settings tab ── */}
              {tab === 'settings' && (
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Watchdog Sensitivity
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {SENSITIVITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSensitivity(opt.value)}
                          className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                            sensitivity === opt.value
                              ? 'bg-yellow-400 text-slate-900'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[9px] text-slate-500">
                      {sensitivity === 'off'    && 'Watchdog is disabled. No alerts will be shown.'}
                      {sensitivity === 'low'    && 'Only warnings and critical issues will be shown.'}
                      {sensitivity === 'medium' && 'Warnings, critical issues, and important tips.'}
                      {sensitivity === 'high'   && 'All alerts including minor tips and suggestions.'}
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Notifications
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300">Alert toasts</span>
                      {sensitivity === 'off' ? (
                        <BellOff size={14} className="text-slate-600" />
                      ) : (
                        <Bell size={14} className="text-yellow-400" />
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <button
                      onClick={onOpenChat}
                      className="w-full py-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} /> Open Foreman Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickyForeman;
