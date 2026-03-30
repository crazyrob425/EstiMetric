import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, User, DollarSign, Layers, FileCheck, FileClock, FileEdit } from 'lucide-react';
import { BidData } from '../types.ts';
import MetallicPanel from './MetallicPanel.tsx';
import { useCountUp } from '../hooks/useCountUp.ts';

interface VaultProjectCardProps {
  bid: BidData;
  currencySymbol: string;
  onAudit: (bid: BidData) => void;
}

const VaultProjectCard: React.FC<VaultProjectCardProps> = ({ bid, currencySymbol, onAudit }) => {
  const totalCost = (bid.materials?.reduce((acc, m) => acc + (m.unitPrice * (parseFloat(m.quantity) || 1)), 0) || 0) + (bid.laborCost || 0);
  const totalRef = useRef<HTMLSpanElement>(null);
  useCountUp(totalRef, totalCost, currencySymbol, 1000);

  const statusConfig: Record<string, { icon: React.ReactNode; cls: string }> = {
    Draft: { icon: <FileEdit size={10} />, cls: 'bg-slate-500/10 border-slate-500/20 text-slate-400' },
    Sent: { icon: <FileClock size={10} />, cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    Approved: { icon: <FileCheck size={10} />, cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  };
  const sc = statusConfig[bid.status] || statusConfig.Draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group cursor-pointer"
      onClick={() => onAudit(bid)}
    >
      <MetallicPanel className="border-transparent hover:border-blue-500/20 transition-colors duration-500 bg-[#0f172a]/40 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-[0.15em] border ${sc.cls}`}>
                {sc.icon} {bid.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{bid.projectName}</h3>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{bid.date}</span>
            <span className="text-blue-500/40 text-[8px] font-black tracking-widest mt-1">v3.0-ENTERPRISE</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <User size={14} className="text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Project Lead</span>
                <span className="text-xs font-bold text-slate-200">{bid.clientName || 'Private File'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Tier</span>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{bid.projectTier}</span>
              </div>
              <Layers size={14} className="text-blue-500" />
            </div>
          </div>

          <div className="flex items-end justify-between px-2 py-1">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Gross Valuation</span>
              <div className="flex items-center gap-1 mt-1">
                <DollarSign size={16} className="text-emerald-500" />
                <span ref={totalRef} className="text-2xl font-black text-white tracking-tighter">{currencySymbol}0</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-white/5 group-hover:bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 group-hover:border-blue-500 transition-all duration-300">
          Open Project Detail
        </button>
      </MetallicPanel>
    </motion.div>
  );
};

export default VaultProjectCard;
