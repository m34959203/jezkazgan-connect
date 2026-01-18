// Upload routes for image management
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import { uploadRateLimit } from '../middleware/rateLimit';
import { getUploadParams, validateImageUrl, transformCloudinaryUrl } from '../services/cloudinary';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// GET /upload/config - Get Cloudinary upload configuration
// Used by frontend to upload directly to Cloudinary
app.get('/config', authMiddleware, uploadRateLimit, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Determine folder based on upload context (could be enhanced with query params)
  const folder = c.req.query('folder') || 'afisha/general';

  const params = getUploadParams({ folder });

  if (!params.cloudName) {
    return c.json(
      {
        error: 'Image upload not configured',
        message: 'Загрузка изображений временно недоступна',
      },
      503
    );
  }

  return c.json({
    url: params.url,
    cloudName: params.cloudName,
    uploadPreset: params.uploadPreset,
    folder: params.folder,
    timestamp: params.timestamp,
    // Only include signature if signed upload is configured
    ...(params.signature && {
      signature: params.signature,
      apiKey: params.apiKey,
    }),
  });
});

// Validation schema for URL validation
const validateUrlSchema = z.object({
  url: z.string().url(),
});

// POST /upload/validate - Validate an image URL
app.post('/validate', authMiddleware, zValidator('json', validateUrlSchema), async (c) => {
  const { url } = c.req.valid('json');

  const isValid = validateImageUrl(url);

  if (!isValid) {
    return c.json({
      valid: false,
      error: 'Invalid image URL. Please use a direct link to an image.',
    });
  }

  return c.json({ valid: true, url });
});

// Transform schema
const transformSchema = z.object({
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
  crop: z.enum(['fill', 'fit', 'scale', 'thumb']).optional(),
  quality: z.union([z.number(), z.literal('auto')]).optional(),
  format: z.enum(['auto', 'webp', 'jpg', 'png']).optional(),
});

// POST /upload/transform - Transform a Cloudinary URL with options
app.post('/transform', zValidator('json', transformSchema), async (c) => {
  const { url, ...options } = c.req.valid('json');

  const transformedUrl = transformCloudinaryUrl(url, options);

  return c.json({ url: transformedUrl });
});

// GET /upload/presets - Get available upload presets for different contexts
app.get('/presets', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Define upload presets for different content types
  const presets = {
    event: {
      folder: 'afisha/events',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedSize: { width: 1200, height: 675 }, // 16:9
    },
    promotion: {
      folder: 'afisha/promotions',
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedSize: { width: 1200, height: 675 },
    },
    businessLogo: {
      folder: 'afisha/businesses/logos',
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      recommendedSize: { width: 400, height: 400 }, // 1:1
    },
    businessCover: {
      folder: 'afisha/businesses/covers',
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedSize: { width: 1200, height: 400 }, // 3:1
    },
    avatar: {
      folder: 'afisha/avatars',
      maxSize: 2 * 1024 * 1024,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedSize: { width: 200, height: 200 },
    },
    banner: {
      folder: 'afisha/banners',
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      recommendedSize: { width: 1920, height: 600 },
    },
  };

  return c.json({ presets });
});

export default app;
