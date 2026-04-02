import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X, Ruler, Thermometer, Magnet, Activity, HardHat, PlusCircle, Database, LayoutDashboard, ChevronRight } from 'lucide-react';
import { AppSection } from '../services/ForemanWatchdog.ts';

// ─── Tool definitions ───────────────────────────────────────────────────────────

interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  action: 'navigate' | 'open-toolbox-tool';
  target?: AppSection;
  toolboxTool?: string;
  color: string;
}

const TOOLS: Tool[] = [
  {
    id: 'new-bid',
    icon: <PlusCircle size={22} />,
    label: 'New Bid',
    description: 'Start a new project survey & takeoff',
    action: 'navigate',
    target: 'new',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'vault',
    icon: <Database size={22} />,
    label: 'Project Vault',
    description: 'View saved bids and historical data',
    action: 'navigate',
    target: 'vault',
    color: 'from-slate-600 to-slate-700'
  },
  {
    id: 'measure',
    icon: <Ruler size={22} />,
    label: 'Measure',
    description: 'AR spatial measurement tool',
    action: 'navigate',
    target: 'toolbox',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'thermal',
    icon: <Thermometer size={22} />,
    label: 'Thermal',
    description: 'Surface thermal analysis via camera',
    action: 'navigate',
    target: 'toolbox',
    color: 'from-orange-600 to-red-700'
  },
  {
    id: 'studs',
    icon: <Magnet size={22} />,
    label: 'Stud Finder',
    description: 'Detect structural studs via magnetometer',
    action: 'navigate',
    target: 'toolbox',
    color: 'from-purple-600 to-violet-700'
  },
  {
    id: 'stability',
    icon: <Activity size={22} />,
    label: 'Stability',
    description: 'Seismic / structural vibration monitor',
    action: 'navigate',
    target: 'toolbox',
    color: 'from-yellow-600 to-amber-700'
  },
  {
    id: 'home',
    icon: <LayoutDashboard size={22} />,
    label: 'Dashboard',
    description: 'Return to the main dashboard',
    action: 'navigate',
    target: 'home',
    color: 'from-slate-500 to-slate-600'
  },
  {
    id: 'foreman',
    icon: <HardHat size={22} />,
    label: 'Foreman',
    description: 'Open the AI Foreman assistant',
    action: 'navigate',
    target: 'foreman',
    color: 'from-yellow-500 to-orange-600'
  }
];

// ─── Animation variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25, staggerChildren: 0.04 }
  },
  exit: { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

// ─── ToolboxHub Component ───────────────────────────────────────────────────────

interface ToolboxHubProps {
  onNavigate: (section: AppSection) => void;
}

const ToolboxHub: React.FC<ToolboxHubProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleTool = (tool: Tool) => {
    if (tool.action === 'navigate' && tool.target) {
      onNavigate(tool.target);
    }
    setOpen(false);
  };

  const hovered = hoveredTool ? TOOLS.find(t => t.id === hoveredTool) : null;

  return (
    <div ref={containerRef} className="fixed bottom-6 left-6 z-[200] flex flex-col items-start gap-2">

      {/* ── Grid panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="toolbox-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-2 w-72 rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-emerald-400" />
                <span className="text-sm font-black uppercase tracking-widest text-white">ToolboxHub</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                aria-label="Close toolbox"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tooltip description */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  key={hovered.id + '-desc'}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 overflow-hidden"
                >
                  <div className="py-2 flex items-center gap-2">
                    <ChevronRight size={10} className="text-slate-500 shrink-0" />
                    <p className="text-[10px] text-slate-400 font-bold">{hovered.description}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tool grid */}
            <div className="grid grid-cols-4 gap-2 p-4">
              {TOOLS.map(tool => (
                <motion.button
                  key={tool.id}
                  variants={itemVariants}
                  onClick={() => handleTool(tool)}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 bg-gradient-to-br ${tool.color} transition-all duration-150 hover:scale-105 hover:shadow-lg active:scale-95 text-white`}
                  title={tool.label}
                  aria-label={tool.label}
                >
                  <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                    {tool.icon}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest leading-none text-center">
                    {tool.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating trigger button ─────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-1">
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileTap={{ scale: 0.9 }}
          animate={open ? { rotate: 45 } : { rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-200 ${
            open
              ? 'bg-red-500 shadow-red-500/40'
              : 'bg-emerald-500/90 hover:bg-emerald-400 shadow-emerald-500/40'
          }`}
          aria-label={open ? 'Close toolbox' : 'Open toolbox'}
          title="ToolboxHub"
        >
          {open ? <X size={26} className="text-white" /> : <Wrench size={26} className="text-white" />}
        </motion.button>
        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/80">
          Tools
        </span>
      </div>
    </div>
  );
};

export default ToolboxHub;
