// Nano Banana AI Image Generation Service
// Business Premium feature for generating promotional images
// Supports: OpenAI DALL-E, Hugging Face (free), Replicate

export type AiProvider = 'openai' | 'huggingface' | 'replicate';

export interface NanoBananaConfig {
  provider: AiProvider;
  apiKey: string;
  apiUrl: string;
  model: string;
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

// Provider configurations
const PROVIDER_CONFIGS = {
  openai: {
    url: 'https://api.openai.com/v1/images/generations',
    model: 'dall-e-3',
    envKey: 'OPENAI_API_KEY',
  },
  huggingface: {
    url: 'https://api-inference.huggingface.co/models/',
    model: 'stabilityai/stable-diffusion-xl-base-1.0', // Free SDXL model
    envKey: 'HUGGINGFACE_API_KEY',
  },
  replicate: {
    url: 'https://api.replicate.com/v1/predictions',
    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    envKey: 'REPLICATE_API_KEY',
  },
};

// Get config from environment
export function getNanoBananaConfig(): NanoBananaConfig {
  // Check for explicit provider setting
  const providerEnv = (process.env.AI_IMAGE_PROVIDER || 'huggingface').toLowerCase() as AiProvider;

  // Validate provider
  const provider = ['openai', 'huggingface', 'replicate'].includes(providerEnv)
    ? providerEnv
    : 'huggingface';

  const providerConfig = PROVIDER_CONFIGS[provider];

  // Get API key - check provider-specific key first, then generic
  const apiKey = process.env.NANOBANANA_API_KEY ||
                 process.env[providerConfig.envKey] ||
                 '';

  // Allow custom API URL override
  const apiUrl = process.env.NANOBANANA_API_URL || providerConfig.url;

  // Allow custom model override
  const model = process.env.AI_IMAGE_MODEL || providerConfig.model;

  return { provider, apiKey, apiUrl, model };
}

// Check if AI generation is available
export function isAiGenerationAvailable(): boolean {
  const config = getNanoBananaConfig();
  return !!config.apiKey;
}

// Get current provider info
export function getProviderInfo(): { provider: AiProvider; model: string; isFree: boolean } {
  const config = getNanoBananaConfig();
  return {
    provider: config.provider,
    model: config.model,
    isFree: config.provider === 'huggingface',
  };
}

// Generate image using OpenAI DALL-E
async function generateWithOpenAI(
  config: NanoBananaConfig,
  enhancedPrompt: string,
  width: number,
  height: number
): Promise<GenerationResult> {
  // Map to valid DALL-E sizes (1024x1024, 1024x1792, 1792x1024)
  let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
  if (width > height * 1.3) {
    size = '1792x1024'; // Landscape
  } else if (height > width * 1.3) {
    size = '1024x1792'; // Portrait
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      prompt: enhancedPrompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `OpenAI API request failed: ${response.status}`);
  }

  const result = await response.json();

  if (!result.data || !result.data[0]?.url) {
    throw new Error('Invalid response from OpenAI');
  }

  return {
    imageUrl: result.data[0].url,
    revisedPrompt: result.data[0].revised_prompt,
    generationId: `gen_openai_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };
}

// Generate image using Hugging Face Inference API (FREE!)
async function generateWithHuggingFace(
  config: NanoBananaConfig,
  enhancedPrompt: string,
  width: number,
  height: number,
  negativePrompt?: string
): Promise<GenerationResult> {
  const modelUrl = config.apiUrl.endsWith('/')
    ? `${config.apiUrl}${config.model}`
    : `${config.apiUrl}/${config.model}`;

  const response = await fetch(modelUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: negativePrompt || 'blurry, low quality, distorted, ugly, bad anatomy',
        width: Math.min(width, 1024), // HF has size limits
        height: Math.min(height, 1024),
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    // Check if model is loading (common with free tier)
    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.estimated_time) {
        throw new Error(`Модель загружается, подождите ~${Math.ceil(errorData.estimated_time)} секунд и попробуйте снова`);
      }
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Hugging Face API request failed: ${response.status}`);
  }

  // HF returns raw image data, need to convert to base64 data URL
  const imageBlob = await response.blob();
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = imageBlob.type || 'image/png';

  return {
    imageUrl: `data:${mimeType};base64,${base64}`,
    generationId: `gen_hf_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  };
}

// Generate image using Replicate
async function generateWithReplicate(
  config: NanoBananaConfig,
  enhancedPrompt: string,
  width: number,
  height: number,
  negativePrompt?: string
): Promise<GenerationResult> {
  // Start prediction
  const startResponse = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: config.model.includes(':') ? config.model.split(':')[1] : config.model,
      input: {
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt || 'blurry, low quality, distorted',
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
        num_inference_steps: 30,
      },
    }),
  });

  if (!startResponse.ok) {
    const error = await startResponse.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `Replicate API request failed: ${startResponse.status}`);
  }

  const prediction = await startResponse.json();

  // Poll for completion (max 60 seconds)
  const maxAttempts = 30;
  let attempts = 0;
  let result = prediction;

  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pollResponse = await fetch(result.urls.get, {
      headers: {
        'Authorization': `Token ${config.apiKey}`,
      },
    });

    if (!pollResponse.ok) {
      throw new Error('Failed to check generation status');
    }

    result = await pollResponse.json();
    attempts++;
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Image generation failed');
  }

  if (result.status !== 'succeeded') {
    throw new Error('Generation timed out');
  }

  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

  return {
    imageUrl,
    generationId: `gen_replicate_${result.id}`,
  };
}

// Generate image using AI (main function)
export async function generateImage(request: GenerationRequest): Promise<GenerationResult> {
  const config = getNanoBananaConfig();

  if (!config.apiKey) {
    throw new Error(
      'AI image generation not configured. Set one of: HUGGINGFACE_API_KEY (free), OPENAI_API_KEY, or REPLICATE_API_KEY'
    );
  }

  const stylePreset = request.style ? STYLE_PRESETS[request.style] : null;

  // Build the enhanced prompt
  let enhancedPrompt = translatePromptForAI(request.prompt);
  if (stylePreset) {
    enhancedPrompt += stylePreset.suffix;
  }

  // Add quality boosters for better results
  enhancedPrompt += ', high quality, detailed, professional';

  // Determine dimensions
  const width = request.width || stylePreset?.width || 1024;
  const height = request.height || stylePreset?.height || 1024;

  try {
    switch (config.provider) {
      case 'openai':
        return await generateWithOpenAI(config, enhancedPrompt, width, height);

      case 'huggingface':
        return await generateWithHuggingFace(config, enhancedPrompt, width, height, request.negativePrompt);

      case 'replicate':
        return await generateWithReplicate(config, enhancedPrompt, width, height, request.negativePrompt);

      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
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
    'меню': 'food menu restaurant',
    'доставка': 'delivery service',
    'фитнес': 'fitness gym workout',
    'салон': 'salon service',
    'магазин': 'shop store retail',
  };

  let translated = prompt.toLowerCase();
  for (const [ru, en] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(ru, 'gi'), en);
  }

  return translated;
}
