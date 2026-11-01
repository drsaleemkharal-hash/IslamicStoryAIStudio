import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURATED_TOPICS } from '../data/islamicStories';
import {
  Sparkles,
  Clapperboard,
  Mic,
  FolderHeart,
  Search,
  ArrowRight,
  Flame,
  ShieldAlert,
  Feather,
  Mountain,
  HeartHandshake,
  Scale,
  Crown,
  Waves,
  CheckCircle,
  Anchor,
  BookOpen,
  Compass,
  ScrollText,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    language,
    theme,
    setActiveTab,
    loadCuratedTopic,
    customTopicInput,
    setCustomTopicInput,
    savedProjects,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Map icon names to lucide components
  const getIcon = (name: string) => {
    switch (name) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-cyan-400" />;
      case 'Mountain':
        return <Mountain className="w-5 h-5 text-amber-400" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-rose-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-yellow-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-amber-300" />;
      case 'Waves':
        return <Waves className="w-5 h-5 text-blue-400" />;
      case 'CheckCircle':
        return <CheckCircle className="w-5 h-5 text-emerald-300" />;
      case 'Anchor':
        return <Anchor className="w-5 h-5 text-indigo-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
    }
  };

  const categories = [
    { id: 'all', labelEn: 'All Topics', labelUr: 'تمام موضوعات', labelRoman: 'All Topics' },
    { id: 'prophets', labelEn: 'Prophets (AS)', labelUr: 'قصص الانبیاء', labelRoman: 'Stories of Prophets' },
    { id: 'quran', labelEn: 'Quranic Stories', labelUr: 'قرآنی واقعات', labelRoman: 'Quranic Events' },
    { id: 'companions', labelEn: 'Companions (RA)', labelUr: 'صحابہ کرام', labelRoman: 'Sahaba Ikram' },
    { id: 'moral', labelEn: 'Moral & Akhlaq', labelUr: 'اخلاقی اسباق', labelRoman: 'Moral Lessons' },
  ];

  const filteredTopics = CURATED_TOPICS.filter((topic) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' || topic.category === selectedCategoryFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesQuery =
      topic.titleEn.toLowerCase().includes(query) ||
      topic.titleUr.toLowerCase().includes(query) ||
      topic.titleRoman.toLowerCase().includes(query) ||
      topic.summaryEn.toLowerCase().includes(query) ||
      topic.summaryUr.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const handleStartCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopicInput.trim()) {
      setActiveTab('generator');
    }
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Bismillah Hero Card */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border shadow-xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-emerald-950 via-[#063f2f] to-[#032b20] border-emerald-800/60 shadow-emerald-950/60'
            : 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 border-emerald-600 shadow-emerald-900/20 text-white'
        }`}
      >
        {/* Subtle geometric circle background */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="text-center space-y-2 relative z-10">
          <p className="font-arabic text-xl sm:text-2xl text-amber-300 font-bold tracking-wide select-none">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Islamic Story AI Studio</span>
          </h2>
          <p className="text-xs sm:text-sm font-urdu text-emerald-200/90 max-w-sm mx-auto leading-relaxed">
            مستند قرآنی و تاریخی کہانیاں، سین بہ سین AI ویڈیو پرامپٹس اور پرتاثیر صوتی بیانیہ
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-amber-200 font-medium">
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
              YouTube Shorts 9:16
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
              Veo & Kling Ready
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
              Urdu Narration
            </span>
          </div>
        </div>

        {/* Quick Topic Search & Instant Generator Bar */}
        <form onSubmit={handleStartCustom} className="mt-4 relative z-10">
          <div className="flex items-center gap-2 bg-emerald-950/70 p-1.5 rounded-xl border border-emerald-700/60 shadow-inner">
            <input
              type="text"
              value={customTopicInput}
              onChange={(e) => setCustomTopicInput(e.target.value)}
              placeholder={
                language === 'ur'
                  ? 'کوئی بھی اسلامی کہانی یا موضوع لکھیں... (مثلاً: حضرت ابراہیم علیہ السلام اور آگ)'
                  : language === 'roman'
                  ? 'Koi bhi Islamic story topic enter karein...'
                  : 'Enter any Islamic topic (e.g., Hazrat Ibrahim AS fire miracle)...'
              }
              className={`flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-emerald-300/50 focus:outline-none ${
                language === 'ur' ? 'font-urdu text-right' : ''
              }`}
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ur' ? 'شروع کریں' : 'Generate'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4 Core Studio Quick Access Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('generator')}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group shadow-sm ${
            theme === 'dark'
              ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/30 text-emerald-100'
              : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900 shadow-sm'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold leading-tight">
            {language === 'ur' ? 'کہانی ساز' : 'Story AI'}
          </span>
          <span className="text-[10px] opacity-70">
            {language === 'ur' ? 'تحریر و مکالمے' : 'Script & Dialogues'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group shadow-sm ${
            theme === 'dark'
              ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/30 text-emerald-100'
              : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900 shadow-sm'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Clapperboard className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold leading-tight">
            {language === 'ur' ? 'ویڈیو پرامپٹس' : 'AI Video Prompts'}
          </span>
          <span className="text-[10px] opacity-70">
            {language === 'ur' ? '5 سے 30 مناظر' : 'Veo & Kling 9:16'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('voiceover')}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group shadow-sm ${
            theme === 'dark'
              ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/30 text-emerald-100'
              : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900 shadow-sm'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold leading-tight">
            {language === 'ur' ? 'صوتی اسٹوڈیو' : 'Voice-over Studio'}
          </span>
          <span className="text-[10px] opacity-70">
            {language === 'ur' ? 'وقفے و لب و لہجہ' : 'TTS & Pacing'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group shadow-sm ${
            theme === 'dark'
              ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/30 text-emerald-100'
              : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-900 shadow-sm'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <FolderHeart className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-bold leading-tight">
            {language === 'ur' ? 'محفوظ پروجیکٹس' : 'Saved Projects'}
          </span>
          <span className="text-[10px] opacity-70">
            {savedProjects.length} {language === 'ur' ? 'محفوظ' : 'Saved'}
          </span>
        </button>
      </div>

      {/* Search & Topic Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ur'
                ? 'مستند اسلامی واقعات تلاش کریں...'
                : language === 'roman'
                ? 'Search Islamic stories and topics...'
                : 'Search authentic Islamic stories...'
            }
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border transition-colors ${
              theme === 'dark'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-white placeholder-emerald-400/40 focus:border-amber-400/60'
                : 'bg-white border-emerald-200 text-gray-900 placeholder-emerald-800/40 focus:border-emerald-600'
            }`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategoryFilter === cat.id;
            const label =
              language === 'ur'
                ? cat.labelUr
                : language === 'roman'
                ? cat.labelRoman
                : cat.labelEn;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curated Story Ideas Carousel / List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-1.5">
            <ScrollText className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'ur'
                ? 'منتخب اسلامی کہانیاں اور موضوعات'
                : language === 'roman'
                ? 'Muntakhab Islamic Stories'
                : 'Curated Authentic Islamic Topics'}
            </span>
          </h3>
          <span className="text-[11px] opacity-60">
            {filteredTopics.length} {language === 'ur' ? 'موضوعات' : 'topics'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {filteredTopics.map((item) => (
            <div
              key={item.id}
              onClick={() => loadCuratedTopic(item.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] shadow-sm relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-emerald-950/30 border-emerald-800/40 hover:bg-emerald-900/40 hover:border-amber-500/40'
                  : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getIcon(item.iconName)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {item.badge}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {item.recommendedScenes} {language === 'ur' ? 'مناظر' : 'Scenes'}
                    </span>
                  </div>

                  <h4
                    className={`text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors ${
                      language === 'ur' ? 'font-urdu text-right text-base' : ''
                    }`}
                  >
                    {language === 'ur'
                      ? item.titleUr
                      : language === 'roman'
                      ? item.titleRoman
                      : item.titleEn}
                  </h4>

                  <p
                    className={`text-[11px] line-clamp-2 text-emerald-200/80 leading-relaxed ${
                      language === 'ur' ? 'font-urdu text-right' : ''
                    }`}
                  >
                    {language === 'ur' ? item.summaryUr : item.summaryEn}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
                    <span className="truncate max-w-[240px]">{item.keyVerseOrHadith}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>{language === 'ur' ? 'اسٹوڈیو میں کھولیں' : 'Load'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
