import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Key,
  Smartphone,
  ShieldCheck,
  Trash2,
  HelpCircle,
  FileCode,
  ExternalLink,
  CheckCircle2,
  Copy,
  Info,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    aiStatus,
    checkAiStatus,
    showToast,
  } = useApp();

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    showToast('Commands copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        language === 'ur'
          ? 'کیا آپ واقعی تمام محفوظ شدہ پروجیکٹس اور ڈیٹا حذف کرنا چاہتے ہیں؟'
          : 'Are you sure you want to clear all saved projects and local cache?'
      )
    ) {
      localStorage.clear();
      showToast(language === 'ur' ? 'ڈیٹا صاف ہو گیا' : 'Local data cleared');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const bubblewrapCommands = `# Method 1: Google Bubblewrap (Recommended official Trusted Web Activity)
# Step 1: Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# Step 2: Initialize your Android project from your App URL
bubblewrap init --manifest="https://your-domain.com/manifest.webmanifest"

# Step 3: Build the signed Android APK / AAB for Google Play Store
bubblewrap build

# Result: Output .apk and .aab ready to install on Android phone or upload to Google Play Console!`;

  const capacitorCommands = `# Method 2: Capacitor (Native Android APK with Java/Kotlin)
# Step 1: Install Capacitor CLI
npm install @capacitor/core @capacitor/cli @capacitor/android

# Step 2: Initialize Capacitor
npx cap init "Islamic Story AI Studio" "com.islamicstory.aistudio"

# Step 3: Add Android platform & build
npm run build
npx cap add android
npx cap open android

# Step 4: In Android Studio, click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"`;

  return (
    <div className="flex-1 px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-amber-400" />
          <span>
            {language === 'ur'
              ? 'ترتیبات و رہنمائی (Settings & Guide)'
              : 'Settings & Documentation'}
          </span>
        </h2>
        <p className="text-xs text-emerald-200/80 font-urdu leading-tight">
          زبان، تھیم، AI سیٹ اپ، اور اینڈرائیڈ APK بلڈ کرنے کی مکمل ہدایات
        </p>
      </div>

      {/* Language Preference Card */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Globe className="w-4 h-4" />
          <span>{language === 'ur' ? 'زبان منتخب کریں (App Language)' : 'Application Language'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLanguage('ur')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
              language === 'ur'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            }`}
          >
            <span className="font-urdu text-sm block">اردو (Urdu)</span>
            <span className="text-[10px] opacity-75">RTL Font</span>
          </button>

          <button
            onClick={() => setLanguage('roman')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
              language === 'roman'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            }`}
          >
            <span className="block">Roman Urdu</span>
            <span className="text-[10px] opacity-75">Latin script</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
              language === 'en'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow-sm'
                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            }`}
          >
            <span className="block">English</span>
            <span className="text-[10px] opacity-75">International</span>
          </button>
        </div>
      </div>

      {/* Theme Card */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border space-y-2.5 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{language === 'ur' ? 'ڈیزائن تھیم (Theme)' : 'Theme Mode'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-xl bg-amber-500 text-emerald-950 font-bold text-xs"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
        <p className="text-[11px] text-emerald-200/80">
          {theme === 'dark'
            ? 'Emerald Midnight: Optimized for OLED screens and nighttime video prompt generation.'
            : 'Oasis Light: Crisp high-contrast view for daylight reading and script drafting.'}
        </p>
      </div>

      {/* AI Provider & Backend Status Card */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Key className="w-4 h-4" />
            <span>AI Provider & Backend Architecture</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              aiStatus.isConfigured
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {aiStatus.isConfigured ? 'Gemini 3.8 Flash (Live)' : 'Studio Engine Mode'}
          </span>
        </div>

        <div className="space-y-2 text-xs text-emerald-100/90 leading-relaxed">
          <p>
            <strong>Secure Architecture:</strong> All AI requests are handled exclusively on our secure Node.js/Express backend server (<code className="text-amber-400 font-mono">server.ts</code>). API keys are NEVER sent to or stored in the client-side browser code.
          </p>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 space-y-1.5 text-[11px]">
            <p className="font-semibold text-amber-300">
              How to attach your Gemini API Key in Google AI Studio:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-emerald-200/90">
              <li>Open the <strong>Settings &gt; Secrets</strong> panel in the AI Studio interface.</li>
              <li>Add or verify the secret named <code className="text-amber-400 font-mono">GEMINI_API_KEY</code>.</li>
              <li>The server will automatically detect the key at runtime via <code className="text-amber-400 font-mono">process.env.GEMINI_API_KEY</code>.</li>
              <li>Free starter usage is available with no configuration required thanks to the built-in Islamic Knowledge Engine!</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-300/80">Active Model: {aiStatus.model}</span>
            <button
              onClick={() => checkAiStatus()}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Re-check Connection
            </button>
          </div>
        </div>
      </div>

      {/* Android APK Build Guide (Technical Deliverable #6) */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-white border-emerald-100 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Smartphone className="w-4 h-4" />
          <span>Android APK Packaging Guide (Google Play Ready)</span>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed">
          This application is built as a production-ready Progressive Web App (PWA) with responsive Material 3 Android layout. To compile it into a standalone <strong>.apk</strong> or <strong>.aab</strong> file for Android devices:
        </p>

        {/* Bubblewrap CLI instructions */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-300">Method 1: Google Bubblewrap (Official TWA)</span>
            <button
              onClick={() => handleCopyCode(bubblewrapCommands, 'bubblewrap')}
              className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
            >
              {copiedSection === 'bubblewrap' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>Copy Commands</span>
            </button>
          </div>
          <pre className="text-[10px] bg-black/70 p-2.5 rounded-xl text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap border border-emerald-800/40">
            {bubblewrapCommands}
          </pre>
        </div>

        {/* Capacitor instructions */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-emerald-300">Method 2: Capacitor (Native Java/Kotlin)</span>
            <button
              onClick={() => handleCopyCode(capacitorCommands, 'capacitor')}
              className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
            >
              {copiedSection === 'capacitor' ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>Copy Commands</span>
            </button>
          </div>
          <pre className="text-[10px] bg-black/70 p-2.5 rounded-xl text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap border border-emerald-800/40">
            {capacitorCommands}
          </pre>
        </div>
      </div>

      {/* Islamic Content Integrity Charter */}
      <div
        className={`p-4 rounded-2xl border space-y-2.5 ${
          theme === 'dark'
            ? 'bg-amber-950/20 border-amber-600/30 text-amber-200'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>شرعی تقدس اور صداقت کا منشور (Islamic Integrity Charter)</span>
        </div>

        <ul className="text-xs space-y-1.5 list-disc list-inside leading-relaxed opacity-90">
          <li><strong>حرمت تصویر کشی:</strong> اللہ رب العزت کی ذاتِ پاک اور تمام انبیاء کرام (علیہم السلام) کے چہرہ مبارک اور جسمانی شبیہ کی تصویر کشی مطلقا حرام ہے۔ پرامپٹس میں صرف باوقار علامتی روشنی، اولیاء کے تناظر اور فطرت کے مناظر استعمال کیے جاتے ہیں۔</li>
          <li><strong>مستند حوالہ جات:</strong> ہر واقعے کے ساتھ متعلقہ قرآنی سورت، آیت نمبر، اور صحیح بخاری و صحیح مسلم کے مصدقہ حوالے پیش کیے جاتے ہیں۔</li>
          <li><strong>عوامی رہنمائی:</strong> تاریخی روایات، قرآنی قطعیات اور تمثیلی بیانیے کے درمیان واضح فرق برقرار رکھا جاتا ہے۔</li>
        </ul>
      </div>

      {/* Clear Cache / Data */}
      <div className="pt-2">
        <button
          onClick={handleClearAllData}
          className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'ur' ? 'محفوظ کردہ تمام ڈیٹا صاف کریں' : 'Clear All Local App Data'}</span>
        </button>
      </div>

      {/* Footer credits */}
      <div className="text-center text-[10px] text-emerald-400/60 space-y-0.5 pt-2 pb-4">
        <p>Islamic Story AI Studio • اسلامی کہانی AI اسٹوڈیو</p>
        <p>Built with React, TypeScript, Tailwind CSS, Express, and Google Gemini 3.8 Flash</p>
      </div>
    </div>
  );
};
