import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScenePrompt, TargetVideoAI } from '../types';
import { compileSingleScenePrompt } from '../utils/islamicPromptEngine';
import {
  Clapperboard,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
} from 'lucide-react';

export const VideoPromptsScreen: React.FC = () => {
  const {
    language,
    theme,
    currentStory,
    setCurrentStory,
    showToast,
  } = useApp();

  const [sceneCount, setSceneCount] = useState<number>(10);
  const [customSceneCount, setCustomSceneCount] = useState<string>('12');
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
  const [targetAi, setTargetAi] = useState<TargetVideoAI>('veo');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [duration, setDuration] = useState<string>('60s');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [regeneratingSceneIdx, setRegeneratingSceneIdx] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({ 1: true });

  const aiPlatforms: { id: TargetVideoAI; name: string; tag: string }[] = [
    { id: 'veo', name: 'Google Veo 2 / Flow', tag: 'Cinematic 4K' },
    { id: 'kling', name: 'Kling AI 1.5 Pro', tag: 'Realistic Dynamics' },
    { id: 'seedance', name: 'Seedance AI', tag: 'Fast Motion' },
    { id: 'runway', name: 'Runway Gen-3', tag: 'Director Camera' },
    { id: 'general', name: 'Universal AI Prompt', tag: 'All Generators' },
  ];

  const presetCounts = [5, 10, 15, 20, 25, 30];

  const handleGeneratePrompts = async () => {
    const finalCount = isCustomCount
      ? Math.min(Math.max(parseInt(customSceneCount, 10) || 5, 3), 30)
      : sceneCount;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentStory?.topic || 'Hazrat Ibrahim (AS) and the fire miracle',
          storyContent: currentStory?.storyContent || '',
          sceneCount: finalCount,
          style: currentStory?.style || 'cinematic-history',
          targetAi,
          aspectRatio,
          duration,
        }),
      });

      const data = await response.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        if (currentStory) {
          const updated = {
            ...currentStory,
            scenes: data.scenes,
            targetVideoAi: targetAi,
            aspectRatio,
            updatedAt: Date.now(),
          };
          setCurrentStory(updated);
        }
        showToast(
          language === 'ur'
            ? `${data.scenes.length} سین پرامپٹس تیار ہو گئے!`
            : `Generated ${data.scenes.length} scene prompts!`
        );
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'ur' ? 'خرابی، دوبارہ کوشش کریں' : 'Error generating prompts');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScene = (promptText: string, sceneNum: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedKey(`scene-${sceneNum}`);
    showToast(language === 'ur' ? `سین ${sceneNum} پرامپٹ کاپی ہو گیا!` : `Scene ${sceneNum} prompt copied!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllScenes = () => {
    if (!currentStory?.scenes?.length) return;
    const allText = currentStory.scenes
      .map((s) => compileSingleScenePrompt(s, targetAi, currentStory.style))
      .join('\n\n' + '='.repeat(40) + '\n\n');

    navigator.clipboard.writeText(allText);
    setCopiedKey('all-scenes');
    showToast(
      language === 'ur'
        ? 'تمام سین پرامپٹس کاپی ہو گئے!'
        : 'All scene prompts copied to clipboard!'
    );
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadTxt = () => {
    if (!currentStory?.scenes?.length) return;
    const header = `=== ISLAMIC STORY AI STUDIO - AI VIDEO PROMPTS ===\nProject: ${
      currentStory.title
    }\nTopic: ${currentStory.topic}\nTarget AI: ${targetAi.toUpperCase()}\nAspect Ratio: ${aspectRatio}\nDuration: ${duration}\nGenerated at: ${new Date().toLocaleString()}\n\n`;

    const body = currentStory.scenes
      .map((s) => compileSingleScenePrompt(s, targetAi, currentStory.style))
      .join('\n\n' + '-'.repeat(40) + '\n\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Islamic_Prompts_${currentStory.title.replace(/\s+/g, '_')}_${targetAi}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(language === 'ur' ? 'فائل ڈاؤنلوڈ ہو گئی!' : 'Prompts TXT downloaded!');
  };

  const handleRegenerateSingleScene = async (sceneNumber: number) => {
    setRegeneratingSceneIdx(sceneNumber);
    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${currentStory?.topic} (Focus specifically on Scene ${sceneNumber})`,
          storyContent: currentStory?.storyContent || '',
          sceneCount: 1,
          style: currentStory?.style || 'cinematic-history',
          targetAi,
          aspectRatio,
          duration,
        }),
      });

      const res = await response.json();
      if (res.scenes && res.scenes.length > 0 && currentStory) {
        const newScene = { ...res.scenes[0], sceneNumber };
        const updatedScenes = currentStory.scenes.map((s) =>
          s.sceneNumber === sceneNumber ? newScene : s
        );
        setCurrentStory({ ...currentStory, scenes: updatedScenes });
        showToast(
          language === 'ur'
            ? `سین ${sceneNumber} دوبارہ تیار ہو گیا!`
            : `Scene ${sceneNumber} regenerated!`
        );
      }
    } catch (e) {
      console.error(e);
      showToast(language === 'ur' ? 'خرابی، دوبارہ کوشش کریں' : 'Failed to regenerate scene');
    } finally {
      setRegeneratingSceneIdx(null);
    }
  };

  const toggleSceneExpand = (num: number) => {
    setExpandedScenes((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const scenes = currentStory?.scenes || [];

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
          <Clapperboard className="w-4 h-4 text-amber-400" />
          <span>
            {language === 'ur'
              ? 'سین بہ سین AI ویڈیو پرامپٹ جنریٹر'
              : language === 'roman'
              ? 'Scene-by-Scene AI Video Prompt Generator'
              : 'Scene-by-Scene AI Video Prompt Generator'}
          </span>
        </h2>
        <p className="text-xs text-emerald-200/80 font-urdu leading-tight">
          گوگل ویو، کلنگ، سیڈانس اور رن وے کے لیے 9:16 اور 16:9 سنیماٹک پرامپٹس
        </p>
      </div>

      {/* Direct Video Generation Disclosure Warning */}
      <div
        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <Video className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-300">
            {language === 'ur' ? 'ویڈیو ٹولز کے لیے کاپی ریڈی پرامپٹس' : 'Ready-to-Paste AI Video Prompts'}
          </span>
          <p className="text-[11px] leading-relaxed opacity-90">
            یہ اسٹوڈیو Google Veo 2، Kling AI، اور Seedance کے لیے تفصیلی بصری ہدایات، کیمرہ موومنٹ، اور مستقل مزاجی کے اصول ہر سین میں شامل کرتا ہے تاکہ آپ انہیں براہ راست کاپی کر کے ویڈیو بنا سکیں۔
          </p>
        </div>
      </div>

      {/* Prompt Setup Panel */}
      <div
        className={`p-4 rounded-2xl border space-y-3.5 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        {/* Active Project Topic Reference */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-800/40">
          <span className="text-emerald-300/80">
            {language === 'ur' ? 'موجودہ کہانی:' : 'Active Story:'}
          </span>
          <span className="font-bold text-amber-300 truncate max-w-[200px]">
            {currentStory?.title || 'Hazrat Ibrahim (AS) & the Fire'}
          </span>
        </div>

        {/* Scene Count Options */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-200 flex items-center justify-between">
            <span>{language === 'ur' ? 'مناظر کی تعداد (Number of Scenes):' : 'Number of Scenes:'}</span>
            <span className="text-[10px] text-amber-400">
              {isCustomCount ? `${customSceneCount} Custom` : `${sceneCount} Scenes`}
            </span>
          </label>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {presetCounts.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSceneCount(num);
                  setIsCustomCount(false);
                }}
                className={`py-1.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  !isCustomCount && sceneCount === num
                    ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                    : theme === 'dark'
                    ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-200'
                    : 'bg-white border-emerald-200 text-emerald-900'
                }`}
              >
                {num} {language === 'ur' ? 'سین' : ''}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomCount(true)}
              className={`py-1.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                isCustomCount
                  ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                  : theme === 'dark'
                  ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-200'
                  : 'bg-white border-emerald-200 text-emerald-900'
              }`}
            >
              {language === 'ur' ? 'کسٹم' : 'Custom'}
            </button>
          </div>

          {isCustomCount && (
            <div className="pt-1 flex items-center gap-2">
              <input
                type="number"
                min={3}
                max={30}
                value={customSceneCount}
                onChange={(e) => setCustomSceneCount(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg text-xs bg-emerald-950 border border-emerald-700 text-white"
                placeholder="3 - 30"
              />
              <span className="text-[11px] text-emerald-300">
                {language === 'ur' ? 'مناظر کی تعداد درج کریں (3 سے 30)' : 'Enter scene count (3 to 30)'}
              </span>
            </div>
          )}
        </div>

        {/* Target Video AI Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-emerald-200">
            {language === 'ur' ? 'ویڈیو ماڈل کی مطابقت (Target AI Model):' : 'Target AI Video Model:'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {aiPlatforms.map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => setTargetAi(plat.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  targetAi === plat.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                    : theme === 'dark'
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200 hover:bg-emerald-900/30'
                    : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{plat.name}</div>
                <div className="text-[10px] opacity-70">{plat.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Video Duration Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Aspect Ratio */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-200">
              {language === 'ur' ? 'اسپیکٹ ریشو:' : 'Aspect Ratio:'}
            </label>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-amber-500 text-emerald-950 font-bold'
                    : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                }`}
              >
                9:16 Vertical (Shorts)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-amber-500 text-emerald-950 font-bold'
                    : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200'
                }`}
              >
                16:9 Cinema
              </button>
            </div>
          </div>

          {/* Duration Sync */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-200">
              {language === 'ur' ? 'کل دورانیہ:' : 'Target Duration:'}
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-emerald-950 border border-emerald-800 text-white"
            >
              <option value="30s">30 Seconds (Fast Short)</option>
              <option value="60s">60 Seconds (Standard Short)</option>
              <option value="2m">2 Minutes (Educational)</option>
              <option value="5m">5 Minutes (Deep Documentary)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePrompts}
          disabled={isGenerating}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-950" />
              <span>
                {language === 'ur' ? 'پرامپٹس تیار ہو رہے ہیں...' : 'Crafting 15-Point AI Prompts...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>
                {language === 'ur'
                  ? `تمام ${isCustomCount ? customSceneCount : sceneCount} مناظر کے پرامپٹس بنائیں`
                  : `Generate All ${isCustomCount ? customSceneCount : sceneCount} Scene Prompts`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Global Action Toolbar */}
      {scenes.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs">
          <div className="text-emerald-200 font-semibold flex items-center gap-1.5">
            <span>
              {scenes.length} {language === 'ur' ? 'مناظر تیار ہیں' : 'Scenes Ready'}
            </span>
            <span className="text-[10px] text-amber-400 font-normal">
              • Aspect {aspectRatio} • {targetAi.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyAllScenes}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-[11px] shadow-sm active:scale-95 transition-all"
            >
              {copiedKey === 'all-scenes' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'تمام کاپی ہو گئے' : 'All Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'ur' ? 'تمام پرامپٹس کاپی کریں' : 'Copy All Scenes'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[11px] active:scale-95 transition-all"
              title="Download as TXT file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">TXT</span>
            </button>
          </div>
        </div>
      )}

      {/* Scene-by-Scene Prompt Cards */}
      <div className="space-y-3">
        {scenes.map((scene) => {
          const isExpanded = Boolean(expandedScenes[scene.sceneNumber]);
          const fullCompiledPrompt = compileSingleScenePrompt(
            scene,
            targetAi,
            currentStory?.style || 'cinematic-history'
          );

          return (
            <div
              key={scene.sceneNumber}
              className={`rounded-2xl border transition-all overflow-hidden ${
                theme === 'dark'
                  ? 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-700/60'
                  : 'bg-white border-emerald-100 shadow-sm'
              }`}
            >
              {/* Scene Header Strip */}
              <div
                className={`p-3 sm:p-3.5 flex items-center justify-between gap-2 cursor-pointer select-none border-b ${
                  theme === 'dark'
                    ? 'bg-emerald-950/50 border-emerald-900/50'
                    : 'bg-emerald-50/50 border-emerald-100'
                }`}
                onClick={() => toggleSceneExpand(scene.sceneNumber)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                    #{scene.sceneNumber}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {scene.title}
                    </h3>
                    <p className="text-[10px] text-emerald-300/80 truncate">
                      {scene.cameraMovement} • {scene.lightingAtmosphere}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Single Scene Copy Button */}
                  <button
                    onClick={() => handleCopyScene(fullCompiledPrompt, scene.sceneNumber)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs shadow-xs active:scale-95 transition-all"
                    title="Copy full ready prompt for this scene"
                  >
                    {copiedKey === `scene-${scene.sceneNumber}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Scene</span>
                      </>
                    )}
                  </button>

                  {/* Regenerate Single Scene Button */}
                  <button
                    onClick={() => handleRegenerateSingleScene(scene.sceneNumber)}
                    disabled={regeneratingSceneIdx === scene.sceneNumber}
                    className="p-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 active:scale-90 transition-transform"
                    title="Regenerate this specific scene"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-amber-400 ${
                        regeneratingSceneIdx === scene.sceneNumber ? 'animate-spin' : ''
                      }`}
                    />
                  </button>

                  {/* Expand / Collapse toggle */}
                  <button
                    onClick={() => toggleSceneExpand(scene.sceneNumber)}
                    className="p-1 rounded-lg hover:bg-emerald-800/40 text-emerald-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Scene Detailed 15-Point Breakdown */}
              {isExpanded && (
                <div className="p-3.5 sm:p-4 space-y-3 text-xs leading-relaxed">
                  {/* Visual Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      1. Core Visual Description & Action:
                    </span>
                    <p className="text-emerald-100 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                      {scene.visualDescription}
                    </p>
                  </div>

                  {/* Environment & Character Consistency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-0.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                      <span className="font-semibold text-emerald-300">
                        2. Environment & Historical Setting:
                      </span>
                      <p className="text-emerald-100/90">{scene.environmentSetting}</p>
                    </div>

                    <div className="space-y-0.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                      <span className="font-semibold text-emerald-300">
                        3. Character Consistency & Wardrobe:
                      </span>
                      <p className="text-emerald-100/90">{scene.characterConsistency}</p>
                    </div>
                  </div>

                  {/* Camera, Lighting & Audio Cues */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                      <span className="font-semibold text-amber-300">Camera:</span>
                      <p className="text-emerald-100/90">{scene.cameraMovement}</p>
                    </div>
                    <div className="bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                      <span className="font-semibold text-amber-300">Lighting:</span>
                      <p className="text-emerald-100/90">{scene.lightingAtmosphere}</p>
                    </div>
                    <div className="bg-emerald-950/20 p-2 rounded-lg border border-emerald-800/30">
                      <span className="font-semibold text-amber-300">Sound / SFX:</span>
                      <p className="text-emerald-100/90">{scene.soundEffects}</p>
                    </div>
                  </div>

                  {/* Voice-over & Dialogue */}
                  <div className="space-y-1 bg-amber-950/15 p-2.5 rounded-xl border border-amber-600/20">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Voice-over & Dialogue:
                    </span>
                    <p className="text-emerald-100 italic">"{scene.voiceoverNarration}"</p>
                    {scene.dialogue && (
                      <p className="text-amber-200 text-xs font-urdu text-right pt-0.5">
                        مکالمہ: {scene.dialogue}
                      </p>
                    )}
                  </div>

                  {/* Transition and Technical Quality */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] text-emerald-300/80 pt-1 border-t border-emerald-800/30">
                    <span>
                      <strong>Transition:</strong> {scene.transition}
                    </span>
                    <span className="text-amber-400">
                      Aspect {scene.aspectRatio} • {scene.visualQuality}
                    </span>
                  </div>

                  {/* Consolidated Full Master Prompt Preview */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 pb-1 font-mono">
                      <span>READY-TO-PASTE PROMPT FOR {targetAi.toUpperCase()}:</span>
                      <button
                        onClick={() => handleCopyScene(fullCompiledPrompt, scene.sceneNumber)}
                        className="text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Prompt</span>
                      </button>
                    </div>
                    <pre className="text-[10px] bg-black/60 p-2.5 rounded-xl text-emerald-200/90 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed border border-emerald-800/50">
                      {fullCompiledPrompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
