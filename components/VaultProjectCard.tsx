import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, User, DollarSign, Layers } from 'lucide-react';
import { BidData } from '../types.ts';
import MetallicPanel from './MetallicPanel.tsx';

interface VaultProjectCardProps {
  bid: BidData;
  onAudit: (bid: BidData) => void;
}

const VaultProjectCard: React.FC<VaultProjectCardProps> = React.memo(({ bid, onAudit }) => {
  const totalCost = (bid.materials?.reduce((acc, m) => acc + (m.unitPrice * (parseFloat(m.quantity) || 1)), 0) || 0) + (bid.laborCost || 0);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group cursor-pointer"
      onClick={() => onAudit(bid)}
    >
      <MetallicPanel className="border-transparent hover:border-blue-500/20 transition-colors duration-500 bg-[#0f172a]/40 backdrop-blur-xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-[0.15em] border ${
                bid.status === 'Draft' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400' :
                bid.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
                {bid.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{bid.projectName}</h3>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{bid.date}</span>
            <span className="text-blue-500/60 text-[8px] font-black tracking-widest mt-1">v.2.0-STABLE</span>
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
                <span className="text-2xl font-black text-white tracking-tighter">${totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>

        <button 
          className="w-full py-4 bg-white/5 group-hover:bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 group-hover:border-blue-500 transition-all duration-300"
        >
          Audit Project Ledger
        </button>
      </MetallicPanel>
    </motion.div>
  );
});

VaultProjectCard.displayName = 'VaultProjectCard';

export default VaultProjectCard;