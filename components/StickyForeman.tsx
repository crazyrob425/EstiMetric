import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, X, ChevronRight, AlertTriangle, Zap, Info, Trash2 } from 'lucide-react';
import { useWatchdog } from '../hooks/useWatchdog.ts';
import { WatchdogSuggestion, ForemanAlertState } from '../types/watchdog.ts';

interface StickyForemanProps {
  onOpenForeman: () => void;
}

const severityIcon = (severity: WatchdogSuggestion['severity']) => {
  switch (severity) {
    case 'critical':
    case 'error':
      return <AlertTriangle size={14} className="text-red-400" />;
    case 'warning':
      return <AlertTriangle size={14} className="text-amber-400" />;
    case 'tip':
      return <Zap size={14} className="text-emerald-400" />;
    default:
      return <Info size={14} className="text-blue-400" />;
  }
};

const alertStateStyles: Record<ForemanAlertState, string> = {
  idle: 'opacity-60 shadow-[0_0_16px_rgba(251,191,36,0.2)]',
  attention: 'opacity-90 shadow-[0_0_24px_rgba(251,191,36,0.4)]',
  warning: 'opacity-100 shadow-[0_0_32px_rgba(251,191,36,0.6)] animate-watchdog-pulse',
  error: 'opacity-100 shadow-[0_0_40px_rgba(239,68,68,0.7)] animate-watchdog-strobe',
};

const StickyForeman: React.FC<StickyForemanProps> = ({ onOpenForeman }) => {
  const { alertState, unreadCount, suggestions, dismissSuggestion, clearAllSuggestions } = useWatchdog();
  const [showPanel, setShowPanel] = useState(false);
  const [poppedSuggestion, setPoppedSuggestion] = useState<WatchdogSuggestion | null>(null);
  const prevAlertState = useRef<ForemanAlertState>('idle');
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-pop latest unread suggestion when alert escalates
  useEffect(() => {
    const escalated =
      alertState !== 'idle' &&
      alertState !== prevAlertState.current &&
      (alertState === 'warning' || alertState === 'error');

    if (escalated) {
      const latest = suggestions.find(s => !s.dismissed);
      if (latest) {
        setPoppedSuggestion(latest);
        if (popTimer.current) clearTimeout(popTimer.current);
        popTimer.current = setTimeout(() => setPoppedSuggestion(null), 8000);
      }
    }
    prevAlertState.current = alertState;
    return () => {
      if (popTimer.current) clearTimeout(popTimer.current);
    };
  }, [alertState, suggestions]);

  const handleForemanClick = () => {
    setShowPanel(false);
    setPoppedSuggestion(null);
    onOpenForeman();
  };

  const handleDismissPopped = () => {
    if (poppedSuggestion) {
      dismissSuggestion(poppedSuggestion.id);
      setPoppedSuggestion(null);
    }
  };

  return (
    <>
      {/* Sticky Hardhat Button */}
      <motion.div
        className="fixed bottom-28 left-6 z-[90] flex flex-col items-start gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => setShowPanel(v => !v)}
          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center transition-all border border-amber-300/40 ${alertStateStyles[alertState]}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title="AI Foreman Watchdog"
          aria-label="AI Foreman Watchdog"
        >
          <HardHat size={26} className="text-slate-900" />
          {/* Badge */}
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center px-1 ${
                alertState === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
              }`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>
      </motion.div>

      {/* Popped Suggestion Bubble */}
      <AnimatePresence>
        {poppedSuggestion && !showPanel && (
          <motion.div
            key="popped"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-44 left-6 z-[90] max-w-[280px]"
          >
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-start gap-2 mb-2">
                {severityIcon(poppedSuggestion.severity)}
                <p className="text-[11px] font-black text-white uppercase tracking-widest leading-tight flex-1">
                  {poppedSuggestion.title}
                </p>
                <button
                  onClick={handleDismissPopped}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{poppedSuggestion.message}</p>
              <div className="flex gap-2">
                {poppedSuggestion.actionLabel && poppedSuggestion.action && (
                  <button
                    onClick={() => { poppedSuggestion.action!(); handleDismissPopped(); }}
                    className="flex-1 py-1.5 px-3 bg-amber-500/20 border border-amber-500/40 rounded-lg text-[10px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500/30 transition-all"
                  >
                    {poppedSuggestion.actionLabel}
                  </button>
                )}
                <button
                  onClick={handleForemanClick}
                  className="flex items-center gap-1 py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Foreman <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: -20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-44 left-6 z-[90] w-80"
          >
            <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <HardHat size={16} className="text-amber-400" />
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">AI Foreman</span>
                  {unreadCount > 0 && (
                    <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {suggestions.some(s => !s.dismissed) && (
                    <button
                      onClick={clearAllSuggestions}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title="Clear all"
                      aria-label="Clear all suggestions"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label="Close panel"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="max-h-72 overflow-y-auto">
                {suggestions.filter(s => !s.dismissed).length === 0 ? (
                  <div className="py-8 px-5 text-center">
                    <HardHat size={28} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">All clear — no issues detected</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-2">
                    {suggestions.filter(s => !s.dismissed).map(s => (
                      <div
                        key={s.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 group"
                      >
                        <div className="flex items-start gap-2 mb-1.5">
                          {severityIcon(s.severity)}
                          <p className="text-[11px] font-black text-white flex-1 leading-tight">{s.title}</p>
                          <button
                            onClick={() => dismissSuggestion(s.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-all"
                            aria-label="Dismiss suggestion"
                          >
                            <X size={11} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{s.message}</p>
                        {s.actionLabel && s.action && (
                          <button
                            onClick={() => { s.action!(); dismissSuggestion(s.id); }}
                            className="text-[10px] font-black text-amber-400 uppercase tracking-widest hover:text-amber-300 transition-colors"
                          >
                            {s.actionLabel} →
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Open full Foreman */}
              <div className="border-t border-white/10 p-3">
                <button
                  onClick={handleForemanClick}
                  className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  Open Foreman Chat <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickyForeman;
