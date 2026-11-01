import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Moon, Sun, Smartphone, Monitor, Globe, ChevronDown, Check, BookOpen, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    aiStatus,
    isAndroidFrame,
    setIsAndroidFrame,
    setActiveTab,
  } = useApp();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getLanguageLabel = () => {
    switch (language) {
      case 'ur':
        return 'اردو (Urdu)';
      case 'roman':
        return 'Roman Urdu';
      case 'en':
        return 'English';
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        theme === 'dark'
          ? 'bg-emerald-950/80 border-emerald-900/60 text-emerald-100'
          : 'bg-emerald-900/90 border-emerald-800 text-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <span className="text-amber-400 text-lg font-bold font-arabic leading-none">📖</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-1">
                Islamic Story AI Studio
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-urdu text-emerald-200/90 leading-tight">
              اسلامی کہانی AI اسٹوڈیو
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Status Badge */}
          <div
            onClick={() => setActiveTab('settings')}
            title={aiStatus.isConfigured ? 'Gemini 3.8 Flash Active' : 'Islamic Knowledge Engine Active'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-700/50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.isConfigured ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px] text-emerald-200">
              {aiStatus.isConfigured ? 'Gemini 3.8 AI' : 'Studio Engine'}
            </span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white/10 hover:bg-white/15 active:scale-95 text-emerald-100 border border-white/10"
              aria-label="Language selector"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{getLanguageLabel()}</span>
              <span className="sm:hidden font-bold">{language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div
                  className={`absolute right-0 mt-1 w-44 rounded-xl shadow-2xl py-1.5 z-40 border text-xs font-medium backdrop-blur-lg ${
                    theme === 'dark'
                      ? 'bg-emerald-950/95 border-emerald-800 text-emerald-100'
                      : 'bg-white border-emerald-100 text-gray-800'
                  }`}
                >
                  <button
                    onClick={() => {
                      setLanguage('ur');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-right hover:bg-emerald-500/15 ${
                      language === 'ur' ? 'text-amber-400 font-bold' : ''
                    }`}
                  >
                    <span className="font-urdu text-sm">اردو (Urdu)</span>
                    {language === 'ur' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('roman');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-emerald-500/15 ${
                      language === 'roman' ? 'text-amber-400 font-bold' : ''
                    }`}
                  >
                    <span>Roman Urdu</span>
                    {language === 'roman' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-emerald-500/15 ${
                      language === 'en' ? 'text-amber-400 font-bold' : ''
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-emerald-100 border border-white/10"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* Android Mobile Frame vs Full Screen Toggle (for desktop/tablet preview) */}
          <button
            onClick={() => setIsAndroidFrame(!isAndroidFrame)}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-emerald-100 border border-white/10 text-xs font-medium"
            title={isAndroidFrame ? 'Switch to Fullscreen Studio' : 'Switch to Android Mobile Mockup'}
          >
            {isAndroidFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Android View</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-emerald-100 border border-white/10"
            title="Settings & APK Build Guide"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
