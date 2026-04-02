import React from 'react';
import { ShieldAlert } from 'lucide-react';
import MetallicPanel from './MetallicPanel.tsx';

interface FirstRunBetaModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

const FirstRunBetaModal: React.FC<FirstRunBetaModalProps> = ({ onAccept, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
      <MetallicPanel className="w-full max-w-3xl" title="Beta Pre-Release Notice">
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="mt-0.5 text-amber-400">
              <ShieldAlert size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">Important</h3>
              <p className="text-sm leading-relaxed text-slate-200">
                Welcome to EstiMetric. This Android build is currently in a beta pre-release phase. You may encounter bugs,
                glitches, or unexpected behavior while testing. Your prompt, detailed feedback is genuinely appreciated and is
                extremely helpful in ensuring we get everything right before official release.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-slate-300">
              You’ll see a temporary Beta Feedback button at the bottom of the app. Tap it any time to quickly submit issues,
              suggestions, or feature requests. You can also attach a screenshot and optionally include your email address if
              you want a response from our team.
            </p>
          </div>

          <p className="text-right text-sm font-bold text-blue-300">
            -Rob Branting of Blacklisted Binary Labs, creator
          </p>

          <div className="pt-2 border-t border-white/10 flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-xl border border-red-400/40 text-red-300 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
            >
              Cancel &amp; Exit
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
            >
              Accept to Continue
            </button>
          </div>
        </div>
      </MetallicPanel>
    </div>
  );
};

export default FirstRunBetaModal;
