import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { connectDb } from './lib/db.js';
import { env } from './lib/env.js';
import aiRouter from './routes/ai.js';
import notesRouter from './routes/notes.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: env.CLIENT_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

app.get('/health', (c) => c.json({ ok: true }));
app.route('/notes', notesRouter);
app.route('/ai', aiRouter);

const port = Number(env.PORT);

await connectDb();
serve({ fetch: app.fetch, port });
console.log(`API running on port ${port}`);
