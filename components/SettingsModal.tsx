import React, { useState } from 'react';
import MetallicPanel from './MetallicPanel.tsx';
import { AppSettings, UserProfile } from '../types.ts';

interface SettingsModalProps {
  settings: AppSettings;
  userProfile?: UserProfile | null;
  onSave: (newSettings: AppSettings) => void;
  onSaveProfile?: (newProfile: UserProfile) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, userProfile, onSave, onSaveProfile, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(userProfile || null);

  const handleSave = () => { 
    onSave(localSettings); 
    if (localProfile && onSaveProfile) {
      onSaveProfile(localProfile);
    }
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <MetallicPanel className="w-full max-w-2xl max-h-[90vh] flex flex-col relative" title="App Configuration">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 text-xl font-bold z-10 transition-colors">✕</button>
        <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pb-8 mt-4 pr-2">
            
            {localProfile && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest">Membership Tier</h3>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded-full">Beta Release: All Tiers Free</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Free', 'Pro', 'Elite', 'Enterprise'].map(tier => (
                        <button 
                          key={tier} 
                          onClick={() => setLocalProfile(p => p ? {...p, membershipTier: tier as 'Free' | 'Pro' | 'Elite' | 'Enterprise'} : p)} 
                          className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${localProfile.membershipTier === tier ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'}`}
                        >
                          {tier}
                        </button>
                      ))}
                  </div>
              </div>
            )}

            <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-white/10 pb-2">Vocal Tone Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Fenrir', 'Charon', 'Kore', 'Puck', 'Zephyr'].map(voice => (
                      <button 
                        key={voice} 
                        onClick={() => setLocalSettings(s => ({...s, preferredVoice: voice as AppSettings['preferredVoice']}))} 
                        className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${localSettings.preferredVoice === voice ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'}`}
                      >
                        {voice}
                      </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-white/10 pb-2">Pricing Intelligence</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Source</label>
                      <select 
                        value={localSettings.pricingSource} 
                        onChange={e => setLocalSettings(s => ({...s, pricingSource: e.target.value as import('../types').PricingSource}))}
                        className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="Average">Market Average</option>
                        <option value="HomeDepot">Home Depot</option>
                        <option value="Lowes">Lowe's</option>
                        <option value="DunnLumber">Dunn Lumber</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                      <input 
                        type="text" 
                        value={localSettings.zipCode} 
                        onChange={e => setLocalSettings(s => ({...s, zipCode: e.target.value}))} 
                        placeholder="98101"
                        className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl">📦</div>
                      <div>
                        <span className="font-bold text-white block">Amazon Pricing Layer</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Independent comparison line item</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setLocalSettings(s => ({...s, showAmazonComparison: !s.showAmazonComparison}))} 
                      className={`w-14 h-8 rounded-full relative transition-all ${localSettings.showAmazonComparison ? 'bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.4)]' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${localSettings.showAmazonComparison ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-white/10 pb-2">Financial Strategy</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Labor Base ($)</label>
                        <input 
                            type="number" 
                            value={localSettings.defaultLaborCost} 
                            onChange={e => setLocalSettings(s => ({...s, defaultLaborCost: Number(e.target.value)}))} 
                            className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Markup (%)</label>
                        <input 
                            type="number" 
                            value={localSettings.materialMarkupPercent} 
                            onChange={e => setLocalSettings(s => ({...s, materialMarkupPercent: Number(e.target.value)}))} 
                            className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors" 
                        />
                    </div>
                </div>
            </div>

        </div>
        <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Save Changes</button>
        </div>
      </MetallicPanel>
    </div>
  );
};

export default SettingsModal;