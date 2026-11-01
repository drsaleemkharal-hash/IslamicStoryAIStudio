import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Sparkles, Clapperboard, Mic, FolderHeart } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, theme, language } = useApp();

  const navItems = [
    {
      id: 'home' as const,
      icon: Home,
      labelEn: 'Home',
      labelUr: 'ہوم',
      labelRoman: 'Home',
    },
    {
      id: 'generator' as const,
      icon: Sparkles,
      labelEn: 'Story AI',
      labelUr: 'کہانی اسٹوڈیو',
      labelRoman: 'Story Studio',
    },
    {
      id: 'prompts' as const,
      icon: Clapperboard,
      labelEn: 'AI Prompts',
      labelUr: 'ویڈیو پرامپٹ',
      labelRoman: 'Video Prompts',
    },
    {
      id: 'voiceover' as const,
      icon: Mic,
      labelEn: 'Voice-over',
      labelUr: 'صوتی اسٹوڈیو',
      labelRoman: 'Voice-over',
    },
    {
      id: 'saved' as const,
      icon: FolderHeart,
      labelEn: 'Projects',
      labelUr: 'محفوظ',
      labelRoman: 'Projects',
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg transition-colors pb-safe ${
        theme === 'dark'
          ? 'bg-emerald-950/90 border-emerald-900/70 text-emerald-300'
          : 'bg-white/95 border-emerald-100 text-emerald-900 shadow-lg'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 sm:py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const label =
            language === 'ur'
              ? item.labelUr
              : language === 'roman'
              ? item.labelRoman
              : item.labelEn;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1.5 rounded-xl transition-all relative group ${
                isActive
                  ? theme === 'dark'
                    ? 'text-amber-400 font-semibold'
                    : 'text-emerald-800 font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {isActive && (
                <span
                  className={`absolute -top-1 w-8 h-1 rounded-full ${
                    theme === 'dark' ? 'bg-amber-400' : 'bg-emerald-600'
                  }`}
                />
              )}
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-amber-500/15' : 'group-hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
              </div>
              <span
                className={`text-[10px] sm:text-[11px] truncate max-w-[68px] ${
                  language === 'ur' ? 'font-urdu font-medium text-[11px]' : ''
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
