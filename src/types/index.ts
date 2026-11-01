export type AppLanguage = 'ur' | 'roman' | 'en';

export type StoryLength = 'short' | 'detailed' | 'educational' | 'emotional' | 'youtube';

export type VideoDuration = '30s' | '60s' | '2m' | '5m' | 'custom';

export type StoryStyle = 
  | 'cinematic-history'
  | 'educational-doc'
  | 'emotional-story'
  | '3d-animation'
  | 'realistic-reconstruction'
  | 'kids-moral';

export type TargetVideoAI = 'veo' | 'flow' | 'kling' | 'seedance' | 'runway' | 'general';

export interface ScenePrompt {
  sceneNumber: number;
  title: string;
  visualDescription: string;
  environmentSetting: string;
  characterDescription: string;
  characterConsistency: string;
  characterAction: string;
  cameraMovement: string;
  lightingAtmosphere: string;
  soundEffects: string;
  dialogue?: string;
  voiceoverNarration: string;
  transition: string;
  aspectRatio: string;
  visualQuality: string;
  animationStyle: string;
  // Full ready-to-copy combined prompt for external AI video tools
  fullPromptText: string;
}

export interface IslamicReference {
  type: 'quran' | 'hadith' | 'history' | 'moral';
  source: string; // e.g. "Surah Al-Anbiya (21:69)" or "Sahih Al-Bukhari 2442"
  arabicText?: string;
  translation: string;
  authenticityNote: string;
}

export interface GeneratedStory {
  id: string;
  title: string;
  titleUrdu: string;
  titleRoman: string;
  category: string;
  topic: string;
  language: AppLanguage;
  style: StoryStyle;
  length: StoryLength;
  duration: VideoDuration;
  storyContent: string;
  urduNarration: string;
  romanUrduNarration: string;
  englishNarration: string;
  moralLessons: string[];
  references: IslamicReference[];
  scenes: ScenePrompt[];
  targetVideoAi: TargetVideoAI;
  aspectRatio: '9:16' | '16:9';
  createdAt: number;
  updatedAt: number;
}

export interface CuratedTopic {
  id: string;
  titleEn: string;
  titleUr: string;
  titleRoman: string;
  category: 'prophets' | 'quran' | 'companions' | 'history' | 'moral';
  categoryLabelEn: string;
  categoryLabelUr: string;
  badge: string;
  summaryEn: string;
  summaryUr: string;
  keyVerseOrHadith: string;
  recommendedScenes: number;
  recommendedStyle: StoryStyle;
  iconName: string;
}
