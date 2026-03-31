import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, FileText, DollarSign, Package, User, Calendar, Layers, ChevronRight, Printer, LayoutDashboard, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { toast } from 'react-hot-toast';
import { BidData } from '../types.ts';
import BidPDFExporter from './BidPDFExporter.tsx';
import { useCountUp } from '../hooks/useCountUp.ts';

interface Props {
  bid: BidData;
  currencySymbol: string;
  onClose: () => void;
  onDelete: (bid: BidData) => void;
  onStatusChange: (bid: BidData, status: BidData['status']) => void;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f97316', '#ec4899', '#14b8a6'];

const ProjectDetailModal: React.FC<Props> = ({ bid, currencySymbol, onClose, onDelete, onStatusChange }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'materials' | 'proposal' | 'export'>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const [showPDF, setShowPDF] = useState(false);

  const materialTotal = bid.materials?.reduce((acc, m) => acc + (m.unitPrice * (parseFloat(m.quantity) || 1)), 0) || 0;
  const laborCost = bid.laborCost || 0;
  const markup = materialTotal * ((bid as any).markupPercent || 0) / 100;
  const grandTotal = materialTotal + laborCost + markup;

  const pieData = [
    { name: 'Materials', value: materialTotal },
    { name: 'Labor', value: laborCost },
    ...(markup > 0 ? [{ name: 'Markup', value: markup }] : []),
  ].filter(d => d.value > 0);

  const topMaterials = [...(bid.materials || [])]
    .sort((a, b) => (b.unitPrice * (parseFloat(b.quantity) || 1)) - (a.unitPrice * (parseFloat(a.quantity) || 1)))
    .slice(0, 8)
    .map(m => ({ name: m.name.slice(0, 18), cost: m.unitPrice * (parseFloat(m.quantity) || 1) }));

  // Animate the grand total counter on mount using RAF hook
  useCountUp(totalRef, grandTotal, currencySymbol, 1200);

  // Before/after slider handlers
  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };
  const handleSliderTouchMove = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  const statusOptions: { value: BidData['status']; label: string; color: string }[] = [
    { value: 'Draft', label: 'Draft', color: 'bg-slate-500/10 border-slate-500/20 text-slate-400' },
    { value: 'Sent', label: 'Sent', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    { value: 'Approved', label: 'Approved', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-stretch">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="relative ml-auto w-full max-w-3xl h-full overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(8,15,30,1) 100%)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-8 pb-6 border-b border-white/5 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {statusOptions.map(s => (
                  <button
                    key={s.value}
                    onClick={() => onStatusChange(bid, s.value)}
                    className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.15em] border transition-all ${
                      bid.status === s.value
                        ? s.color + ' ring-1 ring-current'
                        : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {bid.status === s.value && '● '}{s.label}
                  </button>
                ))}
              </div>
              <h2 className="text-2xl font-black text-white truncate">{bid.projectName}</h2>
              <p className="text-sm text-slate-500 font-bold mt-1">{bid.clientName} · {bid.date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-xl border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Grand Total Banner */}
          <div className="px-8 py-5 bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border-b border-white/5 shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gross Valuation</div>
                <span ref={totalRef} className="text-4xl font-black text-white tracking-tighter">
                  {currencySymbol}0
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-right">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tier</div>
                <span className="text-sm font-black text-blue-400 uppercase tracking-widest">{bid.projectTier}</span>
              </div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 p-4 pb-0 shrink-0 no-scrollbar overflow-x-auto">
            {[
              { id: 'overview', icon: <LayoutDashboard size={12} />, label: 'Overview' },
              { id: 'materials', icon: <Package size={12} />, label: 'Materials' },
              { id: 'proposal', icon: <FileText size={12} />, label: 'Proposal' },
              { id: 'export', icon: <Printer size={12} />, label: 'Export' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap transition-all ${
                  activeSection === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6 pb-20">
            <AnimatePresence mode="wait">

              {/* OVERVIEW SECTION */}
              {activeSection === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

                  {/* Before/After Slider */}
                  {(bid.beforePhoto || bid.afterMockup) && (
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Before / After Projection</div>
                      {bid.beforePhoto && bid.afterMockup ? (
                        <div
                          ref={sliderRef}
                          className="relative aspect-video rounded-3xl overflow-hidden select-none cursor-ew-resize luxury-shadow"
                          onMouseMove={handleSliderMouseMove}
                          onMouseDown={() => setIsDragging(true)}
                          onMouseUp={() => setIsDragging(false)}
                          onMouseLeave={() => setIsDragging(false)}
                          onTouchMove={handleSliderTouchMove}
                          onTouchStart={() => setIsDragging(true)}
                          onTouchEnd={() => setIsDragging(false)}
                        >
                          {/* After (full width) */}
                          <img src={bid.afterMockup} className="absolute inset-0 w-full h-full object-cover" />
                          {/* Before (clipped left side) */}
                          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                            <img
                              src={`data:image/jpeg;base64,${bid.beforePhoto}`}
                              className="w-full h-full object-cover"
                              style={{ width: `${sliderPos > 0 ? 100 / (sliderPos / 100) : 100}%`, maxWidth: 'none' }}
                            />
                          </div>
                          {/* Divider */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                              <ChevronRight size={12} className="text-slate-700 -mr-1" />
                              <ChevronRight size={12} className="text-slate-700 rotate-180 -ml-1" />
                            </div>
                          </div>
                          <div className="absolute top-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">Before</div>
                          <div className="absolute top-3 right-3 bg-blue-600/90 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">AI Projection</div>
                        </div>
                      ) : bid.afterMockup ? (
                        <img src={bid.afterMockup} className="w-full aspect-video object-cover rounded-3xl luxury-shadow" />
                      ) : (
                        <img src={`data:image/jpeg;base64,${bid.beforePhoto}`} className="w-full aspect-video object-cover rounded-3xl luxury-shadow" />
                      )}
                    </div>
                  )}

                  {/* Cost Breakdown Charts */}
                  {pieData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Cost Distribution</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                              {pieData.map((_, index) => (
                                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v: any) => [`${currencySymbol}${Number(v).toLocaleString()}`, '']}
                              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {pieData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                              <span className="text-[10px] font-bold text-slate-400">{d.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {topMaterials.length > 0 && (
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Top Materials by Cost</div>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topMaterials} layout="vertical" margin={{ left: 0, right: 16 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={v => `${currencySymbol}${v}`} />
                              <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} width={80} />
                              <Tooltip
                                formatter={(v: any) => [`${currencySymbol}${Number(v).toLocaleString()}`, 'Cost']}
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                              />
                              <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <User size={14} />, label: 'Client', value: bid.clientName || '—' },
                      { icon: <Calendar size={14} />, label: 'Date', value: bid.date || '—' },
                      { icon: <Layers size={14} />, label: 'Tier', value: bid.projectTier || '—' },
                      { icon: <DollarSign size={14} />, label: 'Labor', value: `${currencySymbol}${(bid.laborCost || 0).toLocaleString()}` },
                    ].map(item => (
                      <div key={item.label} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="text-blue-500 shrink-0">{item.icon}</div>
                        <div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>
                          <div className="text-sm font-bold text-white">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Reasoning Log */}
                  {bid.aiReasoningLog && bid.aiReasoningLog.length > 0 && (
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">AI Reasoning Chain</div>
                      <ol className="space-y-2">
                        {bid.aiReasoningLog.map((step, i) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium">
                            <span className="text-blue-500 font-black shrink-0">{i + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </motion.div>
              )}

              {/* MATERIALS SECTION */}
              {activeSection === 'materials' && (
                <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{bid.materials?.length || 0} Line Items</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Materials: {currencySymbol}{materialTotal.toLocaleString()}</span>
                  </div>
                  {bid.materials?.map((m, i) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-white truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">{m.quantity} · {m.source || 'Market Average'}</div>
                        {m.confidence && (
                          <span className={`text-[8px] px-2 py-0.5 rounded-full border font-black uppercase tracking-tighter mt-1 inline-block ${
                            m.confidence === 'High' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            m.confidence === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {m.confidence}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-white">{currencySymbol}{(m.unitPrice * (parseFloat(m.quantity) || 1)).toLocaleString()}</div>
                        <div className="text-[9px] text-slate-500 font-bold">{currencySymbol}{m.unitPrice}/unit</div>
                      </div>
                    </div>
                  ))}
                  <div className="p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex justify-between items-center">
                    <span className="font-black text-white uppercase tracking-widest text-sm">Grand Total</span>
                    <span className="text-2xl font-black text-white">{currencySymbol}{grandTotal.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}

              {/* PROPOSAL SECTION */}
              {activeSection === 'proposal' && (
                <motion.div key="proposal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  {bid.summary && (
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">AI Site Summary</div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">{bid.summary}</p>
                    </div>
                  )}
                  {bid.measurements && (
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Measurements</div>
                      <p className="text-sm text-slate-300 font-bold">{bid.measurements}</p>
                    </div>
                  )}
                  {bid.structuralRisks && bid.structuralRisks.length > 0 && (
                    <div className="bg-red-500/5 rounded-3xl p-6 border border-red-500/20">
                      <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Structural Risk Flags</div>
                      {bid.structuralRisks.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-red-300 mb-2">
                          <span className="text-red-500 mt-1 shrink-0">⚠</span>
                          <span className="font-medium">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-white p-8 rounded-3xl shadow-inner border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm font-serif leading-relaxed italic min-h-[200px]">
                    {(bid as any).proposalLetter || 'No proposal generated yet.'}
                  </div>
                </motion.div>
              )}

              {/* EXPORT SECTION */}
              {activeSection === 'export' && (
                <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Export Options</div>

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => setShowPDF(true)}
                      className="flex items-center gap-5 p-6 bg-white/5 hover:bg-blue-600/10 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
                      <div className="text-left">
                        <div className="font-black text-white text-sm uppercase tracking-widest">PDF Bid Proposal</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Professional cover letter · Material list · Totals</div>
                      </div>
                      <Download size={18} className="ml-auto text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const text = [
                            `PROJECT: ${bid.projectName}`,
                            `CLIENT: ${bid.clientName}`,
                            `DATE: ${bid.date}`,
                            `TIER: ${bid.projectTier}`,
                            `STATUS: ${bid.status}`,
                            '',
                            'MATERIALS:',
                            ...(bid.materials?.map(m => `  - ${m.name} x${m.quantity} @ ${currencySymbol}${m.unitPrice}`) || []),
                            '',
                            `LABOR: ${currencySymbol}${(bid.laborCost || 0).toLocaleString()}`,
                            `TOTAL: ${currencySymbol}${grandTotal.toLocaleString()}`,
                          ].join('\n');
                          await navigator.clipboard.writeText(text);
                          toast.success('Bid summary copied to clipboard');
                        } catch { /* ignore */ }
                      }}
                      className="flex items-center gap-5 p-6 bg-white/5 hover:bg-blue-600/10 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📋</div>
                      <div className="text-left">
                        <div className="font-black text-white text-sm uppercase tracking-widest">Copy to Clipboard</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">Plain text summary for email or messaging</div>
                      </div>
                      <ChevronRight size={18} className="ml-auto text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Delete confirmation overlay */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-8"
              >
                <div className="bg-slate-800 rounded-3xl p-8 border border-red-500/20 max-w-sm w-full text-center space-y-6">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-3xl mx-auto">🗑️</div>
                  <div>
                    <h3 className="font-black text-white text-lg uppercase tracking-widest">Delete Project?</h3>
                    <p className="text-slate-400 text-sm mt-2">"{bid.projectName}" will be permanently removed from the vault.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Cancel</button>
                    <button onClick={() => onDelete(bid)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Delete</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* PDF Export Modal */}
      {showPDF && (
        <BidPDFExporter bid={bid} currencySymbol={currencySymbol} onClose={() => setShowPDF(false)} />
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailModal;
