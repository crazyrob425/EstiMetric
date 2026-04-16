import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Ruler, HardHat, Settings, HelpCircle, Activity, Globe, Database, LogIn, LogOut, User as UserIcon, Loader } from 'lucide-react';
import type { ToolType } from './components/VirtualToolbox.tsx';
import VaultProjectCard from './components/VaultProjectCard.tsx';
import SectionErrorBoundary from './components/SectionErrorBoundary.tsx';
// Eagerly loaded lightweight components
import StickyForeman from './components/StickyForeman.tsx';
import BetaFeedbackButton from './components/BetaFeedbackButton.tsx';
import ComposeInspiredTemplate from './components/ComposeInspiredTemplate.tsx';
import { AppWatchdogProvider } from './contexts/AppWatchdogContext.tsx';
import { BidData, AppSettings, UserProfile, BetaFeedbackSubmission, BetaJoinSubmissionPayload } from './types.ts';
import { auth, db, signInWithPopup, googleProvider, signOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, addDoc, serverTimestamp, handleFirestoreError, OperationType } from './firebase.ts';
import { User } from 'firebase/auth';
import { getDocFromServer } from 'firebase/firestore';

// ─── Lazy-loaded heavy components ────────────────────────────────────────────
// Code-splitting these cuts the initial JS bundle by ~60%.
const BidWizard          = lazy(() => import('./components/BidWizard.tsx'));
const VirtualToolbox     = lazy(() => import('./components/VirtualToolbox.tsx'));
const GrandMasterChat    = lazy(() => import('./components/GrandMasterChat.tsx'));
const SettingsModal      = lazy(() => import('./components/SettingsModal.tsx'));
const HelpMenu           = lazy(() => import('./components/HelpMenu.tsx'));
const ToolboxHub         = lazy(() => import('./components/ToolboxHub.tsx'));
const FirstRunBetaModal  = lazy(() => import('./components/FirstRunBetaModal.tsx'));
const BetaFeedbackModal  = lazy(() => import('./components/BetaFeedbackModal.tsx'));
const BetaJoinModal      = lazy(() => import('./components/BetaJoinModal.tsx'));

const BETA_FEEDBACK_EMAIL = 'blacklistedrob@gmail.com';
const MAX_PENDING_FEEDBACK_ITEMS = 20;
const MAX_PENDING_JOIN_ITEMS = 20;
const BETA_JOINED_STORAGE_KEY = 'estimetric_beta_join_completed';

