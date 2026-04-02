import React from 'react';
import { MessageSquareWarning } from 'lucide-react';

interface BetaFeedbackButtonProps {
  onClick: () => void;
  shouldFlash: boolean;
}

const BetaFeedbackButton: React.FC<BetaFeedbackButtonProps> = ({ onClick, shouldFlash }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 z-[120] h-14 w-14 rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-600 to-indigo-700 text-white luxury-shadow transition-all hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] ${
        shouldFlash ? 'animate-beta-feedback-attention' : ''
      }`}
      title="Beta Feedback"
      aria-label="Open beta feedback form"
    >
      <span className="sr-only">Open beta feedback form</span>
      <div className="flex h-full w-full items-center justify-center">
        <MessageSquareWarning size={24} />
      </div>
    </button>
  );
};

export default BetaFeedbackButton;
