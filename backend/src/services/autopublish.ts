// Social Media Auto-Publish Service
// Business Premium feature for automatic posting to social networks

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
}

export interface PublishResult {
  success: boolean;
  platform: Platform;
  postId?: string;
  postUrl?: string;
  error?: string;
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

// Publish to Telegram channel
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

  try {
    let response;

    if (content.imageUrl) {
      // Send photo with caption
      response = await fetch(`${apiUrl}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.telegramChannelId,
          photo: content.imageUrl,
          caption: message,
          parse_mode: 'MarkdownV2',
        }),
      });
    } else if (content.videoUrl) {
      // Send video with caption
      response = await fetch(`${apiUrl}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.telegramChannelId,
          video: content.videoUrl,
          caption: message,
          parse_mode: 'MarkdownV2',
        }),
      });
    } else {
      // Send text message
      response = await fetch(`${apiUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: credentials.telegramChannelId,
          text: message,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      });
    }

    const result = await response.json();

    if (!result.ok) {
      return {
        success: false,
        platform: 'telegram',
        error: result.description || 'Failed to publish to Telegram',
      };
    }

    const messageId = result.result?.message_id;
    const chatId = credentials.telegramChannelId.replace('@', '');

    return {
      success: true,
      platform: 'telegram',
      postId: String(messageId),
      postUrl: `https://t.me/${chatId}/${messageId}`,
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

// Publish to VK group
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

  try {
    const params = new URLSearchParams({
      access_token: credentials.vkAccessToken,
      owner_id: `-${credentials.vkGroupId}`, // Negative ID for group
      message,
      v: '5.131',
    });

    // Add image attachment if available
    if (content.imageUrl) {
      // Note: For production, you'd need to upload the image to VK first
      // This is a simplified version that just posts the link
      params.append('attachments', content.imageUrl);
    }

    const response = await fetch(`https://api.vk.com/method/wall.post?${params}`, {
      method: 'POST',
    });

    const result = await response.json();

    if (result.error) {
      return {
        success: false,
        platform: 'vk',
        error: result.error.error_msg || 'VK API error',
      };
    }

    const postId = result.response?.post_id;

    return {
      success: true,
      platform: 'vk',
      postId: String(postId),
      postUrl: `https://vk.com/wall-${credentials.vkGroupId}_${postId}`,
    };
  } catch (error) {
    return {
      success: false,
      platform: 'vk',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Publish to Instagram (via Facebook Graph API)
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

  // Format caption for Instagram
  const caption = [
    content.contentType === 'event' ? '🎉' : '🔥',
    content.title,
    '',
    content.description?.substring(0, 1000) || '',
    '',
    `🏪 ${businessName}`,
    '',
    '#жезказган #zhezkazgan #kazakhstan #казахстан',
  ].join('\n');

  try {
    // Step 1: Create media container
    const createMediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.instagramBusinessAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: content.imageUrl,
          caption,
          access_token: credentials.instagramAccessToken,
        }),
      }
    );

    const createMediaResult = await createMediaResponse.json();

    if (createMediaResult.error) {
      return {
        success: false,
        platform: 'instagram',
        error: createMediaResult.error.message || 'Failed to create media container',
      };
    }

    const containerId = createMediaResult.id;

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.instagramBusinessAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: credentials.instagramAccessToken,
        }),
      }
    );

    const publishResult = await publishResponse.json();

    if (publishResult.error) {
      return {
        success: false,
        platform: 'instagram',
        error: publishResult.error.message || 'Failed to publish to Instagram',
      };
    }

    return {
      success: true,
      platform: 'instagram',
      postId: publishResult.id,
      postUrl: `https://www.instagram.com/p/${publishResult.id}/`,
    };
  } catch (error) {
    return {
      success: false,
      platform: 'instagram',
      error: error instanceof Error ? error.message : 'Unknown error',
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
  const results: PublishResult[] = [];

  for (const platform of platforms) {
    let result: PublishResult;

    switch (platform) {
      case 'telegram':
        result = await publishToTelegram(content, credentials, businessName);
        break;
      case 'vk':
        result = await publishToVk(content, credentials, businessName);
        break;
      case 'instagram':
        result = await publishToInstagram(content, credentials, businessName);
        break;
      default:
        result = {
          success: false,
          platform,
          error: `Platform ${platform} not supported`,
        };
    }

    results.push(result);
  }

  return results;
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

        // Try to get chat info
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

    default:
      return { success: false, error: `Platform ${platform} not supported` };
  }
}
