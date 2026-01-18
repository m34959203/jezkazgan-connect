// Cloudinary integration service
// Uses Cloudinary unsigned upload for simplicity (no server-side SDK needed)
// Configuration is done via environment variables

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Get Cloudinary config from environment
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'afisha_unsigned';
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return { cloudName, uploadPreset, apiKey, apiSecret };
}

// Generate upload signature for signed uploads (more secure)
export function generateUploadSignature(params: {
  timestamp: number;
  uploadPreset?: string;
  folder?: string;
}): string {
  const config = getCloudinaryConfig();
  if (!config.apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET not configured');
  }

  // Sort parameters alphabetically and create signature string
  const sortedParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  // Create SHA-1 signature
  const crypto = require('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + config.apiSecret)
    .digest('hex');

  return signature;
}

// Generate upload URL for client-side uploads
export function getUploadUrl(): string {
  const config = getCloudinaryConfig();
  return `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
}

// Generate upload parameters for client
export function getUploadParams(options?: {
  folder?: string;
  transformation?: string;
}): {
  url: string;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  timestamp: number;
  signature?: string;
  apiKey?: string;
} {
  const config = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  const params: ReturnType<typeof getUploadParams> = {
    url: getUploadUrl(),
    cloudName: config.cloudName,
    uploadPreset: config.uploadPreset,
    folder: options?.folder || 'afisha',
    timestamp,
  };

  // If API key and secret are available, generate signature for signed upload
  if (config.apiKey && config.apiSecret) {
    params.signature = generateUploadSignature({
      timestamp,
      uploadPreset: config.uploadPreset,
      folder: params.folder,
    });
    params.apiKey = config.apiKey;
  }

  return params;
}

// Validate image URL (check if it's a valid Cloudinary or external image URL)
export function validateImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    // Allow Cloudinary URLs
    if (parsed.hostname.includes('cloudinary.com')) return true;
    // Allow common image hosting services
    if (parsed.hostname.includes('unsplash.com')) return true;
    if (parsed.hostname.includes('images.unsplash.com')) return true;
    if (parsed.hostname.includes('imgur.com')) return true;
    if (parsed.hostname.includes('i.imgur.com')) return true;
    // Allow any HTTPS URL (basic validation)
    if (parsed.protocol === 'https:') return true;

    return false;
  } catch {
    return false;
  }
}

// Transform Cloudinary URL with options
export function transformCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  if (!url.includes('cloudinary.com')) return url;

  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  if (transformations.length === 0) return url;

  // Insert transformations into URL
  const transformation = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformation}/`);
}

// Delete image from Cloudinary (requires API key and secret)
export async function deleteImage(publicId: string): Promise<boolean> {
  const config = getCloudinaryConfig();

  if (!config.apiKey || !config.apiSecret) {
    console.warn('Cloudinary API credentials not configured, skipping delete');
    return false;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = require('crypto');
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`)
    .digest('hex');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          api_key: config.apiKey,
          signature,
        }),
      }
    );

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return false;
  }
}
