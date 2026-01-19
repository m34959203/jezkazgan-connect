// Nano Banana AI Image Generation Service
// Business Premium feature for generating promotional images

export interface NanoBananaConfig {
  apiKey: string;
  apiUrl: string;
}

export interface GenerationRequest {
  prompt: string;
  style?: 'banner' | 'promo' | 'event' | 'poster' | 'social';
  width?: number;
  height?: number;
  negativePrompt?: string;
}

export interface GenerationResult {
  imageUrl: string;
  revisedPrompt?: string;
  generationId: string;
}

// Style presets with optimized prompts for each use case
const STYLE_PRESETS: Record<string, { suffix: string; width: number; height: number }> = {
  banner: {
    suffix: ', professional banner design, high quality, modern, clean layout, marketing material',
    width: 1200,
    height: 400,
  },
  promo: {
    suffix: ', promotional poster, vibrant colors, eye-catching, commercial design, sale advertisement',
    width: 1200,
    height: 675,
  },
  event: {
    suffix: ', event poster design, festive, celebration, entertainment, announcement style',
    width: 1200,
    height: 675,
  },
  poster: {
    suffix: ', artistic poster, bold typography space, graphic design, professional print quality',
    width: 800,
    height: 1200,
  },
  social: {
    suffix: ', social media post, engaging, shareable, modern aesthetic, instagram style',
    width: 1080,
    height: 1080,
  },
};

// Get config from environment
export function getNanoBananaConfig(): NanoBananaConfig {
  const apiKey = process.env.NANOBANANA_API_KEY || process.env.OPENAI_API_KEY || '';
  // Default to OpenAI DALL-E compatible API, but can be changed to actual Nano Banana API
  const apiUrl = process.env.NANOBANANA_API_URL || 'https://api.openai.com/v1/images/generations';

  return { apiKey, apiUrl };
}

// Check if AI generation is available
export function isAiGenerationAvailable(): boolean {
  const config = getNanoBananaConfig();
  return !!config.apiKey;
}

// Generate image using AI
export async function generateImage(request: GenerationRequest): Promise<GenerationResult> {
  const config = getNanoBananaConfig();

  if (!config.apiKey) {
    throw new Error('AI image generation not configured. Please set NANOBANANA_API_KEY or OPENAI_API_KEY.');
  }

  const stylePreset = request.style ? STYLE_PRESETS[request.style] : null;

  // Build the enhanced prompt
  let enhancedPrompt = request.prompt;
  if (stylePreset) {
    enhancedPrompt += stylePreset.suffix;
  }

  // Add negative prompt if provided
  if (request.negativePrompt) {
    enhancedPrompt += `. Avoid: ${request.negativePrompt}`;
  }

  // Determine dimensions
  const width = request.width || stylePreset?.width || 1024;
  const height = request.height || stylePreset?.height || 1024;

  // Map to valid DALL-E sizes (1024x1024, 1024x1792, 1792x1024)
  let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
  if (width > height * 1.3) {
    size = '1792x1024'; // Landscape
  } else if (height > width * 1.3) {
    size = '1024x1792'; // Portrait
  }

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data || !result.data[0]?.url) {
      throw new Error('Invalid response from AI service');
    }

    return {
      imageUrl: result.data[0].url,
      revisedPrompt: result.data[0].revised_prompt,
      generationId: `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate image');
  }
}

// Generate prompt suggestions based on content type
export function generatePromptSuggestions(contentType: 'event' | 'promotion' | 'banner', context?: {
  title?: string;
  description?: string;
  category?: string;
  discount?: string;
}): string[] {
  const suggestions: string[] = [];

  if (contentType === 'event') {
    const category = context?.category || 'event';
    suggestions.push(
      `Афиша ${context?.title || 'события'} в Жезказгане, современный дизайн`,
      `Красочный постер для ${category === 'concerts' ? 'концерта' : category === 'sports' ? 'спортивного мероприятия' : 'события'}`,
      `Яркий баннер для анонса мероприятия, казахстанский колорит`,
    );
  } else if (contentType === 'promotion') {
    suggestions.push(
      `Рекламный баннер "Скидка ${context?.discount || '20%'}", привлекательный дизайн`,
      `Промо-постер для акции ${context?.title || ''}, яркие цвета`,
      `Баннер распродажи, современный минималистичный стиль`,
    );
  } else if (contentType === 'banner') {
    suggestions.push(
      `Рекламный баннер для бизнеса в Жезказгане, профессиональный дизайн`,
      `Корпоративный баннер, современный стиль, чистый дизайн`,
      `Привлекательный рекламный материал для городского бизнеса`,
    );
  }

  return suggestions;
}

// Translate common Kazakh/Russian business terms to English for better AI results
export function translatePromptForAI(prompt: string): string {
  const translations: Record<string, string> = {
    'скидка': 'discount sale',
    'акция': 'special offer promotion',
    'распродажа': 'big sale clearance',
    'концерт': 'concert music event',
    'ресторан': 'restaurant dining',
    'кафе': 'cafe coffee shop',
    'спорт': 'sports fitness',
    'красота': 'beauty salon spa',
    'жезказган': 'Zhezkazgan Kazakhstan city',
    'мероприятие': 'event celebration',
    'праздник': 'holiday festival celebration',
    'открытие': 'grand opening',
    'новинка': 'new arrival product',
  };

  let translated = prompt.toLowerCase();
  for (const [ru, en] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(ru, 'gi'), en);
  }

  return translated;
}
