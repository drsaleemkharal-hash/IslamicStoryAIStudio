import { ScenePrompt, StoryStyle, TargetVideoAI } from '../types';

export interface PromptEngineOptions {
  topic: string;
  category: string;
  style: StoryStyle;
  targetAi: TargetVideoAI;
  aspectRatio: '9:16' | '16:9';
  sceneCount: number;
  duration: string;
}

export function getStylePromptModifier(style: StoryStyle): string {
  switch (style) {
    case 'cinematic-history':
      return 'Cinematic historical realism, Ridley Scott Kingdom of Heaven visual aesthetic, 35mm anamorphic lens, realistic dusty fabrics, ancient atmospheric depth, natural dust motes in sunbeams, rich dynamic color grade';
    case 'educational-doc':
      return 'BBC / National Geographic documentary visual fidelity, ultra-detailed architectural accuracy, sweeping drone angles, atmospheric macro details, museum-grade historical reconstruction, crisp naturalistic lighting';
    case 'emotional-story':
      return 'Deep emotional cinematic drama, intimate depth of field, warm candlelight and golden hour, expressive environmental symbolism, slow poignant camera moves, tearful emotional resonance';
    case '3d-animation':
      return 'Stylized Pixar and DreamWorks grade 3D animation, lush vibrant textures, soft gentle volumetric lighting, expressive stylized characters, child-safe respectful Islamic animated film aesthetic, rich colorful world-building';
    case 'realistic-reconstruction':
      return 'Archeological ultra-realistic reconstruction, ancient Near Eastern mudbrick architecture, authentic 7th-century / ancient Mesopotamian textiles, natural stone textures, high tactile fidelity, documentary lighting';
    case 'kids-moral':
      return 'Warm, inviting Disney-inspired storybook 3D aesthetic, cheerful desert oasis colors, soft rounded environmental forms, gentle golden sunlight, friendly educational atmosphere for young learners';
    default:
      return 'Cinematic 4K HDR, hyper-realistic ancient Islamic history atmosphere, rich cinematic color palette';
  }
}

export function getPlatformSpecificSyntax(targetAi: TargetVideoAI, basePrompt: string, aspectRatio: string): string {
  switch (targetAi) {
    case 'veo':
      return `[Google Veo 2 / Flow Prompt]\n${basePrompt} --aspect ${aspectRatio} --motion cinematic --quality 4k --fps 24 --camera-smoothness high`;
    case 'kling':
      return `[Kling AI Pro Prompt]\n${basePrompt} --ar ${aspectRatio} --cfg 0.6 --mode professional --motion 5`;
    case 'seedance':
      return `[Seedance / Bytedance AI Prompt]\n${basePrompt} --ratio ${aspectRatio} --realism high --cinematic-grade`;
    case 'runway':
      return `[Runway Gen-3 Alpha Prompt]\n${basePrompt} --ar ${aspectRatio} --camera cinematic-pan --motion 4`;
    default:
      return `${basePrompt} [Aspect Ratio: ${aspectRatio}, 4K HDR, 24fps cinematic]`;
  }
}

export const ISLAMIC_RESPECT_GUIDELINE = `
[STRICT ISLAMIC REVERENCE DIRECTIVES]
1. Absolute prohibition of visual depiction of Allah SWT.
2. Absolute prohibition of portraying the physical facial features, body form, or likeness of any Prophet of Allah (AS/SAW).
3. Use respectful symbolic framing: Majestic heavenly light, atmospheric POV perspectives, glowing footprints on sacred sand, staff resting on stone, golden divine dawn breaking over mountains, gentle dust in light rays.
4. Negative Prompts included in every render: No face of Prophets, no blasphemy, no disfigured anatomy, no modern clothing/gadgets, no distorted limbs.
`.trim();

export function compileSingleScenePrompt(scene: Omit<ScenePrompt, 'fullPromptText'>, targetAi: TargetVideoAI, style: StoryStyle): string {
  const styleKeywords = getStylePromptModifier(style);
  
  const rawBlock = `
=== SCENE ${scene.sceneNumber}: ${scene.title.toUpperCase()} ===
[ASPECT RATIO]: ${scene.aspectRatio} | [RESOLUTION]: ${scene.visualQuality} | [STYLE]: ${scene.animationStyle}
[CORE VISUAL DESCRIPTION]:
${scene.visualDescription}

[HISTORICAL ENVIRONMENT & SETTING]:
${scene.environmentSetting}

[CHARACTER CONSISTENCY & WARDROBE RULES]:
${scene.characterConsistency}
Characters present: ${scene.characterDescription}
Character Action & Expressions: ${scene.characterAction}

[CAMERA DIRECTING & CINEMATOGRAPHY]:
Camera Angle & Movement: ${scene.cameraMovement}
Lighting & Atmosphere: ${scene.lightingAtmosphere}
Sound Effects (SFX) & Ambience: ${scene.soundEffects}

[TRANSITION TO NEXT SCENE]:
${scene.transition}

[VOICE-OVER / NARRATION]:
"${scene.voiceoverNarration}"
${scene.dialogue ? `[DIALOGUE]: "${scene.dialogue}"` : ''}

[ISLAMIC REVERENCE & NEGATIVE PROMPTS]:
Strictly maintain respectful symbolic depiction. No physical depiction of the holy face or body of any Prophet. Negative Prompts: (no face of prophet, no facial features of prophets, no blasphemous depictions, no modern watches, no modern technology, no deformities, no blurry faces).
`.trim();

  return getPlatformSpecificSyntax(targetAi, rawBlock, scene.aspectRatio);
}