/** Minimal spinner shown while a lazy chunk is loading. */
const LazyFallback: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader size={28} className="text-blue-500 animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'vault' | 'toolbox' | 'foreman' | 'new'>('home');
  const [bids, setBids] = useState<BidData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showForemanChat, setShowForemanChat] = useState(false);
  const [initialToolId, setInitialToolId] = useState<ToolType | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [showFirstRunBetaModal, setShowFirstRunBetaModal] = useState(false);
  const [showBetaJoinModal, setShowBetaJoinModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAttentionActive, setFeedbackAttentionActive] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
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
    showAmazonComparison: false
  });

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              membershipTier: 'Free',
              isBeta: true,
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(userSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      // Sync Settings
      const settingsRef = doc(db, `users/${user.uid}/settings/preferences`);
      const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as AppSettings);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/settings/preferences`);
      });

      // Sync Bids
      const bidsRef = collection(db, `users/${user.uid}/bids`);
      const q = query(bidsRef);
      const unsubBids = onSnapshot(q, (snapshot) => {
        const fetchedBids: BidData[] = [];
        snapshot.forEach((doc) => {
          fetchedBids.push(doc.data() as BidData);
        });
        // Sort by date descending
        fetchedBids.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBids(fetchedBids);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/bids`);
      });

      return () => {
        unsubSettings();
        unsubBids();
      };
    } else {
      // Fallback to local storage if not logged in
      try {
        const saved = localStorage.getItem('estimetric_bids');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setBids(parsed);
        }
        const savedSettings = localStorage.getItem('estimetric_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch(e) { console.warn("Local load error"); }
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    if (!isAndroid) return;
    const hasAccepted = localStorage.getItem('estimetric_beta_notice_accepted_android') === 'true';
    if (!hasAccepted) {
      setShowFirstRunBetaModal(true);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        null, { timeout: 10000 }
      );
    }
  }, []);

  const handleCancelAndExit = () => {
    window.close();
    if (!window.closed && window.history.length > 1) {
      window.history.back();
    }
  };

  const handleAcceptBetaNotice = () => {
    localStorage.setItem('estimetric_beta_notice_accepted_android', 'true');
    localStorage.setItem('estimetric_beta_feedback_attention_pending', 'true');
    setShowFirstRunBetaModal(false);
    setFeedbackAttentionActive(true);
    window.setTimeout(() => {
      setFeedbackAttentionActive(false);
      localStorage.setItem('estimetric_beta_feedback_attention_pending', 'false');
    }, 4200);
  };

  useEffect(() => {
    const pending = localStorage.getItem('estimetric_beta_feedback_attention_pending') === 'true';
    if (!pending) return;
    setFeedbackAttentionActive(true);
    const timer = window.setTimeout(() => {
      setFeedbackAttentionActive(false);
      localStorage.setItem('estimetric_beta_feedback_attention_pending', 'false');
    }, 4200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hasJoinedBeta = localStorage.getItem(BETA_JOINED_STORAGE_KEY) === 'true';
    if (!hasJoinedBeta) {
      setShowBetaJoinModal(true);
    }
  }, []);

  const handleSubmitFeedback = async (payload: Omit<BetaFeedbackSubmission, 'id' | 'createdAt' | 'source'>) => {
    const id = `fb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const message = payload.message.trim();
    if (!message) return;

    const feedbackDoc = {
      id,
      message,
      email: payload.email?.trim() || '',
      category: payload.category,
      screenshotDataUrl: payload.screenshotDataUrl || '',
      activeTab: payload.activeTab,
      userAgent: payload.userAgent,
      source: 'android-beta',
      userId: user?.uid || null,
      createdAt: serverTimestamp()
    };

    try {
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/feedback`), feedbackDoc);
      } else {
        const pendingKey = 'estimetric_pending_beta_feedback';
        const previous = localStorage.getItem(pendingKey);
        const parsed = previous ? JSON.parse(previous) : [];
        const safeList = Array.isArray(parsed) ? parsed : [];
        safeList.push({ ...feedbackDoc, createdAt: new Date().toISOString() });
        localStorage.setItem(pendingKey, JSON.stringify(safeList.slice(-MAX_PENDING_FEEDBACK_ITEMS)));
      }

      const subject = encodeURIComponent(`EstiMetric Beta Feedback [${payload.category}] ${id}`);
      const bodyParts = [
        'EstiMetric Beta Feedback Submission',
        '',
        `Submission ID: ${id}`,
        `Category: ${payload.category}`,
        `Active Tab: ${payload.activeTab}`,
        `User Email: ${payload.email?.trim() || 'Not provided'}`,
        `User ID: ${user?.uid || 'Anonymous/Not signed in'}`,
        '',
        'Feedback Details:',
        message,
        '',
        payload.screenshotDataUrl ? 'A screenshot was attached in-app and logged to the submission record.' : 'No screenshot attached.'
      ];
      window.location.href = `mailto:${BETA_FEEDBACK_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyParts.join('\n'))}`;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, user ? `users/${user.uid}/feedback` : 'local-feedback');
    }
  };

  const handleBetaJoin = async (payload: BetaJoinSubmissionPayload) => {
    const id = `join_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const joinRecord = {
      id,
      email: payload.email.trim(),
      contactInfo: payload.contactInfo.trim(),
      source: 'android-beta',
      userId: user?.uid || null,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent
    };

    try {
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/beta_joins`), joinRecord);
      } else {
        const pendingKey = 'estimetric_pending_beta_joins';
        const previous = localStorage.getItem(pendingKey);
        const parsed = previous ? JSON.parse(previous) : [];
        const safeList = Array.isArray(parsed) ? parsed : [];
        safeList.push({ ...joinRecord, createdAt: new Date().toISOString() });
        localStorage.setItem(pendingKey, JSON.stringify(safeList.slice(-MAX_PENDING_JOIN_ITEMS)));
      }
      localStorage.setItem(BETA_JOINED_STORAGE_KEY, 'true');
      localStorage.setItem('estimetric_beta_join_email', payload.email.trim());
      setShowBetaJoinModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, user ? `users/${user.uid}/beta_joins` : 'local-beta-joins');
    }
  };

  const handleComplete = async (newBid: BidData) => {
    const bidWithTimestamp: BidData = { ...newBid, lastModified: Date.now() };
    if (user) {
      try {
        const bidRef = doc(db, `users/${user.uid}/bids`, bidWithTimestamp.id);
        await setDoc(bidRef, bidWithTimestamp);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/bids/${bidWithTimestamp.id}`);
      }
    } else {
      const updated = [bidWithTimestamp, ...bids];
      setBids(updated);
      localStorage.setItem('estimetric_bids', JSON.stringify(updated));
    }
    setActiveTab('vault');
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (user) {
      try {
        const settingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        await setDoc(settingsRef, newSettings);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/settings/preferences`);
      }
    } else {
      localStorage.setItem('estimetric_settings', JSON.stringify(newSettings));
    }
    setShowSettings(false);
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { membershipTier: newProfile.membershipTier });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Stable navigateTo callback for Watchdog provider
  const navigateTo = useCallback((tab: string) => {
    setActiveTab(tab as 'home' | 'vault' | 'toolbox' | 'foreman' | 'new');
  }, []);

  // Handle tool selection from ToolboxHub
  const handleOpenTool = useCallback((toolId: string) => {
    // Map ToolboxHub tool IDs to VirtualToolbox ToolType values
    const toolMap: Record<string, ToolType> = {
      'spatial': 'spatial',
      'ar-tape': 'spatial',
      'lux': 'lux',
      'magneto': 'magneto',
      'thermal': 'thermal',
    };
    const mappedTool = toolMap[toolId] ?? 'spatial';
    setInitialToolId(mappedTool);
    setActiveTab('toolbox');
  }, []);

  return (
    <AppWatchdogProvider navigateTo={navigateTo}>
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#020617] text-slate-100">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Professional Header */}
      <header className="h-20 px-8 flex justify-between items-center glass-panel shrink-0 relative z-[50]">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center luxury-shadow glow-blue">
            <span className="text-white text-xl font-black italic">E</span>
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-[0.2em] font-['Montserrat'] leading-none">EstiMetric</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Enterprise v2.1</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 px-6 py-2 bg-white/5 rounded-full border border-white/5">
            {userProfile && (
              <div className="flex items-center gap-2">
                <UserIcon size={12} className="text-purple-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Tier: <span className="text-purple-400">{userProfile.membershipTier}</span>
                  {userProfile.isBeta && <span className="ml-1 text-emerald-400">(Beta Free)</span>}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">GMSA Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} className={user ? "text-blue-400" : "text-slate-600"} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">{user ? "Cloud Sync Active" : "Local Mode"}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <button onClick={handleLogout} className="p-2.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors" title="Sign Out">
                <LogOut size={20} />
              </button>
            ) : (
              <button onClick={handleLogin} className="p-2.5 hover:bg-white/5 rounded-lg text-blue-400 transition-colors" title="Sign In with Google">
                <LogIn size={20} />
              </button>
            )}
            <button onClick={() => setShowHelp(true)} className="p-2.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
              <HelpCircle size={20} />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Command View */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 flex flex-col items-center justify-center min-h-[70vh]"
              >
                <ComposeInspiredTemplate
                  variant="home"
                  title="EstiMetric"
                  subtitle="Select an operation to begin"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <button 
                      onClick={() => setActiveTab('new')}
                      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-left transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 group-hover:opacity-30">
                        <PlusCircle size={120} />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex rounded-xl bg-white/20 p-4 backdrop-blur-md">
                          <PlusCircle size={32} className="text-white" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">Start New Bid</h3>
                        <p className="text-sm font-bold tracking-widest text-blue-100 uppercase opacity-80">Initiate a new project survey and takeoff</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('vault')}
                      className="group relative overflow-hidden rounded-3xl bg-slate-800 p-8 text-left transition-all hover:scale-[1.02] hover:bg-slate-700 border border-white/5"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
                        <Database size={120} />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex rounded-xl bg-white/5 p-4">
                          <Database size={32} className="text-blue-400" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">Project Vault</h3>
                        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Access saved bids and historical data</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('toolbox')}
                      className="group relative overflow-hidden rounded-3xl bg-slate-800 p-8 text-left transition-all hover:scale-[1.02] hover:bg-slate-700 border border-white/5"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
                        <Ruler size={120} />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex rounded-xl bg-white/5 p-4">
                          <Ruler size={32} className="text-emerald-400" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">Virtual Tools</h3>
                        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">AR measurement and site analysis</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setActiveTab('foreman')}
                      className="group relative overflow-hidden rounded-3xl bg-slate-800 p-8 text-left transition-all hover:scale-[1.02] hover:bg-slate-700 border border-white/5"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
                        <HardHat size={120} />
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex rounded-xl bg-white/5 p-4">
                          <HardHat size={32} className="text-orange-400" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black uppercase tracking-widest text-white">The Foreman</h3>
                        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Consult AI for technical guidance</p>
                      </div>
                    </button>
                  </div>
                </ComposeInspiredTemplate>
              </motion.div>
            )}

            {activeTab === 'vault' && (
              <motion.div 
                key="vault"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <ComposeInspiredTemplate
                  variant="vault"
                  title="Project Vault"
                  subtitle="All saved bids, metrics, and historical takeoffs in one place"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickStat label="Project Files" value={bids.length.toString()} icon={<Database size={16} />} />
                    <QuickStat label="Active Surveyors" value="1" icon={<Globe size={16} />} />
                    <QuickStat label="System Health" value="99.9%" icon={<Activity size={16} />} />
                    <QuickStat label="Vault Space" value="Nominal" icon={<LayoutDashboard size={16} />} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
                    {bids.length === 0 ? (
                      <div className="col-span-full py-32 flex flex-col items-center opacity-30">
                        <LayoutDashboard size={80} className="mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-widest text-white">Project Vault Empty</h2>
                        <p className="mt-2 text-sm font-bold uppercase tracking-widest">Initiate a survey to begin your first takeoff</p>
                      </div>
                    ) : (
                      bids.map(bid => <VaultProjectCard key={bid.id} bid={bid} onAudit={(b) => { handleComplete(b); }} />)
                    )}
                  </div>
                </ComposeInspiredTemplate>
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
                <ComposeInspiredTemplate
                  variant="new"
                  title="Survey Wizard"
                  subtitle="Guided workflow for a faster and cleaner bid build"
                >
                  <SectionErrorBoundary sectionName="Survey Wizard">
                    <Suspense fallback={<LazyFallback />}>
                      <BidWizard onComplete={handleComplete} settings={settings} userLocation={userLocation} />
                    </Suspense>
                  </SectionErrorBoundary>
                </ComposeInspiredTemplate>
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
                <ComposeInspiredTemplate
                  variant="toolbox"
                  title="Virtual Tools"
                  subtitle="Measurement and diagnostics with a unified tool shell"
                >
                  <SectionErrorBoundary sectionName="Virtual Toolbox">
                    <Suspense fallback={<LazyFallback />}>
                      <VirtualToolbox onClose={() => setActiveTab('vault')} settings={settings} userLocation={userLocation} initialTool={initialToolId} />
                    </Suspense>
                  </SectionErrorBoundary>
                </ComposeInspiredTemplate>
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
                <ComposeInspiredTemplate
                  variant="foreman"
                  title="Foreman AI"
                  subtitle="Context-aware assistant using the same flow language as the rest of the app"
                >
                  <SectionErrorBoundary sectionName="Foreman AI">
                    <Suspense fallback={<LazyFallback />}>
                      <GrandMasterChat onClose={() => setActiveTab('vault')} initialContext={{ settings }} />
                    </Suspense>
                  </SectionErrorBoundary>
                </ComposeInspiredTemplate>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modern Fixed Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
        <nav className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] luxury-shadow">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<LayoutDashboard size={18} />} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'vault'} 
            onClick={() => setActiveTab('vault')} 
            icon={<Database size={18} />} 
            label="Vault" 
          />
          <NavButton 
            active={activeTab === 'new'} 
            onClick={() => setActiveTab('new')} 
            icon={<PlusCircle size={18} />} 
            label="Survey" 
          />
          <NavButton 
            active={activeTab === 'toolbox'} 
            onClick={() => setActiveTab('toolbox')} 
            icon={<Ruler size={18} />} 
            label="Tools" 
          />
          <NavButton 
            active={activeTab === 'foreman'} 
            onClick={() => setActiveTab('foreman')} 
            icon={<HardHat size={18} />} 
            label="Foreman" 
          />
        </nav>
      </div>

      {/* Floating Toolbox Hub — collapsed icon + expanded grid */}
      <Suspense fallback={null}>
        <ToolboxHub onOpenTool={handleOpenTool} />
      </Suspense>

      <BetaFeedbackButton onClick={() => setShowFeedbackModal(true)} shouldFlash={feedbackAttentionActive} />

      {/* Sticky AI Foreman Watchdog Icon */}
      <StickyForeman onOpenForeman={() => setShowForemanChat(true)} />

      {/* Foreman Chat Overlay (opened via StickyForeman) */}
      <AnimatePresence>
        {showForemanChat && (
          <motion.div
            key="foreman-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-3xl"
            >
              <SectionErrorBoundary sectionName="Foreman Chat">
                <Suspense fallback={<LazyFallback />}>
                  <GrandMasterChat onClose={() => setShowForemanChat(false)} initialContext={{ settings }} />
                </Suspense>
              </SectionErrorBoundary>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSettings && (
        <Suspense fallback={<LazyFallback />}>
          <SettingsModal settings={settings} userProfile={userProfile} onSave={handleSaveSettings} onSaveProfile={handleSaveProfile} onClose={() => setShowSettings(false)} />
        </Suspense>
      )}
      {showHelp && (
        <Suspense fallback={<LazyFallback />}>
          <HelpMenu onClose={() => setShowHelp(false)} />
        </Suspense>
      )}
      {showFeedbackModal && (
        <Suspense fallback={<LazyFallback />}>
          <BetaFeedbackModal
            activeTab={activeTab}
            defaultEmail={userProfile?.email || ''}
            onClose={() => setShowFeedbackModal(false)}
            onSubmit={handleSubmitFeedback}
          />
        </Suspense>
      )}
      {showFirstRunBetaModal && (
        <Suspense fallback={<LazyFallback />}>
          <FirstRunBetaModal
            onAccept={handleAcceptBetaNotice}
            onCancel={handleCancelAndExit}
          />
        </Suspense>
      )}
      {showBetaJoinModal && (
        <Suspense fallback={<LazyFallback />}>
          <BetaJoinModal
            defaultEmail={userProfile?.email || localStorage.getItem('estimetric_beta_join_email') || ''}
            onSubmit={handleBetaJoin}
          />
        </Suspense>
      )}
    </div>
    </AppWatchdogProvider>
  );
};

const QuickStat: React.FC<{label: string, value: string, icon: React.ReactNode}> = ({ label, value, icon }) => (
  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl glass-panel group hover:border-blue-500/30 transition-all duration-500">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-blue-500 group-hover:scale-110 transition-transform">{icon}</span>
    </div>
    <div className="text-2xl font-black tracking-tight">{value}</div>
  </div>
);

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
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
