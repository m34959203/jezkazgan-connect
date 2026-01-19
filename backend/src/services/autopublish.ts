// Social Media Auto-Publish Service
// Business Premium feature for automatic posting to social networks
// Based on AIMAK implementation with retry logic and better error handling

export type Platform = 'telegram' | 'instagram' | 'vk' | 'facebook';

export interface PublishContent {
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  link?: string;
  contentType: 'event' | 'promotion';
  // Event specific
  date?: string;
  location?: string;
  price?: number;
  isFree?: boolean;
  // Promotion specific
  discount?: string;
  validUntil?: string;
}

export interface PlatformCredentials {
  // Telegram
  telegramBotToken?: string;
  telegramChannelId?: string;
  // Instagram (через Facebook Graph API)
  instagramAccessToken?: string;
  instagramBusinessAccountId?: string;
  // VK
  vkAccessToken?: string;
  vkGroupId?: string;
  // Facebook
  facebookAccessToken?: string;
  facebookPageId?: string;
}

export interface PublishResult {
  success: boolean;
  platform: Platform;
  postId?: string;
  postUrl?: string;
  error?: string;
  retryCount?: number;
}

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 16000, // 16 seconds
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate exponential backoff delay
function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

// Retry wrapper for API calls
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = RETRY_CONFIG.maxAttempts,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<{ result: T; attempts: number }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      return { result, attempts: attempt };
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts && shouldRetry(error)) {
        const delay = getRetryDelay(attempt);
        console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

// Check if error is due to token expiration
function isTokenExpiredError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: number }).code;
    // Facebook/Instagram token errors
    return code === 190 || code === 463 || code === 102;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'));
  }
  return false;
}

