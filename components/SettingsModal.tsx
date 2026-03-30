import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MetallicPanel from './MetallicPanel.tsx';
import { AppSettings } from '../types.ts';
import { X } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
}

type Tab = 'business' | 'ai' | 'pricing' | 'survey' | 'display';

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>('business');
  const up = (patch: Partial<AppSettings>) => setLocalSettings(s => ({ ...s, ...patch }));

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'business', label: 'Business' },
    { id: 'ai', label: 'AI & Voice' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'survey', label: 'Survey' },
    { id: 'display', label: 'Display' },
  ];

  const Toggle = ({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
      <div>
        <div className="font-bold text-white text-sm">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full relative transition-all shrink-0 ml-4 ${value ? 'bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors text-sm";
  const selectCls = inputCls;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <MetallicPanel className="w-full max-w-2xl max-h-[90vh] flex flex-col relative" title="App Configuration">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors z-10">
          <X size={18} />
        </button>

        {/* Tab strip */}
        <div className="flex gap-1 mb-6 mt-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap transition-all ${
                activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-4 pr-1">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* BUSINESS TAB */}
              {activeTab === 'business' && (
                <>
                  <Field label="Company Name">
                    <input type="text" className={inputCls} value={localSettings.companyName} onChange={e => up({ companyName: e.target.value })} placeholder="Your Company Name" />
                  </Field>
                  <Field label="Currency Symbol">
                    <select className={selectCls} value={localSettings.currencySymbol} onChange={e => up({ currencySymbol: e.target.value })}>
                      <option value="$">$ USD</option>
                      <option value="€">€ EUR</option>
                      <option value="£">£ GBP</option>
                      <option value="C$">C$ CAD</option>
                      <option value="A$">A$ AUD</option>
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Default Labor Cost ($)">
                      <input type="number" className={inputCls} value={localSettings.defaultLaborCost} onChange={e => up({ defaultLaborCost: Number(e.target.value) })} />
                    </Field>
                    <Field label="Material Markup (%)">
                      <input type="number" className={inputCls} value={localSettings.materialMarkupPercent} onChange={e => up({ materialMarkupPercent: Number(e.target.value) })} />
                    </Field>
                  </div>
                  <Field label="BCC Email (for proposal copies)">
                    <input type="email" className={inputCls} value={localSettings.bccEmail} onChange={e => up({ bccEmail: e.target.value })} placeholder="you@company.com" />
                  </Field>
                  <Field label="Export Format">
                    <select className={selectCls} value={localSettings.exportFormat} onChange={e => up({ exportFormat: e.target.value as any })}>
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="PNG">PNG</option>
                    </select>
                  </Field>
                </>
              )}

              {/* AI & VOICE TAB */}
              {activeTab === 'ai' && (
                <>
                  <Field label="Foreman Voice">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Fenrir', 'Charon', 'Kore', 'Puck', 'Zephyr'].map(voice => (
                        <button
                          key={voice}
                          onClick={() => up({ preferredVoice: voice as any })}
                          className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                            localSettings.preferredVoice === voice
                              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {voice}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="AI Thinking Budget">
                    <div className="grid grid-cols-2 gap-3">
                      {(['Standard', 'Deep'] as const).map(b => (
                        <button
                          key={b}
                          onClick={() => up({ thinkingBudget: b })}
                          className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                            localSettings.thinkingBudget === b
                              ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {b === 'Standard' ? '⚡ Standard' : '🧠 Deep Reasoning'}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-2">Deep uses extended AI reasoning for complex structural analysis. Standard is faster.</p>
                  </Field>
                  <Field label="Default Project Tier">
                    <select className={selectCls} value={localSettings.defaultProjectTier} onChange={e => up({ defaultProjectTier: e.target.value as any })}>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Ultra-Luxury">Ultra-Luxury</option>
                    </select>
                  </Field>
                  <Field label="Default Remodel Style">
                    <select className={selectCls} value={localSettings.defaultRemodelStyle} onChange={e => up({ defaultRemodelStyle: e.target.value as any })}>
                      {['Modern', 'Industrial', 'Scandinavian', 'Mediterranean', 'Contemporary', 'Rustic', 'Art Deco', 'Minimalist', 'Bohemian', 'Coastal', 'Traditional'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              {/* PRICING TAB */}
              {activeTab === 'pricing' && (
                <>
                  <Field label="Primary Pricing Source">
                    <select className={selectCls} value={localSettings.pricingSource} onChange={e => up({ pricingSource: e.target.value as any })}>
                      <option value="Average">Market Average</option>
                      <option value="HomeDepot">Home Depot</option>
                      <option value="Lowes">Lowe's</option>
                      <option value="DunnLumber">Dunn Lumber</option>
                    </select>
                  </Field>
                  <Field label="Location Mode">
                    <div className="grid grid-cols-2 gap-3">
                      {(['Geolocation', 'ZipCode'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => up({ pricingLocationMode: m })}
                          className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                            localSettings.pricingLocationMode === m
                              ? 'bg-blue-600 text-white border-blue-400'
                              : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                          }`}
                        >
                          {m === 'Geolocation' ? '📍 GPS' : '📮 Zip Code'}
                        </button>
                      ))}
                    </div>
                  </Field>
                  {localSettings.pricingLocationMode === 'ZipCode' && (
                    <Field label="Zip Code">
                      <input type="text" className={inputCls} value={localSettings.zipCode} onChange={e => up({ zipCode: e.target.value })} placeholder="98101" />
                    </Field>
                  )}
                  <Toggle
                    value={localSettings.showAmazonComparison}
                    onChange={v => up({ showAmazonComparison: v })}
                    label="Amazon Pricing Layer"
                    sub="Side-by-side comparison on material items"
                  />
                </>
              )}

              {/* SURVEY TAB */}
              {activeTab === 'survey' && (
                <>
                  <Field label="Camera Countdown Timer (seconds)">
                    <input type="number" min={1} max={10} className={inputCls} value={localSettings.cameraCountdown} onChange={e => up({ cameraCountdown: Number(e.target.value) })} />
                  </Field>
                  <Toggle
                    value={localSettings.autoSnapEdges}
                    onChange={v => up({ autoSnapEdges: v })}
                    label="Auto-Snap Edge Detection"
                    sub="Automatically detect room edges in OPTICS mode"
                  />
                </>
              )}

              {/* DISPLAY TAB */}
              {activeTab === 'display' && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Theme options coming soon</p>
                  <p className="text-xs text-slate-600 mt-2">Currently: Dark Mode Only</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
            Save Settings
          </button>
        </div>
      </MetallicPanel>
    </div>
  );
};

export default SettingsModal;
