import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X, Camera, Sun, Compass, Calculator, Tag, Images, Wrench, Activity } from 'lucide-react';

interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  available: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'spatial',
    icon: <Ruler size={28} />,
    label: 'Spatial Measure',
    description: '3D room mapping with AR overlay. Click two points on the camera view to measure real-world distances.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    available: true,
  },
  {
    id: 'ar-tape',
    icon: <Camera size={28} />,
    label: 'AR Tape Measure',
    description: 'Use your device camera to measure surfaces and spaces with augmented reality precision.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    available: true,
  },
  {
    id: 'lux',
    icon: <Sun size={28} />,
    label: 'Ambient Light',
    description: 'Lux meter using device sensors. Detect light conditions for accurate material and finish recommendations.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/40',
    available: true,
  },
  {
    id: 'magneto',
    icon: <Compass size={28} />,
    label: 'Magnetometer',
    description: 'Compass & stud detector. Locate metal framing, pipes, and electrical conduit behind walls.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    available: true,
  },
  {
    id: 'thermal',
    icon: <Activity size={28} />,
    label: 'Thermal Auditor',
    description: 'Surface thermal analysis using AI vision. Detect heat anomalies, insulation issues, and moisture.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    available: true,
  },
  {
    id: 'materials',
    icon: <Calculator size={28} />,
    label: 'Material Calc',
    description: 'Smart material quantity calculator. Input room dimensions and get precise material lists instantly.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    available: false,
  },
  {
    id: 'price-lookup',
    icon: <Tag size={28} />,
    label: 'Price Lookup',
    description: 'Real-time pricing from Home Depot, Lowes, and regional suppliers. Compare and lock in material costs.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/40',
    available: false,
  },
  {
    id: 'comparison',
    icon: <Images size={28} />,
    label: 'Before/After',
    description: 'Side-by-side before and after photo comparison tool. Perfect for client presentations and approvals.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/40',
    available: false,
  },
  {
    id: 'custom',
    icon: <Wrench size={28} />,
    label: 'Custom Slot',
    description: 'Reserved for your custom tool integrations. Contact EstiMetric Enterprise to configure a custom sensor module.',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/40',
    available: false,
  },
];

interface ToolboxHubProps {
  onOpenTool: (toolId: string) => void;
}

const ToolboxHub: React.FC<ToolboxHubProps> = ({ onOpenTool }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleToolClick = (tool: Tool) => {
    if (!tool.available) return;
    setIsExpanded(false);
    onOpenTool(tool.id);
  };

  return (
    <>
      {/* Floating Trigger Icon */}
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-28 right-6 z-[90] w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.5)] border border-emerald-400/40 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        title="Open Virtual Toolbox"
        aria-label="Open Virtual Toolbox"
      >
        <Ruler size={24} className="text-white" />
      </motion.button>

      {/* Expanded Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="toolbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-white">Virtual Toolbox</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Select a sensor tool to launch</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                aria-label="Close toolbox"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tools Grid */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
                {TOOLS.map((tool, idx) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative"
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    <button
                      onClick={() => handleToolClick(tool)}
                      className={`w-full rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all duration-200 ${
                        tool.available
                          ? `${tool.bgColor} ${tool.borderColor} hover:scale-105 hover:shadow-lg cursor-pointer`
                          : 'bg-slate-800/40 border-slate-700/40 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`${tool.color} ${tool.available ? '' : 'text-slate-500'}`}>
                        {tool.icon}
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest text-center leading-tight ${tool.available ? 'text-white' : 'text-slate-500'}`}>
                        {tool.label}
                      </span>
                      {!tool.available && (
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Coming Soon</span>
                      )}
                    </button>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {hoveredTool === tool.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 z-10 pointer-events-none"
                        >
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
                            <p className="text-xs font-bold text-white mb-1">{tool.label}</p>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{tool.description}</p>
                            {!tool.available && (
                              <p className="text-[10px] text-amber-500 font-bold mt-1 uppercase tracking-widest">Not yet available</p>
                            )}
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 overflow-hidden">
                            <div className="w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45 -translate-y-1.5 mx-auto" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ToolboxHub;
