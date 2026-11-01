import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System instruction enforcing authentic Islamic scholarship and respect
const ISLAMIC_SCHOLAR_SYSTEM_INSTRUCTION = `
You are an authoritative Islamic scholar, historical narrative writer, and cinema director.
Your core principles:
1. STRICT THEOLOGICAL REVERENCE:
   - Absolute prohibition against any physical or visual depiction of Allah (Subhanahu wa Ta'ala).
   - Absolute prohibition against portraying the physical face, bodily likeness, or avatar of the Holy Prophet Muhammad (Peace Be Upon Him) and all revered Prophets of Allah (AS). Use dignified symbolic visual metaphors (heavenly golden light, first-person camera POV, peaceful footsteps on desert sand, glowing staff on rock, gentle sunset silhouettes, radiant horizon).
2. AUTHENTICITY & TRUTH:
   - Clearly cite authentic Quranic references (Surah Name and Ayah number) and sound Hadith (Sahih Al-Bukhari, Sahih Muslim, etc.).
   - Explicitly distinguish Quranic verses, Sahih Hadith, documented historical records, and illustrative storytelling.
   - Never invent religious quotations, fabricated Hadiths, or unverified miracles.
3. CULTURAL & LINGUISTIC ACCURACY:
   - Provide authentic, eloquent Urdu (اردو) with correct grammar and reverent honorifics: (ﷺ for Prophet Muhammad, علیہ السلام for Prophets, رضی اللہ عنہ for Companions).
   - Provide readable Roman Urdu (easy-to-read transliteration).
   - Provide articulate English narration suitable for international YouTube Shorts, TikTok, and educational documentaries.
`;

// Health and AI status check endpoint
app.get('/api/status', (req, res) => {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    aiConfigured: isConfigured,
    model: 'gemini-3.8-flash',
    version: '1.0.0',
    mode: isConfigured ? 'live-gemini' : 'demo-knowledge-base',
  });
});

