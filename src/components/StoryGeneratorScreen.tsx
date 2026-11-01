import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoryLength, StoryStyle, VideoDuration, GeneratedStory } from '../types';
import {
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  Clapperboard,
  Mic,
  BookOpen,
  Info,
  ShieldCheck,
  RefreshCw,
  Share2,
} from 'lucide-react';

export const StoryGeneratorScreen: React.FC = () => {
  const {
    language,
    theme,
    currentStory,
    setCurrentStory,
    saveProject,
    showToast,
    setActiveTab,
    customTopicInput,
    setCustomTopicInput,
  } = useApp();

  const [topic, setTopic] = useState(customTopicInput || 'Hazrat Ibrahim (AS) and the fire miracle');
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle>('cinematic-history');
  const [selectedLength, setSelectedLength] = useState<StoryLength>('detailed');
  const [selectedDuration, setSelectedDuration] = useState<VideoDuration>('60s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStoryViewTab, setActiveStoryViewTab] = useState<'ur' | 'roman' | 'en'>(language === 'ur' ? 'ur' : language === 'roman' ? 'roman' : 'en');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const styleOptions: { id: StoryStyle; labelEn: string; labelUr: string; labelRoman: string }[] = [
    { id: 'cinematic-history', labelEn: 'Cinematic Islamic History', labelUr: 'سنیمائی تاریخی داستان', labelRoman: 'Cinematic Islamic History' },
    { id: 'educational-doc', labelEn: 'Educational Documentary', labelUr: 'تعلیمی دستاویزی فلم', labelRoman: 'Educational Documentary' },
    { id: 'emotional-story', labelEn: 'Emotional Storytelling', labelUr: 'جذباتی و پرتاثیر بیان', labelRoman: 'Emotional Storytelling' },
    { id: '3d-animation', labelEn: '3D Animated Story', labelUr: 'تھری ڈی اینیمیشن', labelRoman: '3D Animation Style' },
    { id: 'realistic-reconstruction', labelEn: 'Realistic Reconstruction', labelUr: 'حقیقی تاریخی نقشہ کشی', labelRoman: 'Realistic Reconstruction' },
    { id: 'kids-moral', labelEn: 'Children\'s Moral Story', labelUr: 'بچوں کے اخلاقی اسباق', labelRoman: 'Kids Moral Stories' },
  ];

  const lengthOptions: { id: StoryLength; labelEn: string; labelUr: string }[] = [
    { id: 'short', labelEn: 'Short (Shorts/Reels)', labelUr: 'مختصر (یوٹیوب شارٹس)' },
    { id: 'detailed', labelEn: 'Detailed Story', labelUr: 'جامع و تفصیلی کہانی' },
    { id: 'educational', labelEn: 'Educational Story', labelUr: 'تعلیمی و فکری کہانی' },
    { id: 'emotional', labelEn: 'Emotional Script', labelUr: 'پرتاثیر صوتی سکرپٹ' },
    { id: 'youtube', labelEn: 'YouTube Long Script', labelUr: 'یوٹیوب ویڈیو سکرپٹ' },
  ];

  const durationOptions: { id: VideoDuration; label: string }[] = [
    { id: '30s', label: '30 Sec' },
    { id: '60s', label: '60 Sec' },
    { id: '2m', label: '2 Mins' },
    { id: '5m', label: '5 Mins' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleGenerateStory = async () => {
    if (!topic.trim()) {
      showToast(language === 'ur' ? 'براہ کرم موضوع درج کریں' : 'Please enter a topic');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          language,
          style: selectedStyle,
          length: selectedLength,
          duration: selectedDuration,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const newStory: GeneratedStory = {
          id: 'story-' + Date.now(),
          title: d.title || topic,
          titleUrdu: d.titleUrdu || topic,
          titleRoman: d.titleRoman || topic,
          category: 'prophets',
          topic,
          language,
          style: selectedStyle,
          length: selectedLength,
          duration: selectedDuration,
          storyContent: d.storyContent || '',
          urduNarration: d.urduNarration || '',
          romanUrduNarration: d.romanUrduNarration || '',
          englishNarration: d.englishNarration || '',
          moralLessons: d.moralLessons || [],
          references: d.references || [],
          scenes: currentStory?.scenes || [],
          targetVideoAi: 'veo',
          aspectRatio: '9:16',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setCurrentStory(newStory);
        showToast(language === 'ur' ? 'کہانی کامیابی سے تیار ہو گئی!' : 'Story generated successfully!');
      } else {
        throw new Error(resData.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.error(err);
      showToast(language === 'ur' ? 'خرابی، دوبارہ کوشش کریں' : 'Error generating story, please retry');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(language === 'ur' ? 'متن کاپی ہو گیا!' : 'Text copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleProceedToPrompts = () => {
    setActiveTab('prompts');
  };

  const handleProceedToVoiceover = () => {
    setActiveTab('voiceover');
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'ur'
                ? 'اسلامی کہانی ساز اسٹوڈیو'
                : language === 'roman'
                ? 'Islamic Story AI Studio'
                : 'Islamic Story AI Studio'}
            </span>
          </h2>
          <p className="text-xs text-emerald-200/80 font-urdu leading-tight">
            مستند قرآنی و احادیث حوالہ جات کے ساتھ کہانی و سکرپٹ تحریر کریں
          </p>
        </div>
        <button
          onClick={() => currentStory && saveProject(currentStory)}
          disabled={!currentStory}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-medium active:scale-95 disabled:opacity-40 transition-all"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ur' ? 'محفوظ کریں' : 'Save'}</span>
        </button>
      </div>

      {/* Islamic Integrity & Reverence Notice */}
      <div
        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
          theme === 'dark'
            ? 'bg-amber-950/20 border-amber-600/30 text-amber-200'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold flex items-center gap-1">
            <span>شرعی تقدس اور مستند حوالہ جات کا التزام</span>
            <span className="text-[10px] opacity-75 font-normal">• Reverence Directives</span>
          </p>
          <p className="text-[11px] opacity-90">
            اللہ تعالیٰ کی ذات پاک اور انبیاء کرام (علیہم السلام) کی جسمانی و چہرہ مبارک کی تصویر کشی سختی سے ممنوع ہے۔ کہانیاں مستند قرآنی آیات اور صحیح احادیث کے شواہد پر مبنی ہیں۔
          </p>
        </div>
      </div>

      {/* Generation Parameters Form */}
      <div
        className={`p-4 rounded-2xl border space-y-3.5 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        {/* Topic Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
            <span>
              {language === 'ur'
                ? 'کہانی کا موضوع یا واقعہ درج کریں:'
                : language === 'roman'
                ? 'Story Topic:'
                : 'Islamic Story Topic:'}
            </span>
            <span className="text-[10px] text-amber-400/80 font-normal">
              e.g. Hazrat Ibrahim (AS) & the fire miracle
            </span>
          </label>
          <textarea
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: حضرت ابراہیم علیہ السلام اور دہکتی آگ کا معجزہ..."
            className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors resize-none ${
              theme === 'dark'
                ? 'bg-emerald-950/60 border-emerald-800/60 text-white placeholder-emerald-400/30 focus:border-amber-400/70'
                : 'bg-emerald-50/50 border-emerald-200 text-gray-900 placeholder-emerald-800/40 focus:border-emerald-600'
            } ${language === 'ur' ? 'font-urdu text-right' : ''}`}
          />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-[10px] text-emerald-300/70 shrink-0">
            {language === 'ur' ? 'تجویز کردہ:' : 'Ideas:'}
          </span>
          {[
            { en: 'Ashab-ul-Ukhdood', ur: 'اصحاب الاخدود' },
            { en: 'Hazrat Sulaiman (AS) & Hudhud', ur: 'حضرت سلیمان اور ہدہد' },
            { en: 'Hazrat Bilal (RA) & Ahad! Ahad!', ur: 'حضرت بلال حبشی' },
            { en: 'Hazrat Umar (RA) night rounds', ur: 'حضرت عمر کا گشت' },
            { en: 'Hazrat Yunus (AS) in whale', ur: 'حضرت یونس اور مچھلی' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTopic(language === 'ur' ? item.ur : item.en)}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/40 whitespace-nowrap active:scale-95 transition-all"
            >
              {language === 'ur' ? item.ur : item.en}
            </button>
          ))}
        </div>

        {/* Visual / Narrative Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-200">
            {language === 'ur'
              ? 'کہانی و بصری انداز (Story & Visual Style):'
              : 'Story & Visual Style:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {styleOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedStyle(opt.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border text-left truncate transition-all ${
                  selectedStyle === opt.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : theme === 'dark'
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200 hover:bg-emerald-900/30'
                    : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                {language === 'ur' ? opt.labelUr : opt.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Story Format & Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Story Format */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-200">
              {language === 'ur' ? 'کہانی کی نوعیت (Format):' : 'Story Format:'}
            </label>
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(e.target.value as StoryLength)}
              className={`w-full px-2.5 py-2 rounded-xl text-xs border ${
                theme === 'dark'
                  ? 'bg-emerald-950 border-emerald-800 text-white'
                  : 'bg-white border-emerald-200 text-gray-900'
              }`}
            >
              {lengthOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {language === 'ur' ? opt.labelUr : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-200">
              {language === 'ur' ? 'ویڈیو کا دورانیہ (Target Duration):' : 'Target Duration:'}
            </label>
            <div className="flex items-center gap-1.5">
              {durationOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDuration(d.id)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                    selectedDuration === d.id
                      ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                      : theme === 'dark'
                      ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-200'
                      : 'bg-white border-emerald-200 text-emerald-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleGenerateStory}
          disabled={isGenerating}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-950" />
              <span>
                {language === 'ur' ? 'کہانی تیار ہو رہی ہے...' : 'Generating Islamic Story...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>
                {language === 'ur' ? 'کہانی اور سکرپٹ تیار کریں' : 'Generate Islamic Story & Script'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Generated Story Display */}
      {currentStory && (
        <div className="space-y-3">
          {/* Language Tabs for the Story */}
          <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveStoryViewTab('ur')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeStoryViewTab === 'ur'
                    ? 'bg-amber-500 text-emerald-950 shadow-sm'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                اردو متن
              </button>
              <button
                onClick={() => setActiveStoryViewTab('roman')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeStoryViewTab === 'roman'
                    ? 'bg-amber-500 text-emerald-950 shadow-sm'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                Roman Urdu
              </button>
              <button
                onClick={() => setActiveStoryViewTab('en')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeStoryViewTab === 'en'
                    ? 'bg-amber-500 text-emerald-950 shadow-sm'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                English Script
              </button>
            </div>

            <button
              onClick={() => {
                const textToCopy =
                  activeStoryViewTab === 'ur'
                    ? currentStory.urduNarration
                    : activeStoryViewTab === 'roman'
                    ? currentStory.romanUrduNarration
                    : currentStory.storyContent;
                handleCopy(textToCopy, 'story-text');
              }}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
            >
              {copiedKey === 'story-text' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'کاپی شدہ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'کاپی کریں' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Story Card */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              theme === 'dark'
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-100'
                : 'bg-white border-emerald-100 text-gray-900 shadow-sm'
            }`}
          >
            <h3
              className={`text-sm sm:text-base font-bold text-amber-400 ${
                activeStoryViewTab === 'ur' ? 'font-urdu text-right text-lg' : ''
              }`}
            >
              {activeStoryViewTab === 'ur'
                ? currentStory.titleUrdu
                : activeStoryViewTab === 'roman'
                ? currentStory.titleRoman
                : currentStory.title}
            </h3>

            <div
              className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                activeStoryViewTab === 'ur' ? 'font-urdu text-right text-base leading-loose' : ''
              }`}
            >
              {activeStoryViewTab === 'ur'
                ? currentStory.urduNarration
                : activeStoryViewTab === 'roman'
                ? currentStory.romanUrduNarration
                : currentStory.storyContent}
            </div>
          </div>

          {/* Authentic Quranic & Hadith References Card */}
          {currentStory.references && currentStory.references.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                theme === 'dark'
                  ? 'bg-emerald-950/20 border-emerald-800/30'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <BookOpen className="w-4 h-4" />
                <span>
                  {language === 'ur'
                    ? 'مستند قرآنی و احادیث کے حوالہ جات'
                    : 'Authentic Quranic & Hadith References'}
                </span>
              </div>

              <div className="space-y-2">
                {currentStory.references.map((ref, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                      theme === 'dark'
                        ? 'bg-emerald-950/40 border-emerald-800/40'
                        : 'bg-white border-emerald-100 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono text-[11px]">
                        {ref.source}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-semibold">
                        {ref.type}
                      </span>
                    </div>
                    {ref.arabicText && (
                      <p className="font-arabic text-sm text-right text-amber-200/90 leading-relaxed pt-1">
                        {ref.arabicText}
                      </p>
                    )}
                    <p className="text-[11px] text-emerald-100/90 italic">
                      "{ref.translation}"
                    </p>
                    <p className="text-[10px] text-emerald-400/80">
                      ✓ {ref.authenticityNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moral Lessons (Akhlaq & Adab) */}
          {currentStory.moralLessons && currentStory.moralLessons.length > 0 && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2 ${
                theme === 'dark'
                  ? 'bg-emerald-950/20 border-emerald-800/30'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>✦</span>
                <span>
                  {language === 'ur'
                    ? 'کہانی کے اخلاقی و ایمانی اسباق'
                    : 'Core Moral & Spiritual Takeaways'}
                </span>
              </span>
              <ul className="space-y-1.5">
                {currentStory.moralLessons.map((lesson, idx) => (
                  <li
                    key={idx}
                    className={`text-xs flex items-start gap-2 ${
                      language === 'ur' ? 'font-urdu text-right flex-row-reverse' : ''
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span className="text-emerald-100/90">{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Workflow Next Step Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleProceedToPrompts}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Clapperboard className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'ur' ? 'AI ویڈیو پرامپٹس بنائیں' : 'Convert to AI Prompts'}
              </span>
            </button>

            <button
              onClick={handleProceedToVoiceover}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Mic className="w-4 h-4 text-amber-200" />
              <span>
                {language === 'ur' ? 'صوتی بیانیہ سٹوڈیو' : 'Voice-over Studio'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
