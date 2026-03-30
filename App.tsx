import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Ruler, HardHat, Settings, HelpCircle, Activity, Globe, Database, TrendingUp, DollarSign } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import BidWizard from './components/BidWizard.tsx';
import VirtualToolbox from './components/VirtualToolbox.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import GrandMasterChat from './components/GrandMasterChat.tsx';
import HelpMenu from './components/HelpMenu.tsx';
import VaultProjectCard from './components/VaultProjectCard.tsx';
import ProjectDetailModal from './components/ProjectDetailModal.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { BidData, AppSettings } from './types.ts';
import { db, loadSettings, saveSettings } from './services/db.ts';

const DEFAULT_SETTINGS: AppSettings = {
  cameraCountdown: 3,
  defaultProjectTier: 'Premium',
  defaultRemodelStyle: 'Modern',
  defaultLaborCost: 2500,
  materialMarkupPercent: 15,
  thinkingBudget: 'Standard',
  preferredVoice: 'Fenrir',
  autoSnapEdges: true,
  exportFormat: 'PDF',
  bccEmail: '',
  currencySymbol: '$',
  companyName: 'EstiMetric',
  pricingLocationMode: 'Geolocation',
  zipCode: '',
  pricingSource: 'Average',
  showAmazonComparison: false,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vault' | 'toolbox' | 'foreman' | 'new'>('vault');
  const [bids, setBids] = useState<BidData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedBid, setSelectedBid] = useState<BidData | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings(DEFAULT_SETTINGS));

  const totalValue = bids.reduce((sum, b) => {
    const mat = b.materials?.reduce((a, m) => a + (m.unitPrice * (parseFloat(m.quantity) || 1)), 0) || 0;
    return sum + mat + (b.laborCost || 0);
  }, 0);
  const approvedCount = bids.filter(b => b.status === 'Approved').length;

  useEffect(() => {
    const loadBids = async () => {
      try {
        let loaded = await db.bids.orderBy('date').reverse().toArray();
        if (loaded.length === 0) {
          const raw = localStorage.getItem('estimetric_bids');
          if (raw) {
            const parsed: BidData[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await db.bids.bulkPut(parsed);
              loaded = parsed;
              localStorage.removeItem('estimetric_bids');
              toast.success(`Migrated ${parsed.length} project(s) to secure vault`);
            }
          }
        }
        setBids(loaded);
      } catch (e) {
        console.warn('Vault load error', e);
        toast.error('Error loading project vault');
      }
    };
    loadBids();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        null, { timeout: 10000 }
      );
    }
  }, []);

  const handleComplete = async (newBid: BidData) => {
    try {
      await db.bids.put(newBid);
      setBids(prev => [newBid, ...prev.filter(b => b.id !== newBid.id)]);
      toast.success('Project saved to vault!');
    } catch (e) {
      toast.error('Failed to save project');
    }
    setActiveTab('vault');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success('Settings saved');
  };

  const handleDeleteBid = async (bid: BidData) => {
    try {
      await db.bids.delete(bid.id);
      setBids(prev => prev.filter(b => b.id !== bid.id));
      setSelectedBid(null);
      toast.success('Project deleted');
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const handleUpdateBidStatus = async (bid: BidData, status: BidData['status']) => {
    try {
      const updated = { ...bid, status };
      await db.bids.put(updated);
      setBids(prev => prev.map(b => b.id === bid.id ? updated : b));
      setSelectedBid(updated);
      toast.success(`Status updated to ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020617] text-slate-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#020617' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#020617' } },
        }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px]"></div>
      </div>

      <header className="h-20 px-8 flex justify-between items-center glass-panel shrink-0 relative z-[50]">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center luxury-shadow glow-blue">
            <span className="text-white text-xl font-black italic">E</span>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.2em] font-['Montserrat'] leading-none">
              {settings.companyName || 'EstiMetric'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Enterprise v3.0</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 px-6 py-2 bg-white/5 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">System Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Vault Secure</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHelp(true)} className="p-2.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
              <HelpCircle size={20} />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'vault' && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <QuickStat label="Project Files" value={bids.length.toString()} icon={<Database size={16} />} />
                  <QuickStat label="Total Portfolio" value={`${settings.currencySymbol}${totalValue.toLocaleString()}`} icon={<DollarSign size={16} />} color="emerald" />
                  <QuickStat label="Approved Bids" value={approvedCount.toString()} icon={<Activity size={16} />} color="blue" />
                  <QuickStat label="Win Rate" value={bids.length ? `${Math.round((approvedCount / bids.length) * 100)}%` : '—'} icon={<TrendingUp size={16} />} color="indigo" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
                  {bids.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center opacity-30">
                      <LayoutDashboard size={80} className="mb-6" />
                      <h2 className="text-2xl font-black uppercase tracking-widest text-white">Project Vault Empty</h2>
                      <p className="mt-2 text-sm font-bold uppercase tracking-widest">Initiate a survey to begin your first takeoff</p>
                    </div>
                  ) : (
                    bids.map(bid => (
                      <ErrorBoundary key={bid.id}>
                        <VaultProjectCard bid={bid} currencySymbol={settings.currencySymbol} onAudit={() => setSelectedBid(bid)} />
                      </ErrorBoundary>
                    ))
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
              >
                <ErrorBoundary>
                  <BidWizard onComplete={handleComplete} settings={settings} userLocation={userLocation} />
                </ErrorBoundary>
              </motion.div>
            )}
            {activeTab === 'toolbox' && (
              <motion.div
                key="toolbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[80vh]"
              >
                <ErrorBoundary>
                  <VirtualToolbox onClose={() => setActiveTab('vault')} settings={settings} userLocation={userLocation} />
                </ErrorBoundary>
              </motion.div>
            )}
            {activeTab === 'foreman' && (
              <motion.div
                key="foreman"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-3xl mx-auto"
              >
                <ErrorBoundary>
                  <GrandMasterChat onClose={() => setActiveTab('vault')} initialContext={{ settings }} />
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
        <nav className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] luxury-shadow">
          <NavButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon={<LayoutDashboard size={18} />} label="Vault" />
          <NavButton active={activeTab === 'new'} onClick={() => setActiveTab('new')} icon={<PlusCircle size={18} />} label="Survey" />
          <NavButton active={activeTab === 'toolbox'} onClick={() => setActiveTab('toolbox')} icon={<Ruler size={18} />} label="Tools" />
          <NavButton active={activeTab === 'foreman'} onClick={() => setActiveTab('foreman')} icon={<HardHat size={18} />} label="Foreman" />
        </nav>
      </div>

      {showSettings && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />}
      {showHelp && <HelpMenu onClose={() => setShowHelp(false)} />}
      {selectedBid && (
        <ProjectDetailModal
          bid={selectedBid}
          currencySymbol={settings.currencySymbol}
          onClose={() => setSelectedBid(null)}
          onDelete={handleDeleteBid}
          onStatusChange={handleUpdateBidStatus}
        />
      )}
    </div>
  );
};

const QuickStat: React.FC<{ label: string; value: string; icon: React.ReactNode; color?: 'blue' | 'emerald' | 'indigo' }> = ({ label, value, icon, color = 'blue' }) => {
  const colors = { blue: 'text-blue-500', emerald: 'text-emerald-500', indigo: 'text-indigo-400' };
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl glass-panel group hover:border-blue-500/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={`${colors[color]} group-hover:scale-110 transition-transform`}>{icon}</span>
      </div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 relative group ${
      active ? 'bg-blue-600 text-white shadow-lg glow-blue' : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    {icon}
    <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
      active ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover:w-auto group-hover:opacity-100'
    }`}>
      {label}
    </span>
  </button>
);

export default App;