// Endpoint: Generate Islamic Story
app.post('/api/generate-story', async (req, res) => {
  try {
    const {
      topic,
      category = 'prophets',
      language = 'ur',
      style = 'cinematic-history',
      length = 'detailed',
      duration = '60s',
    } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a valid story topic.' });
    }

    if (aiClient) {
      const prompt = `
Generate a complete, deeply engaging, and authentic Islamic educational story based on the topic: "${topic}".
Category: ${category}
Language preference: ${language} (Provide Urdu, Roman Urdu, and English sections)
Visual / Narrative Style: ${style}
Story Length: ${length}
Target Duration: ${duration}

Return a valid JSON object matching this schema:
{
  "title": "English Title",
  "titleUrdu": "اردو عنوان",
  "titleRoman": "Roman Urdu Title",
  "storyContent": "Complete compelling narrative text in English with clear scene progression",
  "urduNarration": "مکمل پرتاثیر اردو بیانیہ اور مکالمے جو یوٹیوب شارٹس یا تعلیمی ویڈیوز میں پڑھے جا سکیں",
  "romanUrduNarration": "Roman Urdu narration text for voiceover",
  "englishNarration": "Crisp, emotive English voice-over narration script with timing cues",
  "moralLessons": ["Moral lesson 1", "Moral lesson 2", "Moral lesson 3"],
  "references": [
    {
      "type": "quran",
      "source": "Surah name (chapter:verse)",
      "arabicText": "Arabic verse if applicable",
      "translation": "Accurate English translation",
      "authenticityNote": "Context of revelation"
    },
    {
      "type": "hadith",
      "source": "e.g. Sahih al-Bukhari # or Sahih Muslim #",
      "translation": "Hadith translation",
      "authenticityNote": "Grading / context"
    }
  ]
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: ISLAMIC_SCHOLAR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              titleUrdu: { type: Type.STRING },
              titleRoman: { type: Type.STRING },
              storyContent: { type: Type.STRING },
              urduNarration: { type: Type.STRING },
              romanUrduNarration: { type: Type.STRING },
              englishNarration: { type: Type.STRING },
              moralLessons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              references: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    source: { type: Type.STRING },
                    arabicText: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    authenticityNote: { type: Type.STRING },
                  },
                  required: ['type', 'source', 'translation', 'authenticityNote'],
                },
              },
            },
            required: ['title', 'titleUrdu', 'titleRoman', 'storyContent', 'urduNarration', 'romanUrduNarration', 'englishNarration', 'moralLessons', 'references'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          data: parsed,
        });
      }
    }

    // High quality offline fallback knowledge engine when API key is not present or offline
    const fallbackData = generateFallbackStory(topic, category, style, length, duration);
    return res.json({
      success: true,
      source: 'offline-knowledge-engine',
      data: fallbackData,
    });
  } catch (error: any) {
    console.error('Error generating story:', error);
    // If Gemini fails (e.g. quota limit, network), fallback gracefully with genuine content
    const fallbackData = generateFallbackStory(req.body.topic || 'Islamic Moral Story', 'general', 'cinematic-history', 'detailed', '60s');
    return res.json({
      success: true,
      source: 'offline-knowledge-engine-fallback',
      warning: error.message || 'Served from Islamic Knowledge Engine due to API configuration.',
      data: fallbackData,
    });
  }
});

// Endpoint: Generate Scene-by-Scene AI Video Prompts
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const {
      topic,
      storyContent,
      sceneCount = 10,
      style = 'cinematic-history',
      targetAi = 'veo',
      aspectRatio = '9:16',
      duration = '60s',
    } = req.body;

    const count = Math.min(Math.max(parseInt(sceneCount, 10) || 5, 3), 30);

    if (aiClient) {
      const prompt = `
Generate EXACTLY ${count} scene-by-scene AI video prompts for the Islamic story topic: "${topic}".
Context / Story Summary: "${storyContent ? storyContent.substring(0, 1000) : topic}"
Visual Style: ${style}
Target AI Video Generator: ${targetAi} (e.g. Google Veo 2, Kling AI, Seedance, Runway Gen-3)
Aspect Ratio: ${aspectRatio}
Target Total Duration: ${duration}

CRITICAL ISLAMIC REVERENCE RULES FOR SCENES:
- NEVER depict the face or physical body of Allah or any Prophet (Hazrat Ibrahim, Musa, Muhammad ﷺ, Sulaiman, Yusuf, etc.).
- Use respectful symbolic visuals: divine light rays, glowing atmosphere, first-person camera perspective (POV), footsteps in sand, silhouettes against sunset, gentle desert wind.
- Every scene must be rich and complete so it can be directly copied into AI video generation tools.

Return a JSON array of ${count} objects:
[
  {
    "sceneNumber": 1,
    "title": "Scene short title",
    "visualDescription": "High fidelity, ultra-detailed cinematic visual description with lighting, environment and action",
    "environmentSetting": "Historical architecture, terrain, weather, atmosphere",
    "characterDescription": "Clothing, fabrics, respectful framing (no face of prophets)",
    "characterConsistency": "Specific instructions on color palette, fabric textures, lighting continuity across scenes",
    "characterAction": "Subtle, dignified movement and gesture",
    "cameraMovement": "Camera motion e.g. slow cinematic dolly forward, low-angle drone reveal",
    "lightingAtmosphere": "Lighting quality e.g. golden hour volumetric sunbeams, warm torchlight",
    "soundEffects": "SFX e.g. desert wind whisper, crackling embers, distant thunder, serene ambient drone",
    "dialogue": "Short dialogue or exclamation if applicable (in Urdu or English)",
    "voiceoverNarration": "Poignant voice-over narration text corresponding to this scene",
    "transition": "Transition to next scene e.g. seamless match cut, slow dissolve into dawn",
    "aspectRatio": "${aspectRatio}",
    "visualQuality": "Cinematic 4K HDR, Photorealistic, 24fps",
    "animationStyle": "${style}",
    "fullPromptText": "A complete consolidated master prompt ready to paste directly into ${targetAi}"
  }
]
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: ISLAMIC_SCHOLAR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                environmentSetting: { type: Type.STRING },
                characterDescription: { type: Type.STRING },
                characterConsistency: { type: Type.STRING },
                characterAction: { type: Type.STRING },
                cameraMovement: { type: Type.STRING },
                lightingAtmosphere: { type: Type.STRING },
                soundEffects: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                voiceoverNarration: { type: Type.STRING },
                transition: { type: Type.STRING },
                aspectRatio: { type: Type.STRING },
                visualQuality: { type: Type.STRING },
                animationStyle: { type: Type.STRING },
                fullPromptText: { type: Type.STRING },
              },
              required: [
                'sceneNumber',
                'title',
                'visualDescription',
                'environmentSetting',
                'characterDescription',
                'characterConsistency',
                'characterAction',
                'cameraMovement',
                'lightingAtmosphere',
                'soundEffects',
                'voiceoverNarration',
                'transition',
                'aspectRatio',
                'visualQuality',
                'animationStyle',
                'fullPromptText',
              ],
            },
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        const scenes = JSON.parse(responseText);
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          scenes,
        });
      }
    }

    // High fidelity offline fallback scenes generator
    const fallbackScenes = generateFallbackScenes(topic, count, style, targetAi, aspectRatio);
    return res.json({
      success: true,
      source: 'offline-knowledge-engine',
      scenes: fallbackScenes,
    });
  } catch (error: any) {
    console.error('Error generating prompts:', error);
    const count = Math.min(Math.max(parseInt(req.body.sceneCount, 10) || 5, 3), 30);
    const fallbackScenes = generateFallbackScenes(req.body.topic || 'Islamic Narrative', count, req.body.style || 'cinematic-history', req.body.targetAi || 'veo', req.body.aspectRatio || '9:16');
    return res.json({
      success: true,
      source: 'offline-knowledge-engine-fallback',
      scenes: fallbackScenes,
    });
  }
});

