import React from 'react';
import { LayoutTemplate, PanelsTopLeft, Grid2X2, WandSparkles, Wrench, Bot } from 'lucide-react';

type TemplateVariant = 'home' | 'vault' | 'new' | 'toolbox' | 'foreman';

interface ComposeInspiredTemplateProps {
  variant: TemplateVariant;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const variantConfig: Record<TemplateVariant, { icon: React.ReactNode; accent: string; label: string }> = {
  home: {
    icon: <PanelsTopLeft size={14} />,
    accent: 'from-blue-500/15 to-indigo-500/10',
    label: 'Dashboard Template',
  },
  vault: {
    icon: <Grid2X2 size={14} />,
    accent: 'from-violet-500/15 to-slate-500/10',
    label: 'Collection Template',
  },
  new: {
    icon: <WandSparkles size={14} />,
    accent: 'from-cyan-500/15 to-blue-500/10',
    label: 'Wizard Template',
  },
  toolbox: {
    icon: <Wrench size={14} />,
    accent: 'from-emerald-500/15 to-teal-500/10',
    label: 'Tools Template',
  },
  foreman: {
    icon: <Bot size={14} />,
    accent: 'from-amber-500/15 to-orange-500/10',
    label: 'Assistant Template',
  },
};

const ComposeInspiredTemplate: React.FC<ComposeInspiredTemplateProps> = ({ variant, title, subtitle, children }) => {
  const config = variantConfig[variant];

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${config.accent} p-5 md:p-6`}>
      <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-white">{title}</h3>
            <p className="mt-1 text-xs md:text-sm font-bold tracking-wide text-slate-300">{subtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-100">
            <LayoutTemplate size={13} />
            {config.icon}
            <span>{config.label}</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ComposeInspiredTemplate;
