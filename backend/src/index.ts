import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import auth from './routes/auth';
import cities from './routes/cities';
import events from './routes/events';
import businesses from './routes/businesses';
import promotions from './routes/promotions';
import admin from './routes/admin';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'https://afisha.kz',
    'https://www.afisha.kz',
    'https://jezkazgan-connect-production.up.railway.app',
    'https://jezkazgan-connect.up.railway.app',
    // Allow any railway.app subdomain for preview deployments
    /https:\/\/.*\.up\.railway\.app$/,
  ],
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400, // 24 hours
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Afisha.kz API',
    version: '1.0.0',
    status: 'ok',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/auth', auth);
app.route('/cities', cities);
app.route('/events', events);
app.route('/businesses', businesses);
app.route('/promotions', promotions);
app.route('/admin', admin);

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

console.log(`🚀 Server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