// Endpoint: Generate Voice-over narration with pause markers and pronunciation
app.post('/api/generate-voiceover', async (req, res) => {
  try {
    const {
      topic,
      tone = 'emotional',
      targetDuration = '60s',
      language = 'ur',
      storyText = '',
    } = req.body;

    if (aiClient) {
      const prompt = `
Create an expert voice-over narration script for the Islamic story topic: "${topic}".
Tone: ${tone} (e.g., emotional storytelling, calm educational, dramatic epic documentary)
Target Duration: ${targetDuration}
Language: ${language}
Story Context: ${storyText.substring(0, 800)}

Requirements:
1. Provide rich narration formatted with exact audio pacing cues: [Pause 1.5s], [Slow Reverent Tone], [Whispered Emotion], [Firm Conviction].
2. Provide Urdu script, Roman Urdu transliteration, and English narration.
3. Provide pronunciation guidance for key Arabic/Islamic terms (e.g., Subhan Allah, Tawakkul, Sabr, Ibrahim Al-Khalil).
4. Provide estimated word count and pacing (words per minute).

Return a JSON object:
{
  "urduScript": "اردو صوتی سکرپٹ بمعہ وقفے [وقفہ 1 سیکنڈ]",
  "romanUrduScript": "Roman Urdu script with pause markers [Pause 1s]",
  "englishScript": "English narration script with pause markers [Pause 1s]",
  "pronunciationGuide": [
    { "term": "Tawakkul", "pronunciation": "Ta-wak-kul", "meaning": "Absolute reliance on Allah alone" }
  ],
  "pacingNotes": "Pacing instructions for voice artist or TTS",
  "estimatedDurationSec": 60
}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: ISLAMIC_SCHOLAR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urduScript: { type: Type.STRING },
              romanUrduScript: { type: Type.STRING },
              englishScript: { type: Type.STRING },
              pronunciationGuide: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    pronunciation: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                  },
                  required: ['term', 'pronunciation', 'meaning'],
                },
              },
              pacingNotes: { type: Type.STRING },
              estimatedDurationSec: { type: Type.INTEGER },
            },
            required: ['urduScript', 'romanUrduScript', 'englishScript', 'pronunciationGuide', 'pacingNotes', 'estimatedDurationSec'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          data: JSON.parse(responseText),
        });
      }
    }

    // Fallback voiceover
    return res.json({
      success: true,
      source: 'offline-knowledge-engine',
      data: generateFallbackVoiceover(topic, tone, targetDuration),
    });
  } catch (error: any) {
    console.error('Error generating voiceover:', error);
    return res.json({
      success: true,
      source: 'offline-knowledge-engine-fallback',
      data: generateFallbackVoiceover(req.body.topic || 'Islamic Story', 'emotional', '60s'),
    });
  }
});

// Helper for fallback story generation with genuine Islamic citations
function generateFallbackStory(topic: string, category: string, style: string, length: string, duration: string) {
  const isIbrahim = topic.toLowerCase().includes('ibrahim') || topic.includes('ابراہیم');
  const isUkhdood = topic.toLowerCase().includes('ukhdood') || topic.includes('اخدود');
  const isSulaiman = topic.toLowerCase().includes('sulaiman') || topic.includes('سلیمان');
  const isBilal = topic.toLowerCase().includes('bilal') || topic.includes('بلال');
  const isUmar = topic.toLowerCase().includes('umar') || topic.includes('عمر');

  if (isIbrahim) {
    return {
      title: 'Hazrat Ibrahim (AS) and the Miracle of Cold Fire',
      titleUrdu: 'حضرت ابراہیم علیہ السلام اور دہکتی آگ کا معجزہ',
      titleRoman: 'Hazrat Ibrahim (AS) aur Dehakti Aag Ka Mojza',
      storyContent: `In the ancient city of Ur, Prophet Ibrahim (peace be upon him) stood alone against a nation submerged in idol worship. With unyielding logic and sublime faith, he broke the inanimate stone idols, urging his people to worship the One True Creator of the heavens and the earth.
Infuriated by their inability to defeat his rational arguments, King Nimrod and his priests commanded a colossal furnace to be built. For weeks, towering heaps of timber were collected until the flames reached astronomical heights. Birds flying overhead would drop from the sheer intensity of the heat.
Bound with heavy ropes and placed upon a catapult, Ibrahim (AS) was launched into the heart of the raging inferno. At that supreme moment of surrender, the Angel Jibril (AS) descended, asking: "O Ibrahim! Do you have any need?" Ibrahim (AS) calmly replied: "From you, nothing. As for Allah, He knows my condition and that suffices me."
Then, the Lord of all creation issued a cosmic command directly to the element of fire: "Qulna ya naru kuni bardan wa salaman 'ala Ibrahim" — "O fire, be cool and peaceful for Ibrahim."
Instantly, the scorching embers turned into a garden of fragrant blossoms and cool serenity. Ibrahim (AS) emerged unharmed, demonstrating to all generations that trust in Allah (Tawakkul) extinguishes the fiercest flames of adversity.`,
      urduNarration: `بابل کی قدیم سرزمین پر، جب نمرود اور اس کے درباریوں کے پاس حضرت ابراہیم علیہ السلام کے ٹھوس دلائل کا کوئی جواب نہ بن پڑا، تو انہوں نے ایک ایسی خوفناک آگ کا الاؤ دہکایا جس کے شعلے آسمان سے باتیں کر رہے تھے۔
حضرت ابراہیم علیہ السلام کو گوپھن میں رکھ کر دہکتے شعلوں میں پھینکا گیا۔ اس نازک گھڑی میں حضرت جبرائیل علیہ السلام نے پوچھا: "اے ابراہیم! کیا آپ کو میری کوئی حاجت ہے؟" آپ نے پرسکون آواز میں فرمایا: "تم سے نہیں، میرا اللہ میرا حال جانتا ہے اور وہی میرے لیے کافی ہے!"
تب کائنات کے خالق نے آگ کو حکم دیا: "قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ" — اے آگ! ابراہیم پر ٹھنڈی اور سلامتی والی بن جا!
دیکھتے ہی دیکھتے آگ کے شعلے گلزار میں بدل گئے۔ ایمان اور توکل کی وہ فتح ہوئی جو قیامت تک کے مومنوں کے لیے مشعلِ راہ بن گئی۔`,
      romanUrduNarration: `Jab Namrood aur uski qaum ne Hazrat Ibrahim (AS) ko aag ke dehakte hue alao mein phenka, toh aasman se Jibril (AS) ne poocha: "Kya aapko meri madad chahiye?" Hazrat Ibrahim (AS) ne farmaaya: "Hasbiyallahu wa ni'mal wakeel — Mujhe mera Allah kaafi hai." Aur phir Allah Ta'ala ka farmaan naazil hua: "Aye aag! Ibrahim par thandi aur salamati wali ban ja!" Aur aag gulzar ban gayi.`,
      englishNarration: `Cast into a furnace so fierce no man could approach it, Prophet Ibrahim (AS) placed his absolute trust in the Almighty alone. And the fire, obeying its Creator, transformed into a garden of peace and serenity.`,
      moralLessons: [
        'Tawakkul (Reliance on Allah): When standing upon truth, fear no tyrant.',
        'Courage against falsehood: Conviction of faith triumphs over worldly power.',
        'The laws of nature are entirely subordinate to the Will of Allah SWT.'
      ],
      references: [
        {
          type: 'quran',
          source: 'Surah Al-Anbiya (21:68-69)',
          arabicText: 'قَالُوا حَرِّقُوهُ وَانصُرُوا آلِهَتَكُمْ إِن كُنتُمْ فَاعِلِينَ • قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ',
          translation: 'They said, "Burn him and support your gods - if you are to act." We said, "O fire, be coolness and safety upon Abraham."',
          authenticityNote: 'Explicit Quranic text establishing the divine preservation of Prophet Ibrahim (AS).'
        },
        {
          type: 'hadith',
          source: 'Sahih Al-Bukhari 4563',
          translation: 'Ibn Abbas (RA) narrated: "Hasbunallahu wa ni\'mal wakeel" (Allah is sufficient for us, and He is the best Disposer of affairs) was said by Ibrahim when he was thrown into the fire.',
          authenticityNote: 'Sahih narration with the highest grade of authenticity in hadith scholarship.'
        }
      ]
    };
  } else if (isUkhdood) {
    return {
      title: 'Ashab-ul-Ukhdood: The Steadfast Believers of the Ditch',
      titleUrdu: 'اصحاب الاخدود: استقامت اور سچے ایمان کا امتحان',
      titleRoman: 'Ashab-ul-Ukhdood: Istiqamat aur Sachay Imaan Ka Imtihan',
      storyContent: `In ancient Najran before Islam, a tyrannical king demanded total worship. A gifted young boy was sent to apprentice under the king\'s chief sorcerer. However, on his journey each day, he met a righteous Christian monk who taught him the pure monotheism of Allah.
The boy embraced Tawheed and was blessed by Allah with the miraculous ability to heal the blind and cure lepers through prayer to Allah alone. When the king discovered this, he tortured the monk and sought to kill the boy.
Miraculously, every execution attempt failed—soldiers thrown from mountain cliffs were swept away, and boats on the turbulent sea capsized while the boy was saved.
Finally, the boy said to the king: "You cannot kill me until you gather the people in an open plain, tie me to a tree trunk, take an arrow from my quiver, and say: 'In the Name of Allah, the Lord of this boy' (Bismillahi Rabbil Ghulam)."
The arrogant king complied and shot the arrow. As the boy attained martyrdom, hundreds of thousands of spectators shouted together: "We believe in the Lord of the boy!"
Furious that his tyranny was undone, the king dug vast trenches (Ukhdood), filled them with raging fire, and threw the steadfast believers in. But their souls were honored in the highest heavens, immortalized in Surah Al-Burooj.`,
      urduNarration: `سورۃ البروج کا لرزہ خیز اور ایمان افروز واقعہ: ایک نوجوان جس نے سچے خدا پر ایمان لایا۔ جب ظالم بادشاہ نے اسے قتل کرنا چاہا تو تمام تدبیریں ناکام ہو گئیں۔
بالآخر اس نوجوان نے کہا: "اگر مجھے مارنا چاہتے ہو تو تمام لوگوں کو جمع کرو اور تیر چلا کر کہو: 'باسم اللہ رب الغلام' (اللہ کے نام کے ساتھ جو اس لڑکے کا رب ہے)۔"
تیر لگا اور نوجوان شہید ہو گیا، مگر سارا مجمع پکار اٹھا: "ہم اس لڑکے کے رب پر ایمان لائے!"
ظالم بادشاہ نے خندقیں کھود کر آگ سے بھر دیں، مگر سچے اہل ایمان نے آگ میں جلنا گوارا کر لیا لیکن توحید کا دامن نہ چھوڑا۔`,
      romanUrduNarration: `Ashab-ul-Ukhdood ki kahani humein sikhata hai ke sachay momin dunya ke badshaahon ke zulm se nahi dartay. Jab us ba-himmat nojawan ne 'Bismillahi Rabbil Ghulam' ka nara buland karwaya, toh poori qaum ne ek Allah ko apna Rab maan liya.`,
      englishNarration: `Surah Al-Burooj reminds us of the young believer whose unyielding martyrdom sparked faith across an entire empire. Thrown into fiery trenches, their bodies perished, but their faith remained eternal.`,
      moralLessons: [
        'Steadfastness in faith (Istiqamah): Truth never surrenders to oppression.',
        'The ultimate victory is spiritual salvation in the sight of Allah.',
        'A single individual of sincere faith can awaken an entire nation.'
      ],
      references: [
        {
          type: 'quran',
          source: 'Surah Al-Burooj (85:4-8)',
          arabicText: 'قُتِلَ أَصْحَابُ الْأُخْدُودِ • النَّارِ ذَاتِ الْوَقُودِ • إِذْ هُمْ عَلَيْهَا قُعُودٌ • وَهُمْ عَلَىٰ مَا يَفْعَلُونَ بِالْمُؤْمِنِينَ شُهُودٌ',
          translation: 'Cursed were the companions of the trench. [Containing] the fire full of fuel, When they were sitting near it, And they, to what they were doing against the believers, were witnesses.',
          authenticityNote: 'Surah Al-Burooj explicitly condemns the tyrants and honors the believers.'
        },
        {
          type: 'hadith',
          source: 'Sahih Muslim 3005',
          translation: 'The full historic hadith narrated by Suhayb (RA) detailing the boy, the monk, and the sorcerer.',
          authenticityNote: 'Sahih Muslim authentic tradition providing the complete context.'
        }
      ]
    };
  }

  // Generic rich Islamic educational story
  return {
    title: `${topic} — An Islamic Journey of Wisdom and Faith`,
    titleUrdu: `${topic} — حکمت، ایمان اور تقویٰ کی روشنی`,
    titleRoman: `${topic} — Hikmat, Imaan aur Taqwa Ki Roshni`,
    storyContent: `Throughout Islamic history, luminous examples of integrity, reliance upon Allah, and moral steadfastness shine as guides for humanity. This narrative explores "${topic}", illustrating how sincere intention, steadfast adherence to the teachings of the Quran, and walking upon the Sunnah of the Prophet Muhammad ﷺ elevate the human soul and bring peace to societies.`,
    urduNarration: `اسلامی تاریخ کا ہر ورق حکمت اور عبرت کا آئینہ دار ہے۔ "${topic}" ہمیں یاد دلاتا ہے کہ سچی کامیابی صرف اللہ تعالیٰ کی بندگی، صبر اور امانت داری میں مضمر ہے۔`,
    romanUrduNarration: `${topic} humein yeh dars deta hai ke jab insan Allah ki raza aur sachai ke raste par chalta hai, toh har mushkil aasan ho jati hai.`,
    englishNarration: `This inspiring chapter from Islamic heritage reminds us that true honor lies in humility, truthfulness, and steadfast faith in the Almighty.`,
    moralLessons: [
      'Patience (Sabr) in times of trial leads to divine assistance.',
      'Honesty and integrity (Amanah) are the hallmarks of a true believer.',
      'Sincere remembrance of Allah illuminates the heart in times of darkness.'
    ],
    references: [
      {
        type: 'quran',
        source: 'Surah Al-Baqarah (2:153)',
        arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
        authenticityNote: 'Foundational Quranic verse on perseverance.'
      },
      {
        type: 'hadith',
        source: 'Sahih Al-Bukhari & Sahih Muslim',
        translation: 'The Messenger of Allah ﷺ said: "Truthfulness leads to righteousness, and righteousness leads to Paradise."',
        authenticityNote: 'Muttafaq \'Alayh (agreed upon).'
      }
    ]
  };
}

// Helper for generating structured scene-by-scene prompts
function generateFallbackScenes(topic: string, count: number, style: string, targetAi: string, aspectRatio: string) {
  const scenes = [];
  const titles = [
    'The Dawn of Conviction & Ancient Sands',
    'Whispers of Truth Amidst False Idols',
    'The Gathering Storm & The Tyrant\'s Decree',
    'The Trial of the Believers',
    'The Moment of Supreme Trust (Tawakkul)',
    'Divine Intervention & Heavenly Serenity',
    'The Radiance of Miracle & Astounded Crowd',
    'A Garden of Peace Amidst Ashes',
    'The Triumph of Monotheism',
    'The Eternal Legacy for Generations'
  ];

  for (let i = 1; i <= count; i++) {
    const sceneTitle = titles[(i - 1) % titles.length];
    const visual = `Cinematic historical visual showing ancient Middle Eastern stone and mudbrick architecture, golden hour volumetric sunbeams piercing through desert haze. Respectful Islamic framing: camera focuses on glowing atmospheric rays, footsteps in sacred sand, and dramatic silhouettes. Strictly no depiction of Prophet faces or physical forms.`;
    const environment = `Ancient Mesopotamia / Arabian peninsula, 7th century or ancient era, detailed sandstone textures, palm fronds swaying softly, desert dunes under a dramatic twilight sky.`;
    const characterDesc = `Ancient desert inhabitants, dignified modest linen robes in earthen tones (ochre, indigo, off-white), expressions of solemn awe. Followers framed from behind or in side profile.`;
    const characterConsistency = `Maintain uniform color grading, identical hand-woven linen texture on garments, consistent atmospheric dust motes and warm lighting across all sequences.`;
    const characterAction = `People looking upwards in reverence and astonishment, hands gently raised in prayer and contemplation.`;
    const cameraMovement = i % 2 === 0 ? 'Slow cinematic crane shot descending towards ancient gateway' : 'Smooth low-angle gimbal tracking shot gliding forward across the desert sands';
    const lighting = 'Golden hour warm cinematic backlight with volumetric dust rays, rim lighting on silhouetted figures';
    const sfx = 'Subtle desert wind whistling through palm branches, crackling embers, distant atmospheric oud drone';
    const vo = `Scene ${i}: When hearts were tested to the utmost limit, the divine mercy of the Creator enveloped those who stood firm in faith.`;
    const transition = i === count ? 'Gentle fade to black with luminous calligraphic glow' : 'Match cut on glowing embers transitioning smoothly to morning sun';

    const fullPromptText = `[${targetAi.toUpperCase()} PROMPT - SCENE ${i}/${count}]\n${visual}\nEnvironment: ${environment}\nCinematography: ${cameraMovement}, ${lighting}, 4K HDR, 24fps.\nRespectful Islamic Framing: No face of Prophet, symbolic golden rays and atmospheric silhouettes.\nAspect Ratio: --ar ${aspectRatio} --style ${style}`;

    scenes.push({
      sceneNumber: i,
      title: sceneTitle,
      visualDescription: visual,
      environmentSetting: environment,
      characterDescription: characterDesc,
      characterConsistency: characterConsistency,
      characterAction: characterAction,
      cameraMovement: cameraMovement,
      lightingAtmosphere: lighting,
      soundEffects: sfx,
      dialogue: 'سبحان الله وبحمده — سبحان الله العظیم',
      voiceoverNarration: vo,
      transition: transition,
      aspectRatio: aspectRatio,
      visualQuality: 'Cinematic 4K HDR, Photorealistic, 24fps',
      animationStyle: style,
      fullPromptText: fullPromptText,
    });
  }

  return scenes;
}

function generateFallbackVoiceover(topic: string, tone: string, duration: string) {
  return {
    urduScript: `[وقفہ 1 سیکنڈ]
بسم اللہ الرحمن الرحیم
[پروقار اور پرتاثیر لہجہ]
یہ داستان ہے سچے ایمان اور استقامت کی...
[وقفہ 1.5 سیکنڈ]
جب دنیا کی تمام ظاہری طاقتیں جھوٹ کے سہارے کھڑی تھیں، تب ایک سچے مومن کا دل صرف اپنے رب کے حضور جھکا۔
[جذباتی دھیمی آواز]
"اگر اللہ تمہاری مدد کرے تو کوئی تم پر غالب نہیں آ سکتا!"
[وقفہ 2 سیکنڈ]
یہی وہ ایمان ہے جو دہکتی آگ کو بھی گلزار میں بدل دیتا ہے...`,
    romanUrduScript: `[Pause 1s]\nBismillahir Rahmanir Raheem.\n[Emotional Storytelling Tone]\nYeh daastan hai sachi himmat aur be-misal Tawakkul ki...\n[Pause 1.5s]\nJab saari duniya mukhalif ho gayi, tab sirf ek Rab-e-Kareem par yaqeen tha.\n[Soft emotional cadence]\n"Hasbiyallahu wa ni'mal wakeel."\n[Pause 2s]\nAur dekhiye, kaise Allah ne mushkil ko aasaani aur aag ko gulzar bana diya!`,
    englishScript: `[Pause 1.0s]\nIn the name of Allah, the Most Gracious, the Most Merciful.\n[Warm, reverent documentary voice]\nThroughout the ages, when all worldly support vanished, the believers stood firm on one unshakeable truth.\n[Pause 1.5s]\n"Sufficient for us is Allah, and He is the best Disposer of affairs."\n[Gentle crescendo]\nA testament that faith in the Divine transforms trials into triumphs.`,
    pronunciationGuide: [
      { term: 'Tawakkul', pronunciation: 'Ta-wak-kul', meaning: 'Complete reliance on Allah' },
      { term: 'Hasbunallah', pronunciation: 'Has-bu-nal-lah', meaning: 'Allah is sufficient for us' },
      { term: 'Sabr', pronunciation: 'Sabr (rolled r)', meaning: 'Patient perseverance with dignity' }
    ],
    pacingNotes: 'Maintain a measured cadence of ~120 words per minute. Allow dramatic pauses after spiritual declarations.',
    estimatedDurationSec: duration === '30s' ? 30 : duration === '2m' ? 120 : 60
  };
}

// In development, hook up Vite middleware so that both API and Frontend work on port 3000
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Islamic Story AI Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
});
