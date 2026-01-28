import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { runMigrations } from './db/migrate';

import auth from './routes/auth';
import cities from './routes/cities';
import events from './routes/events';
import businesses from './routes/businesses';
import promotions from './routes/promotions';
import admin from './routes/admin';
import team from './routes/team';
import upload from './routes/upload';
import favorites from './routes/favorites';
import ai from './routes/ai';
import autopublish from './routes/autopublish';
import cashback from './routes/cashback';
import referral from './routes/referral';
import { apiRateLimit, authRateLimit, securityCheck } from './middleware/rateLimit';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());

// CORS configuration with dynamic origin checking
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://afisha.kz',
  'https://www.afisha.kz',
  'https://jezkazgan-connect-production.up.railway.app',
  'https://jezkazgan-connect.up.railway.app',
];

app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return allowedOrigins[0];
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) return origin;
    // Allow any railway.app subdomain for preview deployments
    if (/^https:\/\/.*\.up\.railway\.app$/.test(origin)) return origin;
    // Deny other origins
    return allowedOrigins[0];
  },
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400, // 24 hours
}));

// Health check with version info
const BUILD_VERSION = '2.5.0-premium-cashback';
const BUILD_DATE = '2026-01-21';

app.get('/', (c) => {
  return c.json({
    name: 'Afisha.kz API',
    version: BUILD_VERSION,
    buildDate: BUILD_DATE,
    status: 'ok',
    authType: 'JWT',
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: BUILD_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Security check for blocked IPs
app.use('*', securityCheck);

// Rate limiting for API endpoints
app.use('/api/*', apiRateLimit);

// Stricter rate limiting for auth endpoints
app.use('/auth/*', authRateLimit);

// Routes
app.route('/auth', auth);
app.route('/cities', cities);
app.route('/events', events);
app.route('/businesses', businesses);
app.route('/promotions', promotions);
app.route('/admin', admin);
app.route('/team', team);
app.route('/upload', upload);
app.route('/favorites', favorites);
// Business Premium routes
app.route('/ai', ai);
app.route('/autopublish', autopublish);
// User Premium routes (Cashback & Referral)
app.route('/cashback', cashback);
app.route('/referral', referral);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Start server
const port = Number(process.env.PORT) || 3000;

// Run migrations before starting server
runMigrations().then(() => {
  console.log(`🚀 Server starting on port ${port}`);

  serve({
    fetch: app.fetch,
    port,
  });
}).catch((err) => {
  console.error('Failed to run migrations:', err);
  // Start server anyway
  serve({
    fetch: app.fetch,
    port,
  });
});

export default app;
