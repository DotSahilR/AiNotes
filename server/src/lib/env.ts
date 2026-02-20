import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('5001'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional(),
  GROQ_BASE_URL: z.string().url().optional(),
  GROK_API_KEY: z.string().optional(),
  GROK_MODEL: z.string().optional(),
  GROK_BASE_URL: z.string().url().optional()
});

const parsed = envSchema.parse(process.env);

const apiKey = parsed.GROQ_API_KEY || parsed.GROK_API_KEY || '';
const inferredGroq = apiKey.startsWith('gsk_');

export const env = {
  ...parsed,
  AI_API_KEY: apiKey,
  AI_BASE_URL: inferredGroq
    ? parsed.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
    : parsed.GROK_BASE_URL || 'https://api.x.ai/v1',
  AI_MODEL: inferredGroq
    ? parsed.GROQ_MODEL || 'llama-3.3-70b-versatile'
    : parsed.GROK_MODEL || 'grok-2-latest'
};
