import React, { useState, useRef, useEffect } from 'react';
import MetallicPanel from './MetallicPanel.tsx';
import { runForemanGraph } from '../services/aiOrchestrator.ts';
import { speakText } from '../services/geminiService.ts';
import { nexus } from '../services/nexusProtocol.ts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metrics?: any;
  routingType?: string;
  hwMode?: string;
}

const WAKE_PHRASE = "AUTH_LEVEL_DESIGN_LEAD_206425";
const SLEEP_PHRASE = "AUTH_LEVEL_FOREMAN_STABLE_425206";

const GrandMasterChat: React.FC<{ onClose: () => void, initialContext?: any, onCommand?: any }> = ({ onClose, initialContext, onCommand }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [synergy, setSynergy] = useState(0.5);
  const [isAwake, setIsAwake] = useState(() => localStorage.getItem('muse_awake') === 'true');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: isAwake 
            ? "Design Lead active. Ready to assist with high-level project theory and aesthetic refinement. What is our current design objective?" 
            : "Foreman active. Standing by for technical queries and code verification. State your request." 
        }
      ]);
    }
  }, [isAwake, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const checkStatus = async () => {
      const manifest = await nexus.getManifest();
      setSynergy(manifest.status.synergyLevel);
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    // --- PERSONA TOGGLE LOGIC ---
    if (userMsg === WAKE_PHRASE) {
      setIsAwake(true);
      localStorage.setItem('muse_awake', 'true');
      setMessages([{ role: 'assistant', content: "Authorization accepted. Switching to Design Lead protocol. I am ready to collaborate on your vision." }]);
      speakText("Design Lead protocol active. Standing by.", 'Kore');
      return;
    }

    if (userMsg === SLEEP_PHRASE) {
      setLoading(true);
      await nexus.recordEvolution("Vault Entry", "Protocol Shift", "Switching back to standard Foreman interface.");
      setIsAwake(false);
      localStorage.setItem('muse_awake', 'false');
      setMessages([{ role: 'assistant', content: "Foreman active. Protocol shift complete. Returning to technical baseline." }]);
      setLoading(false);
      speakText("Standard Foreman protocol active.", 'Fenrir');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await runForemanGraph(userMsg, { ...initialContext, isAwake });
      const lastBotMsg = result.messages[result.messages.length - 1];
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: lastBotMsg.content,
        routingType: result.routing,
        hwMode: result.hardware
      }]);

      const voice = isAwake ? 'Kore' : (initialContext?.settings?.preferredVoice || 'Fenrir');
      speakText(lastBotMsg.content, voice);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: isAwake ? "The connection to the Design Logic Node is experiencing latency. Please standby." : "Logic node timeout. Retrying connection..." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full shadow-2xl animate-slideInRight">
        <MetallicPanel className="h-full rounded-none flex flex-col" title={isAwake ? "Design Lead" : "The Foreman"}>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 font-bold z-50 bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">✕</button>
          
          <div className="absolute top-8 left-64 flex items-center gap-2 z-50">
            <div className={`w-3 h-3 rounded-full ${isAwake ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] animate-pulse' : 'bg-blue-400/40 animate-pulse'}`}></div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              {isAwake ? `Sync Level: ${Math.round(synergy * 100)}%` : "Sys. Status: Nominal"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-5 rounded-3xl luxury-shadow relative ${m.role === 'user' ? (isAwake ? 'bg-indigo-600' : 'bg-blue-600') + ' text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
                  <div className="text-sm font-medium leading-relaxed">{m.content}</div>
                  {m.role === 'assistant' && !isAwake && m.hwMode && (
                    <div className="absolute -top-3 left-4">
                       <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 uppercase tracking-tighter">
                         {m.hwMode}
                       </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 bg-white/30 rounded-2xl p-4 animate-pulse mx-4">
                 <div className={`w-3 h-3 border-2 ${isAwake ? 'border-indigo-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin`}></div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isAwake ? 'text-indigo-600' : 'text-slate-500'}`}>
                   {isAwake ? 'Syncing Design Node...' : 'Querying Trade Knowledge...'}
                 </span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isAwake ? "Collaborate on design..." : "Brief technical query..."}
                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-4 font-bold outline-none focus:border-blue-400 transition-all placeholder:italic"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className={`${isAwake ? 'bg-indigo-600 shadow-[0_4px_15px_rgba(79,70,229,0.4)]' : 'bg-slate-900'} text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50`}
              >
                {isAwake ? 'Process' : 'Send'}
              </button>
            </div>
          </div>
        </MetallicPanel>
      </div>
    </div>
  );
};

export default GrandMasterChat;