// Format content for Telegram
function formatTelegramMessage(content: PublishContent, businessName: string): string {
  const lines: string[] = [];

  if (content.contentType === 'event') {
    lines.push(`🎉 *${escapeMarkdown(content.title)}*`);
    lines.push('');
    if (content.description) {
      lines.push(escapeMarkdown(content.description.substring(0, 300)));
      if (content.description.length > 300) lines.push('...');
      lines.push('');
    }
    if (content.date) {
      const dateStr = new Date(content.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      lines.push(`📅 ${dateStr}`);
    }
    if (content.location) {
      lines.push(`📍 ${escapeMarkdown(content.location)}`);
    }
    if (content.isFree) {
      lines.push('💵 Вход свободный');
    } else if (content.price) {
      lines.push(`💵 от ${content.price.toLocaleString()} ₸`);
    }
  } else {
    // Promotion
    lines.push(`🔥 *${escapeMarkdown(content.title)}*`);
    lines.push('');
    if (content.discount) {
      lines.push(`💰 Скидка: *${escapeMarkdown(content.discount)}*`);
    }
    if (content.description) {
      lines.push('');
      lines.push(escapeMarkdown(content.description.substring(0, 300)));
      if (content.description.length > 300) lines.push('...');
    }
    if (content.validUntil) {
      const dateStr = new Date(content.validUntil).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      lines.push('');
      lines.push(`⏰ Действует до: ${dateStr}`);
    }
  }

  lines.push('');
  lines.push(`🏪 ${escapeMarkdown(businessName)}`);

  if (content.link) {
    lines.push('');
    lines.push(`[Подробнее](${content.link})`);
  }

  return lines.join('\n');
}

// Escape special characters for Telegram Markdown
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Publish to Telegram channel with retry and fallback
export async function publishToTelegram(
  content: PublishContent,
  credentials: PlatformCredentials,
  businessName: string
): Promise<PublishResult> {
  if (!credentials.telegramBotToken || !credentials.telegramChannelId) {
    return {
      success: false,
      platform: 'telegram',
      error: 'Telegram credentials not configured',
    };
  }

  const message = formatTelegramMessage(content, businessName);
  const apiUrl = `https://api.telegram.org/bot${credentials.telegramBotToken}`;

  // Try to send with image first, fallback to text if fails
  const sendWithImage = async () => {
    if (content.imageUrl) {
      const response = await fetch(`${apiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.telegramChannelId,
          photo: content.imageUrl,
          caption: message,
          parse_mode: 'MarkdownV2',
        }),
      });
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send photo');
      }
      return result;
    } else if (content.videoUrl) {
      const response = await fetch(`${apiUrl}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.telegramChannelId,
          video: content.videoUrl,
          caption: message,
          parse_mode: 'MarkdownV2',
        }),
      });
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.description || 'Failed to send video');
      }
      return result;
    }
    return null;
  };

  const sendTextOnly = async () => {
    const response = await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: credentials.telegramChannelId,
        text: message,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: false,
      }),
    });
    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.description || 'Failed to send message');
    }
    return result;
  };

  try {
    let result;
    let retryCount = 0;

    // Try with media first
    if (content.imageUrl || content.videoUrl) {
      try {
        const { result: mediaResult, attempts } = await withRetry(sendWithImage, 2);
        result = mediaResult;
        retryCount = attempts - 1;
      } catch {
        // Fallback to text-only
        console.log('Telegram: Media send failed, falling back to text-only');
        const { result: textResult, attempts } = await withRetry(sendTextOnly);
        result = textResult;
        retryCount = attempts - 1;
      }
    } else {
      const { result: textResult, attempts } = await withRetry(sendTextOnly);
      result = textResult;
      retryCount = attempts - 1;
    }

    const messageId = result?.result?.message_id;
    const chatId = credentials.telegramChannelId!.replace('@', '');

    return {
      success: true,
      platform: 'telegram',
      postId: String(messageId),
      postUrl: `https://t.me/${chatId}/${messageId}`,
      retryCount,
    };
  } catch (error) {
    return {
      success: false,
      platform: 'telegram',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Format content for VK
function formatVkMessage(content: PublishContent, businessName: string): string {
  const lines: string[] = [];

  if (content.contentType === 'event') {
    lines.push(`🎉 ${content.title}`);
    lines.push('');
    if (content.description) {
      lines.push(content.description.substring(0, 500));
      if (content.description.length > 500) lines.push('...');
      lines.push('');
    }
    if (content.date) {
      const dateStr = new Date(content.date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      lines.push(`📅 ${dateStr}`);
    }
    if (content.location) {
      lines.push(`📍 ${content.location}`);
    }
    if (content.isFree) {
      lines.push('💵 Вход свободный');
    } else if (content.price) {
      lines.push(`💵 от ${content.price.toLocaleString()} ₸`);
    }
  } else {
    lines.push(`🔥 ${content.title}`);
    if (content.discount) {
      lines.push(`💰 Скидка: ${content.discount}`);
    }
    if (content.description) {
      lines.push('');
      lines.push(content.description.substring(0, 500));
    }
    if (content.validUntil) {
      const dateStr = new Date(content.validUntil).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      lines.push('');
      lines.push(`⏰ Действует до: ${dateStr}`);
    }
  }

  lines.push('');
  lines.push(`🏪 ${businessName}`);

  if (content.link) {
    lines.push('');
    lines.push(content.link);
  }

  return lines.join('\n');
}

// Publish to VK group with retry
export async function publishToVk(
  content: PublishContent,
  credentials: PlatformCredentials,
  businessName: string
): Promise<PublishResult> {
  if (!credentials.vkAccessToken || !credentials.vkGroupId) {
    return {
      success: false,
      platform: 'vk',
      error: 'VK credentials not configured',
    };
  }

  const message = formatVkMessage(content, businessName);

  const postToVk = async () => {
    const params = new URLSearchParams({
      access_token: credentials.vkAccessToken!,
      owner_id: `-${credentials.vkGroupId}`,
      message,
      v: '5.131',
    });

    if (content.imageUrl) {
      params.append('attachments', content.imageUrl);
    }

    const response = await fetch(`https://api.vk.com/method/wall.post?${params}`, {
      method: 'POST',
    });

    const result = await response.json();

    if (result.error) {
      const error = new Error(result.error.error_msg || 'VK API error');
      (error as { code?: number }).code = result.error.error_code;
      throw error;
    }

    return result;
  };

  try {
    const { result, attempts } = await withRetry(postToVk, 3, (error) => !isTokenExpiredError(error));
    const postId = result.response?.post_id;

    return {
      success: true,
      platform: 'vk',
      postId: String(postId),
      postUrl: `https://vk.com/wall-${credentials.vkGroupId}_${postId}`,
      retryCount: attempts - 1,
    };
  } catch (error) {
    const isExpired = isTokenExpiredError(error);
    return {
      success: false,
      platform: 'vk',
      error: isExpired
        ? 'VK access token expired. Please reconnect your VK account.'
        : (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

// Publish to Instagram (via Facebook Graph API) with container-based approach
export async function publishToInstagram(
  content: PublishContent,
  credentials: PlatformCredentials,
  businessName: string
): Promise<PublishResult> {
  if (!credentials.instagramAccessToken || !credentials.instagramBusinessAccountId) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Instagram credentials not configured',
    };
  }

  if (!content.imageUrl) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Instagram requires an image',
    };
  }

  // Encode Cyrillic characters in URL
  const encodedImageUrl = content.imageUrl.replace(/[а-яА-ЯёЁ]/g, (char) =>
    encodeURIComponent(char)
  );

  // Format caption for Instagram
  const caption = [
    content.contentType === 'event' ? '🎉' : '🔥',
    content.title,
    '',
    content.description?.substring(0, 1000) || '',
    '',
    `🏪 ${businessName}`,
    '',
    '#жезказган #zhezkazgan #kazakhstan #казахстан #afisha',
  ].join('\n');

  const graphApiUrl = 'https://graph.facebook.com/v18.0';

  // Step 1: Create media container
  const createContainer = async () => {
    const response = await fetch(
      `${graphApiUrl}/${credentials.instagramBusinessAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: encodedImageUrl,
          caption,
          access_token: credentials.instagramAccessToken,
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      const error = new Error(result.error.message || 'Failed to create media container');
      (error as { code?: number }).code = result.error.code;
      throw error;
    }

    return result.id;
  };

  // Step 2: Poll container status until ready
  const waitForContainerReady = async (containerId: string): Promise<boolean> => {
    const maxAttempts = 20;
    const pollInterval = 3000; // 3 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(
        `${graphApiUrl}/${containerId}?fields=status_code&access_token=${credentials.instagramAccessToken}`
      );
      const result = await response.json();

      if (result.status_code === 'FINISHED') {
        return true;
      }

      if (result.status_code === 'ERROR') {
        throw new Error('Instagram container processing failed');
      }

      // Status is IN_PROGRESS, wait and retry
      await sleep(pollInterval);
    }

    throw new Error('Instagram container processing timeout');
  };

  // Step 3: Publish the container
  const publishContainer = async (containerId: string) => {
    const response = await fetch(
      `${graphApiUrl}/${credentials.instagramBusinessAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: credentials.instagramAccessToken,
        }),
      }
    );

    const result = await response.json();

    if (result.error) {
      const error = new Error(result.error.message || 'Failed to publish to Instagram');
      (error as { code?: number }).code = result.error.code;
      throw error;
    }

    return result.id;
  };

  try {
    // Create container with retry
    const { result: containerId } = await withRetry(createContainer, 2, (error) => !isTokenExpiredError(error));

    // Wait for container to be ready
    await waitForContainerReady(containerId);

    // Publish with retry
    const { result: postId, attempts } = await withRetry(
      () => publishContainer(containerId),
      2,
      (error) => !isTokenExpiredError(error)
    );

    // Get the permalink
    let postUrl = `https://www.instagram.com/`;
    try {
      const permalinkResponse = await fetch(
        `${graphApiUrl}/${postId}?fields=permalink&access_token=${credentials.instagramAccessToken}`
      );
      const permalinkResult = await permalinkResponse.json();
      if (permalinkResult.permalink) {
        postUrl = permalinkResult.permalink;
      }
    } catch {
      // Ignore permalink fetch errors
    }

    return {
      success: true,
      platform: 'instagram',
      postId,
      postUrl,
      retryCount: attempts - 1,
    };
  } catch (error) {
    const isExpired = isTokenExpiredError(error);
    return {
      success: false,
      platform: 'instagram',
      error: isExpired
        ? 'Instagram access token expired. Please reconnect your Instagram account.'
        : (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

// Publish to Facebook page
export async function publishToFacebook(
  content: PublishContent,
  credentials: PlatformCredentials,
  businessName: string
): Promise<PublishResult> {
  if (!credentials.facebookAccessToken || !credentials.facebookPageId) {
    return {
      success: false,
      platform: 'facebook',
      error: 'Facebook credentials not configured',
    };
  }

  const graphApiUrl = 'https://graph.facebook.com/v18.0';

  // Format message for Facebook
  const message = [
    content.contentType === 'event' ? '🎉' : '🔥',
    content.title,
    '',
    content.description?.substring(0, 1500) || '',
    '',
    `🏪 ${businessName}`,
    content.link ? `\n🔗 ${content.link}` : '',
  ].join('\n');

  const postToFacebook = async () => {
    let endpoint: string;
    let body: Record<string, string>;

    if (content.imageUrl) {
      // Photo post
      endpoint = `${graphApiUrl}/${credentials.facebookPageId}/photos`;
      body = {
        url: content.imageUrl,
        caption: message,
        access_token: credentials.facebookAccessToken!,
      };
    } else if (content.link) {
      // Link post
      endpoint = `${graphApiUrl}/${credentials.facebookPageId}/feed`;
      body = {
        message,
        link: content.link,
        access_token: credentials.facebookAccessToken!,
      };
    } else {
      // Text post
      endpoint = `${graphApiUrl}/${credentials.facebookPageId}/feed`;
      body = {
        message,
        access_token: credentials.facebookAccessToken!,
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.error) {
      const error = new Error(result.error.message || 'Failed to post to Facebook');
      (error as { code?: number }).code = result.error.code;
      throw error;
    }

    return result;
  };

  try {
    const { result, attempts } = await withRetry(postToFacebook, 3, (error) => !isTokenExpiredError(error));
    const postId = result.id || result.post_id;

    return {
      success: true,
      platform: 'facebook',
      postId,
      postUrl: `https://www.facebook.com/${postId}`,
      retryCount: attempts - 1,
    };
  } catch (error) {
    const isExpired = isTokenExpiredError(error);
    return {
      success: false,
      platform: 'facebook',
      error: isExpired
        ? 'Facebook access token expired. Please reconnect your Facebook page.'
        : (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

// Main function to publish to multiple platforms
export async function publishToMultiplePlatforms(
  content: PublishContent,
  platforms: Platform[],
  credentials: PlatformCredentials,
  businessName: string
): Promise<PublishResult[]> {
  // Publish to all platforms concurrently
  const promises = platforms.map(async (platform) => {
    switch (platform) {
      case 'telegram':
        return publishToTelegram(content, credentials, businessName);
      case 'vk':
        return publishToVk(content, credentials, businessName);
      case 'instagram':
        return publishToInstagram(content, credentials, businessName);
      case 'facebook':
        return publishToFacebook(content, credentials, businessName);
      default:
        return {
          success: false,
          platform,
          error: `Platform ${platform} not supported`,
        };
    }
  });

  return Promise.all(promises);
}

// Validate platform credentials
export function validateCredentials(platform: Platform, credentials: PlatformCredentials): { valid: boolean; error?: string } {
  switch (platform) {
    case 'telegram':
      if (!credentials.telegramBotToken) {
        return { valid: false, error: 'Telegram Bot Token is required' };
      }
      if (!credentials.telegramChannelId) {
        return { valid: false, error: 'Telegram Channel ID is required' };
      }
      return { valid: true };

    case 'vk':
      if (!credentials.vkAccessToken) {
        return { valid: false, error: 'VK Access Token is required' };
      }
      if (!credentials.vkGroupId) {
        return { valid: false, error: 'VK Group ID is required' };
      }
      return { valid: true };

    case 'instagram':
      if (!credentials.instagramAccessToken) {
        return { valid: false, error: 'Instagram Access Token is required' };
      }
      if (!credentials.instagramBusinessAccountId) {
        return { valid: false, error: 'Instagram Business Account ID is required' };
      }
      return { valid: true };

    case 'facebook':
      if (!credentials.facebookAccessToken) {
        return { valid: false, error: 'Facebook Access Token is required' };
      }
      if (!credentials.facebookPageId) {
        return { valid: false, error: 'Facebook Page ID is required' };
      }
      return { valid: true };

    default:
      return { valid: false, error: `Platform ${platform} not supported` };
  }
}

// Test connection to a platform
export async function testConnection(platform: Platform, credentials: PlatformCredentials): Promise<{ success: boolean; error?: string; info?: string }> {
  const validation = validateCredentials(platform, credentials);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  switch (platform) {
    case 'telegram': {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${credentials.telegramBotToken}/getMe`
        );
        const result = await response.json();

        if (!result.ok) {
          return { success: false, error: 'Invalid bot token' };
        }

        const chatResponse = await fetch(
          `https://api.telegram.org/bot${credentials.telegramBotToken}/getChat?chat_id=${credentials.telegramChannelId}`
        );
        const chatResult = await chatResponse.json();

        if (!chatResult.ok) {
          return { success: false, error: 'Cannot access channel. Make sure the bot is an admin.' };
        }

        return {
          success: true,
          info: `Connected to: ${chatResult.result.title || chatResult.result.username}`,
        };
      } catch {
        return { success: false, error: 'Failed to connect to Telegram API' };
      }
    }

    case 'vk': {
      try {
        const params = new URLSearchParams({
          access_token: credentials.vkAccessToken!,
          group_id: credentials.vkGroupId!,
          v: '5.131',
        });

        const response = await fetch(`https://api.vk.com/method/groups.getById?${params}`);
        const result = await response.json();

        if (result.error) {
          if (result.error.error_code === 5) {
            return { success: false, error: 'Access token expired or invalid' };
          }
          return { success: false, error: result.error.error_msg };
        }

        const groupName = result.response?.[0]?.name;
        return {
          success: true,
          info: `Connected to: ${groupName}`,
        };
      } catch {
        return { success: false, error: 'Failed to connect to VK API' };
      }
    }

    case 'instagram': {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${credentials.instagramBusinessAccountId}?fields=username&access_token=${credentials.instagramAccessToken}`
        );
        const result = await response.json();

        if (result.error) {
          if (result.error.code === 190 || result.error.code === 463) {
            return { success: false, error: 'Access token expired. Please reconnect your account.' };
          }
          return { success: false, error: result.error.message };
        }

        return {
          success: true,
          info: `Connected to: @${result.username}`,
        };
      } catch {
        return { success: false, error: 'Failed to connect to Instagram API' };
      }
    }

    case 'facebook': {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${credentials.facebookPageId}?fields=name,access_token&access_token=${credentials.facebookAccessToken}`
        );
        const result = await response.json();

        if (result.error) {
          if (result.error.code === 190 || result.error.code === 463) {
            return { success: false, error: 'Access token expired. Please reconnect your page.' };
          }
          return { success: false, error: result.error.message };
        }

        return {
          success: true,
          info: `Connected to: ${result.name}`,
        };
      } catch {
        return { success: false, error: 'Failed to connect to Facebook API' };
      }
    }

    default:
      return { success: false, error: `Platform ${platform} not supported` };
  }
}

// Validate Instagram token and get expiration info
export async function validateInstagramToken(accessToken: string): Promise<{
  valid: boolean;
  expiresAt?: Date;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    );
    const result = await response.json();

    if (result.error) {
      return { valid: false, error: result.error.message };
    }

    const data = result.data;
    if (!data.is_valid) {
      return { valid: false, error: 'Token is invalid' };
    }

    return {
      valid: true,
      expiresAt: data.expires_at ? new Date(data.expires_at * 1000) : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate token',
    };
  }
}

// Exchange short-lived token for long-lived token (Instagram/Facebook)
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
): Promise<{ accessToken?: string; expiresIn?: number; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${shortLivedToken}`
    );

    const result = await response.json();

    if (result.error) {
      return { error: result.error.message };
    }

    return {
      accessToken: result.access_token,
      expiresIn: result.expires_in, // in seconds (usually 60 days)
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to exchange token',
    };
  }
}
