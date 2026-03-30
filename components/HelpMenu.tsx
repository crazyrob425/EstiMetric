import React, { useState } from 'react';
import MetallicPanel from './MetallicPanel.tsx';
import { BookOpen, Map, HelpCircle, Lightbulb, ChevronRight, HardHat, Ruler, DollarSign, ShieldAlert, Zap, Search, Camera } from 'lucide-react';

interface HelpMenuProps {
  onClose: () => void;
}

type Tab = 'MANUAL' | 'WALKTHROUGHS' | 'FAQ' | 'TIPS';

const HelpMenu: React.FC<HelpMenuProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('MANUAL');

  const renderContent = () => {
    switch (activeTab) {
      case 'MANUAL':
        return (
          <div className="space-y-8 animate-fadeIn text-slate-700">
            <section className="bg-white/40 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="text-blue-600" size={20} />
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Survey Engine (Optic Scan)</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed mb-4">
                The <span className="text-blue-600 font-bold">Survey Engine</span> turns your camera into a precision measuring tool. By identifying standard structural benchmarks, it calculates square footage, wall heights, and window openings automatically.
              </p>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Field Calibration</p>
                <p className="text-xs text-blue-900 mt-1 italic">For 1/16" accuracy, place a known reference—like a standard business card or 8.5x11 sheet—in the center of the frame during initial scan.</p>
              </div>
            </section>

            <section className="bg-white/40 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="text-orange-600" size={20} />
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Logic-Gate Material Audit</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                The audit core runs every item in your takeoff against a database of local building codes and design standards.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex gap-2 text-xs font-bold text-slate-600 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                  <span><strong className="text-red-700">SAFETY ALERTS:</strong> Identifies code violations, like using non-pressure-treated wood for ground contact.</span>
                </li>
                <li className="flex gap-2 text-xs font-bold text-slate-600 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1 shrink-0" />
                  <span><strong className="text-purple-700">STYLE ALERTS:</strong> Flags aesthetic conflicts, such as mixing modern brushed nickel with rustic bronze hardware.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/40 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="text-emerald-600" size={20} />
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Live Inventory Sync</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                We poll local suppliers (Home Depot, Lowe's, and local lumber yards) based on your GPS location. Prices are updated to reflect the actual cost at the nearest store, including current market deltas on materials like lumber and copper.
              </p>
            </section>
          </div>
        );
      case 'WALKTHROUGHS':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all cursor-help">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">Rapid Site Takeoff</h4>
                  <p className="text-xs text-slate-500">Go from raw site photo to full material list in under 2 minutes.</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-[8px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">1. Scan Room</span>
                <span className="text-[8px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">2. Audit List</span>
                <span className="text-[8px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">3. Sync Prices</span>
              </div>
            </div>

            <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-500 transition-all cursor-help">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">The Foreman: Code Consult</h4>
                  <p className="text-xs text-slate-500">How to get specific framing, plumbing, or electrical advice.</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500" />
              </div>
              <p className="text-[10px] mt-4 font-medium text-slate-400 italic">"Ask: What is the required riser height for a residential staircase in King County?"</p>
            </div>

            <div className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500 transition-all cursor-help">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">Virtual Toolbox (Probes)</h4>
                  <p className="text-xs text-slate-500">Detecting heat loss, finding studs, and checking floor levelness.</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
              </div>
            </div>
          </div>
        );
      case 'FAQ':
        return (
          <div className="space-y-4 animate-fadeIn">
             {[
               { q: "Is the measurement data legal for blueprints?", a: "EstiMetric is a bidding and estimation tool. While highly accurate, all structural measurements should be verified by a licensed architect or surveyor before finalizing blueprints." },
               { q: "How do I update local supplier pricing?", a: "Go to Settings and enter your project Zip Code. In the takeoff screen, click 'Live Update' on any material to pull real-time inventory from nearby warehouses." },
               { q: "Can I use the Foreman chat offline?", a: "The Foreman requires an active data connection to pull the latest building codes and market data. However, your saved projects and measurements are always accessible offline in your Vault." },
               { q: "What is 'Deep Reasoning' (Thinking Budget)?", a: "Standard mode is fast for general questions. Deep Reasoning allows the engine to perform complex calculations like calculating load distributions or multi-step stair stringer layouts." },
               { q: "Does the app share my bid prices?", a: "No. Your project vault is local to your device. We never share your labor rates or markup strategies with third parties." }
             ].map((item, i) => (
               <div key={i} className="bg-white/40 rounded-2xl p-5 border border-slate-200 shadow-sm">
                 <div className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                   <HelpCircle size={12} className="text-blue-500" />
                   {item.q}
                 </div>
                 <div className="text-sm text-slate-600 font-medium leading-relaxed">{item.a}</div>
               </div>
             ))}
          </div>
        );
      case 'TIPS':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={120} />
              </div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-blue-400">Pro Efficiency Tip</h4>
              <p className="text-sm font-bold leading-relaxed mb-4">
                Use "Thermal Probe" mode to identify moisture behind drywall. Cool spots in a warm room often indicate damp insulation or leaks that are invisible to the naked eye.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80">
                <ChevronRight size={14} />
                Great for pre-purchase inspections
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Lighting Matters</span>
                <p className="text-[10px] font-bold text-slate-500 italic">For best Optic Scan results, ensure the room is evenly lit. Shadows can interfere with edge detection on baseboards and crown molding.</p>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">The Vault</span>
                <p className="text-[10px] font-bold text-slate-500 italic">Export your bids as PDFs directly to your client from the Vault. The app automatically includes your company branding and terms.</p>
              </div>
            </div>

            <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Shortcut: Quick-Add</p>
              <p className="text-xs font-bold text-blue-900 leading-tight">In the Foreman chat, type "Add 10 sheets of 5/8 drywall" to instantly update your current project ledger without leaving the conversation.</p>
            </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl h-full animate-slideInRight shadow-2xl">
        <MetallicPanel className="h-full rounded-none md:rounded-l-[3rem] border-r-0 flex flex-col" title="EstiMetric Field Manual">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors z-[210] bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm"
          >
            ✕
          </button>
          
          <div className="flex flex-col h-full mt-2">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-4 px-2 shrink-0 no-scrollbar">
              {[
                { id: 'MANUAL', icon: <BookOpen size={14} />, label: 'Manual' },
                { id: 'WALKTHROUGHS', icon: <Map size={14} />, label: 'How-To' },
                { id: 'FAQ', icon: <HelpCircle size={14} />, label: 'FAQ' },
                { id: 'TIPS', icon: <Lightbulb size={14} />, label: 'Pro Tips' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                    activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-4 pl-2 custom-scrollbar pb-12">
              {renderContent()}
            </div>

            <div className="py-6 px-8 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <HardHat size={14} className="text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Field Engine v11.2 • Optimal Logic State</span>
              </div>
              <button 
                onClick={onClose}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Return to Site
              </button>
            </div>
          </div>
        </MetallicPanel>
      </div>
    </div>
  );
};

export default HelpMenu;