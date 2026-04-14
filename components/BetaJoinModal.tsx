import React, { useEffect, useState } from 'react';
import { Loader2, Rocket, Mail, Phone } from 'lucide-react';
import MetallicPanel from './MetallicPanel';
import { BetaJoinSubmissionPayload } from '../types';

interface BetaJoinModalProps {
  defaultEmail?: string;
  onSubmit: (payload: BetaJoinSubmissionPayload) => Promise<void>;
}

const BetaJoinModal: React.FC<BetaJoinModalProps> = ({ defaultEmail = '', onSubmit }) => {
  const [email, setEmail] = useState(defaultEmail);
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  const submit = async () => {
    const cleanedEmail = email.trim();
    const cleanedContact = contactInfo.trim();
    if (!cleanedEmail || !cleanedContact || submitting) {
      setError('Email and contact info are required to join beta for free.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        email: cleanedEmail,
        contactInfo: cleanedContact,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <MetallicPanel className="w-full max-w-2xl" title="Join EstiMetric Beta Free">
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <Rocket size={18} className="text-emerald-300 mt-0.5" />
              <p className="text-sm text-slate-100 leading-relaxed">
                During beta, access is free. To continue, join with your contact details so we can follow up on feedback and ship a stronger final release.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Email (Required)</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-800 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 font-bold outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info (Required)</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-3.5 text-slate-500" />
              <textarea
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                rows={3}
                placeholder="Phone number, business name, Telegram/WhatsApp, or preferred contact method."
                className="w-full bg-slate-800 text-white border border-white/10 rounded-xl py-3 pl-10 pr-3 font-bold outline-none focus:border-blue-500 transition-colors resize-y"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-300 font-bold">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            Join Beta Free
          </button>
        </div>
      </MetallicPanel>
    </div>
  );
};

export default BetaJoinModal;
