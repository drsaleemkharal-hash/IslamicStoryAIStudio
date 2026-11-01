import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, theme } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-medium border backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50'
            : 'bg-emerald-900/90 text-white border-emerald-400/40 shadow-emerald-900/30'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
