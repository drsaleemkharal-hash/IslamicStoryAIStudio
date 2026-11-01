import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, GeneratedStory } from '../types';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';
import { CURATED_TOPICS } from '../data/islamicStories';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isRTL: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeTab: 'home' | 'generator' | 'prompts' | 'voiceover' | 'saved' | 'settings';
  setActiveTab: (tab: 'home' | 'generator' | 'prompts' | 'voiceover' | 'saved' | 'settings') => void;
  currentStory: GeneratedStory | null;
  setCurrentStory: (story: GeneratedStory | null) => void;
  savedProjects: GeneratedStory[];
  saveProject: (story: GeneratedStory) => void;
  deleteProject: (id: string) => void;
  updateProject: (story: GeneratedStory) => void;
  aiStatus: { isConfigured: boolean; model: string; mode: string };
  checkAiStatus: () => Promise<void>;
  loadCuratedTopic: (topicId: string) => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (val: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  customTopicInput: string;
  setCustomTopicInput: (val: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PROJECTS = 'islamic_story_studio_projects_v1';
const STORAGE_KEY_LANG = 'islamic_story_studio_lang_v1';
const STORAGE_KEY_THEME = 'islamic_story_studio_theme_v1';
const STORAGE_KEY_FRAME = 'islamic_story_studio_frame_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return (saved as AppLanguage) || 'ur';
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [isAndroidFrame, setIsAndroidFrameState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FRAME);
    if (saved !== null) return saved === 'true';
    // Default to true on desktop viewports, false on small mobile devices
    return typeof window !== 'undefined' ? window.innerWidth > 768 : true;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'generator' | 'prompts' | 'voiceover' | 'saved' | 'settings'>('home');
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(SAMPLE_PROJECTS[0]);
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [savedProjects, setSavedProjects] = useState<GeneratedStory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved projects from localStorage:', e);
    }
    return SAMPLE_PROJECTS;
  });

  const [aiStatus, setAiStatus] = useState<{ isConfigured: boolean; model: string; mode: string }>({
    isConfigured: false,
    model: 'gemini-3.8-flash',
    mode: 'checking',
  });

  const checkAiStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          isConfigured: Boolean(data.aiConfigured),
          model: data.model || 'gemini-3.8-flash',
          mode: data.mode || (data.aiConfigured ? 'live-gemini' : 'demo-knowledge-base'),
        });
      }
    } catch (err) {
      // Offline fallback status
      setAiStatus({
        isConfigured: false,
        model: 'gemini-3.8-flash',
        mode: 'demo-knowledge-base',
      });
    }
  };

  useEffect(() => {
    checkAiStatus();
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang === 'roman' ? 'ur-Latn' : 'en';
    }
  };

  useEffect(() => {
    if (language === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language === 'roman' ? 'ur-Latn' : 'en';
    }
  }, [language]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
  };

  const setIsAndroidFrame = (val: boolean) => {
    setIsAndroidFrameState(val);
    localStorage.setItem(STORAGE_KEY_FRAME, String(val));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const saveProject = (story: GeneratedStory) => {
    setSavedProjects((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === story.id);
      let updated: GeneratedStory[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...story, updatedAt: Date.now() };
      } else {
        updated = [{ ...story, updatedAt: Date.now() }, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving projects to localStorage:', err);
      }
      return updated;
    });
    showToast(language === 'ur' ? 'پروجیکٹ محفوظ ہو گیا!' : 'Project saved successfully!');
  };

  const deleteProject = (id: string) => {
    setSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
      } catch (err) {
        console.error('Error updating localStorage:', err);
      }
      return filtered;
    });
    showToast(language === 'ur' ? 'پروجیکٹ حذف کر دیا گیا' : 'Project removed');
  };

  const updateProject = (story: GeneratedStory) => {
    saveProject(story);
  };

  const loadCuratedTopic = (topicId: string) => {
    const found = CURATED_TOPICS.find((t) => t.id === topicId);
    if (found) {
      setCustomTopicInput(language === 'ur' ? found.titleUr : language === 'roman' ? found.titleRoman : found.titleEn);
      setActiveTab('generator');
    }
  };

  const isRTL = language === 'ur';

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isRTL,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        currentStory,
        setCurrentStory,
        savedProjects,
        saveProject,
        deleteProject,
        updateProject,
        aiStatus,
        checkAiStatus,
        loadCuratedTopic,
        isAndroidFrame,
        setIsAndroidFrame,
        toastMessage,
        showToast,
        customTopicInput,
        setCustomTopicInput,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
