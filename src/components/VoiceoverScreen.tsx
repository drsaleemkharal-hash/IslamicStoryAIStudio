import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Play,
  Pause,
  Square,
  Volume2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Info,
  BookOpen,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const VoiceoverScreen: React.FC = () => {
  const {
    language,
    theme,
    currentStory,
    showToast,
  } = useApp();

  const [activeLangTab, setActiveLangTab] = useState<'ur' | 'roman' | 'en'>(
    language === 'ur' ? 'ur' : language === 'roman' ? 'roman' : 'en'
  );
  const [selectedTone, setSelectedTone] = useState<'emotional' | 'calm' | 'documentary'>('emotional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Text-To-Speech state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);

  // Narration script data
  const [urduScript, setUrduScript] = useState<string>(() => {
    return (
      currentStory?.urduNarration ||
      `[وقفہ 1 سیکنڈ]\nبسم اللہ الرحمن الرحیم\n[پرتاثیر لہجہ]\nیہ داستان ہے سچے ایمان اور استقامت کی...\n[وقفہ 1.5 سیکنڈ]\nجب نمرود نے دہکتی آگ کا الاؤ جلایا، تو خلیل اللہ نے فرمایا: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ"\n[وقفہ 2 سیکنڈ]\nاور رب کے حکم سے دہکتی آگ ٹھنڈی اور سلامتی والی بن گئی۔`
    );
  });

  const [romanScript, setRomanScript] = useState<string>(() => {
    return (
      currentStory?.romanUrduNarration ||
      `[Pause 1s]\nBismillahir Rahmanir Raheem.\n[Emotional Storytelling Tone]\nYeh daastan hai sachi himmat aur be-misal Tawakkul ki...\n[Pause 1.5s]\nJab saari duniya mukhalif thi, Hazrat Ibrahim (AS) ne sirf Allah par bharosa kiya: "Hasbunallahu wa ni'mal wakeel."\n[Pause 2s]\nAur dekhiye, kaise Allah ne aag ko gulzar bana diya!`
    );
  });

  const [englishScript, setEnglishScript] = useState<string>(() => {
    return (
      currentStory?.englishNarration ||
      `[Pause 1s]\nIn the Name of Allah, the Most Gracious, the Most Merciful.\n[Warm, reverent documentary voice]\nThroughout history, when all worldly support vanished, the believers stood firm on one unshakeable truth.\n[Pause 1.5s]\n"Sufficient for us is Allah, and He is the best Disposer of affairs."\n[Gentle crescendo]\nA testament that faith in the Divine transforms trials into triumphs.`
    );
  });

  const [pronunciationGuide, setPronunciationGuide] = useState<
    { term: string; pronunciation: string; meaning: string }[]
  >([
    { term: 'Tawakkul', pronunciation: 'Ta-wak-kul', meaning: 'Absolute reliance upon Allah' },
    { term: 'Hasbunallah', pronunciation: 'Has-bu-nal-lah', meaning: 'Allah is sufficient for us' },
    { term: 'Al-Khalil', pronunciation: 'Al-Kha-leel', meaning: 'The Intimate Friend (Title of Ibrahim AS)' },
    { term: 'Bardan wa Salama', pronunciation: 'Bar-dan wa Sa-la-ma', meaning: 'Coolness and peace' },
  ]);

  // Load browser TTS voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleGenerateVoiceover = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentStory?.topic || 'Islamic Moral Story',
          tone: selectedTone,
          targetDuration: currentStory?.duration || '60s',
          language,
          storyText: currentStory?.storyContent || '',
        }),
      });

      const res = await response.json();
      if (res.data) {
        if (res.data.urduScript) setUrduScript(res.data.urduScript);
        if (res.data.romanUrduScript) setRomanScript(res.data.romanUrduScript);
        if (res.data.englishScript) setEnglishScript(res.data.englishScript);
        if (res.data.pronunciationGuide) setPronunciationGuide(res.data.pronunciationGuide);
        showToast(language === 'ur' ? 'صوتی سکرپٹ تیار ہو گیا!' : 'Voice-over script generated!');
      }
    } catch (e) {
      console.error(e);
      showToast(language === 'ur' ? 'خرابی، دوبارہ کوشش کریں' : 'Error generating script');
    } finally {
      setIsGenerating(false);
    }
  };

  const getActiveScriptText = () => {
    switch (activeLangTab) {
      case 'ur':
        return urduScript;
      case 'roman':
        return romanScript;
      case 'en':
        return englishScript;
    }
  };

  const cleanScriptForTTS = (text: string) => {
    // Strip pause brackets like [Pause 1.5s] or [وقفہ 1 سیکنڈ] for speech synthesizer
    return text.replace(/\[.*?\]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const handlePlayTTS = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-To-Speech is not supported in this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const raw = getActiveScriptText();
    const cleanText = cleanScriptForTTS(raw);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    } else {
      // Auto assign language
      if (activeLangTab === 'ur') {
        utterance.lang = 'ur-PK';
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleCopyScript = (key: string) => {
    navigator.clipboard.writeText(getActiveScriptText());
    setCopiedKey(key);
    showToast(language === 'ur' ? 'سکرپٹ کاپی ہو گیا!' : 'Script copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSRT = () => {
    const raw = getActiveScriptText();
    const lines = raw.split('\n').filter((l) => l.trim().length > 0);
    let srtContent = '';
    let currentTime = 1;

    lines.forEach((line, idx) => {
      const startSec = currentTime;
      const endSec = startSec + Math.max(Math.round(line.length / 15), 3);
      currentTime = endSec + 1;

      const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},000`;
      };

      srtContent += `${idx + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${cleanScriptForTTS(line)}\n\n`;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Narration_Subtitles_${currentStory?.title.replace(/\s+/g, '_') || 'Story'}.srt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SRT Subtitles downloaded!');
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-amber-400" />
          <span>
            {language === 'ur'
              ? 'صوتی بیانیہ و نریشن اسٹوڈیو'
              : 'Voice-over & Narration Studio'}
          </span>
        </h2>
        <p className="text-xs text-emerald-200/80 font-urdu leading-tight">
          وقفوں، تلفظ کی رہنمائی اور صوتی پریویو کے ساتھ معیاری وائس اوور سکرپٹ
        </p>
      </div>

      {/* Tone Selection and Generator Controls */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-200">
            {language === 'ur' ? 'صوتی لب و لہجہ (Narration Tone):' : 'Narration Tone:'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'emotional', labelEn: 'Emotional', labelUr: 'پرتاثیر و جذباتی' },
              { id: 'calm', labelEn: 'Calm Educational', labelUr: 'پرسکون تعلیمی' },
              { id: 'documentary', labelEn: 'Documentary', labelUr: 'دستاویزی و تاریخی' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTone(t.id as any)}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  selectedTone === t.id
                    ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                    : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                }`}
              >
                {language === 'ur' ? t.labelUr : t.labelEn}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateVoiceover}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{language === 'ur' ? 'سکرپٹ تیار ہو رہا ہے...' : 'Generating Script...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {language === 'ur' ? 'نیا صوتی سکرپٹ تیار کریں' : 'Generate Voice-over Script'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Built-in Text-To-Speech Audio Player Card */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-emerald-950/70 to-emerald-900/40 border-emerald-800/50'
            : 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-700 text-white shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {language === 'ur' ? 'صوتی پریویو پلیئر' : 'Text-To-Speech Audio Preview'}
              </h3>
              <p className="text-[10px] text-emerald-200">
                {isPlaying
                  ? 'Speaking narration...'
                  : isPaused
                  ? 'Paused'
                  : 'Ready to synthesize speech'}
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-1.5">
            {!isPlaying ? (
              <button
                onClick={handlePlayTTS}
                className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 active:scale-90 transition-transform shadow-md"
                title="Play Audio"
              >
                <Play className="w-4 h-4 fill-emerald-950" />
              </button>
            ) : (
              <button
                onClick={handlePauseTTS}
                className="p-2 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 active:scale-90 transition-transform shadow-md"
                title="Pause Audio"
              >
                <Pause className="w-4 h-4 fill-emerald-950" />
              </button>
            )}

            <button
              onClick={handleStopTTS}
              disabled={!isPlaying && !isPaused}
              className="p-2 rounded-full bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 disabled:opacity-40 active:scale-90 transition-transform"
              title="Stop Audio"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed / Pitch Adjusters */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-emerald-800/40 text-[11px]">
          <div className="space-y-1">
            <div className="flex justify-between text-emerald-300">
              <span>Speed:</span>
              <span className="font-mono text-amber-400">{speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-emerald-950 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-emerald-300">
              <span>Pitch:</span>
              <span className="font-mono text-amber-400">{speechPitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-emerald-950 rounded-lg"
            />
          </div>
        </div>

        {/* Available Voice Selector */}
        {availableVoices.length > 0 && (
          <div className="pt-1">
            <select
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 rounded-lg text-[11px] bg-emerald-950/80 border border-emerald-700 text-emerald-100"
            >
              {availableVoices.map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Script Language Switcher & Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveLangTab('ur')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLangTab === 'ur'
                  ? 'bg-amber-500 text-emerald-950 font-bold'
                  : 'text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              اردو سکرپٹ
            </button>
            <button
              onClick={() => setActiveLangTab('roman')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLangTab === 'roman'
                  ? 'bg-amber-500 text-emerald-950 font-bold'
                  : 'text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              Roman Urdu
            </button>
            <button
              onClick={() => setActiveLangTab('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeLangTab === 'en'
                  ? 'bg-amber-500 text-emerald-950 font-bold'
                  : 'text-emerald-300 hover:bg-emerald-900/40'
              }`}
            >
              English
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyScript('script-copy')}
              className="flex items-center gap-1 text-xs text-amber-400 hover:underline"
            >
              {copiedKey === 'script-copy' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'کاپی شدہ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'کاپی' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSRT}
              className="flex items-center gap-1 text-xs text-emerald-300 hover:text-white"
              title="Download as Subtitles (SRT)"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>SRT</span>
            </button>
          </div>
        </div>

        {/* Script Editor / Display */}
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            theme === 'dark'
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-100'
              : 'bg-white border-emerald-100 text-gray-900 shadow-sm'
          }`}
        >
          <textarea
            rows={8}
            value={getActiveScriptText()}
            onChange={(e) => {
              if (activeLangTab === 'ur') setUrduScript(e.target.value);
              else if (activeLangTab === 'roman') setRomanScript(e.target.value);
              else setEnglishScript(e.target.value);
            }}
            className={`w-full bg-transparent resize-none focus:outline-none text-xs sm:text-sm leading-relaxed ${
              activeLangTab === 'ur' ? 'font-urdu text-right text-base leading-loose' : ''
            }`}
          />
        </div>
      </div>

      {/* Arabic Pronunciation & Phonetics Guide */}
      {pronunciationGuide.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border space-y-2 ${
            theme === 'dark'
              ? 'bg-emerald-950/20 border-emerald-800/30'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <BookOpen className="w-4 h-4" />
            <span>
              {language === 'ur'
                ? 'عربی اصطلاحات کی درست ادائی و تلفظ'
                : 'Pronunciation Guide for Arabic Terms'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {pronunciationGuide.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{item.term}</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/50 px-1.5 py-0.5 rounded">
                    {item.pronunciation}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
