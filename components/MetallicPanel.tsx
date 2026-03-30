import React from 'react';

interface MetallicPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const MetallicPanel: React.FC<MetallicPanelProps> = ({ children, className = "", title }) => {
  return (
    <div className={`brushed-metal rounded-[2rem] overflow-hidden luxury-shadow relative flex flex-col ${className}`}>
      {title && (
        <div className="px-8 pt-8 pb-2 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <h2 className="text-lg font-black text-white tracking-widest uppercase font-['Montserrat']">
              {title}
            </h2>
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mt-6"></div>
        </div>
      )}
      <div className="p-8 flex-1 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MetallicPanel;