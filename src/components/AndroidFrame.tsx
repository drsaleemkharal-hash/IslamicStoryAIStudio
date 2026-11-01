import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Wifi, BatteryMedium, Signal, ChevronLeft, Circle, Square } from 'lucide-react';

export const AndroidFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAndroidFrame, theme, setActiveTab, activeTab } = useApp();
  const [time, setTime] = useState<string>('08:45');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSystemBack = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  const handleSystemHome = () => {
    setActiveTab('home');
  };

  const handleSystemRecents = () => {
    setActiveTab('saved');
  };

  if (!isAndroidFrame) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-0 sm:p-4 md:p-6 transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#02130e] via-[#041f17] to-[#010c09]'
          : 'bg-gradient-to-br from-emerald-50 via-slate-100 to-amber-50/40'
      }`}
    >
      {/* Android Device Shell */}
      <div className="relative w-full max-w-[440px] h-[100dvh] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden border-0 sm:border-[8px] sm:border-slate-800 ring-1 ring-white/10">
        {/* Phone Speaker & Camera punch hole (Simulated Android) */}
        <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex items-center justify-center pt-2 hidden sm:flex">
          <div className="w-4 h-4 rounded-full bg-black/90 ring-2 ring-slate-800/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
          </div>
        </div>

        {/* Android Status Bar */}
        <div
          className={`h-7 px-5 shrink-0 flex items-center justify-between text-[11px] font-semibold tracking-tight select-none z-40 ${
            theme === 'dark' ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-900 text-white'
          }`}
        >
          <span>{time}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold tracking-wider">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* App Content viewport with custom scrollbar */}
        <div className="flex-1 overflow-y-auto flex flex-col relative pb-16">
          {children}
        </div>

        {/* Android 3-Button System Navigation Bar at bottom */}
        <div
          className={`h-8 shrink-0 flex items-center justify-around px-8 select-none border-t z-30 ${
            theme === 'dark'
              ? 'bg-emerald-950 border-emerald-900/60 text-emerald-400'
              : 'bg-white border-emerald-100 text-emerald-800'
          }`}
        >
          <button
            onClick={handleSystemBack}
            className="p-1 rounded-full hover:bg-emerald-500/20 active:scale-90 transition-transform"
            title="Android Back"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleSystemHome}
            className="p-1 rounded-full hover:bg-emerald-500/20 active:scale-90 transition-transform"
            title="Android Home"
            aria-label="Home"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSystemRecents}
            className="p-1 rounded-full hover:bg-emerald-500/20 active:scale-90 transition-transform"
            title="Android Recents / Projects"
            aria-label="Recents"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
