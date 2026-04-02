import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Paperclip, SendHorizontal } from 'lucide-react';
import MetallicPanel from './MetallicPanel.tsx';
import { BetaFeedbackSubmission } from '../types.ts';

interface BetaFeedbackModalProps {
  activeTab: 'home' | 'vault' | 'toolbox' | 'foreman' | 'new';
  defaultEmail?: string;
  onClose: () => void;
  onSubmit: (payload: Omit<BetaFeedbackSubmission, 'id' | 'createdAt' | 'source'>) => Promise<void>;
}

const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ activeTab, defaultEmail = '', onClose, onSubmit }) => {
  const [category, setCategory] = useState<'Bug' | 'Suggestion' | 'Feature Request'>('Bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  const onPickScreenshot = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    const cleaned = message.trim();
    if (!cleaned || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        message: cleaned,
        email: email.trim() || undefined,
        category,
        screenshotDataUrl,
        activeTab,
        userAgent: navigator.userAgent,
        userId: null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <MetallicPanel className="w-full max-w-2xl max-h-[92vh] flex flex-col relative" title="Beta Test Feedback">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 text-xl font-bold z-10 transition-colors">
          ✕
        </button>

        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-6 mt-2 pr-2">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Bug', 'Suggestion', 'Feature Request'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setCategory(option)}
                  className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    category === option
                      ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue / Suggestion Details</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Tell us exactly what happened, what you expected, and any steps to reproduce."
              className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional Email for Follow-up</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-800 text-white border border-white/10 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional Screenshot Attachment</label>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            <button
              onClick={onPickScreenshot}
              className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Paperclip size={14} />
              Attach Screenshot
            </button>
            {screenshotDataUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img src={screenshotDataUrl} alt="Attached screenshot" className="max-h-56 w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex gap-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-4 rounded-xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white/5 transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !message.trim()}
            className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
            Submit Feedback
          </button>
        </div>
      </MetallicPanel>
    </div>
  );
};

export default BetaFeedbackModal;
