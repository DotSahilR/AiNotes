import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { askGrok } from '../lib/grok.js';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';

const summarizeSchema = z.object({ content: z.string().min(50) });
const improveSchema = z.object({ content: z.string().min(10) });
const tagsSchema = z.object({ title: z.string(), content: z.string().min(10) });
const processSchema = z.object({
  content: z.string().min(5),
  feature: z.enum([
    'summarize',
    'rewrite',
    'explain',
    'organize',
    'translate',
    'improve',
    'change_format',
    'main_theme',
    'detect_tone',
    'key_points',
    'answer_question'
  ]),
  language: z.string().optional(),
  format: z.string().optional(),
  question: z.string().optional()
});

const aiRouter = new Hono<{ Variables: AuthVariables }>();

aiRouter.use('*', authMiddleware);

aiRouter.post('/summarize', zValidator('json', summarizeSchema), async (c) => {
  try {
    const { content } = c.req.valid('json');
    const prompt = `Summarize this note in 2-3 concise sentences. Return only the summary text, no labels:\n\n${content}`;
    const summary = await askGrok(prompt);
    return c.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    console.error('AI summarize error:', message);
    return c.json({ message }, 503);
  }
});

aiRouter.post('/improve', zValidator('json', improveSchema), async (c) => {
  try {
    const { content } = c.req.valid('json');
    const prompt = `Improve grammar, clarity and flow of this text. Return only improved text:\n\n${content}`;
    const improved = await askGrok(prompt);
    return c.json({ improved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    console.error('AI improve error:', message);
    return c.json({ message }, 503);
  }
});

aiRouter.post('/tags', zValidator('json', tagsSchema), async (c) => {
  try {
    const { title, content } = c.req.valid('json');
    const prompt = `Generate 3 to 5 relevant tags for this note. Return only valid JSON array of lowercase strings.\n\nTitle: ${title}\nContent: ${content}`;

    const raw = await askGrok(prompt);
    let tags: string[] = [];

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        tags = parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      tags = [];
    }

    return c.json({ tags });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    console.error('AI tags error:', message);
    return c.json({ message }, 503);
  }
});

aiRouter.post('/process', zValidator('json', processSchema), async (c) => {
  try {
    const { content, feature, language, format, question } = c.req.valid('json');

    if (feature === 'translate' && (!language || language.trim().length < 2)) {
      return c.json({ message: 'Target language is required for translation' }, 400);
    }

    if (feature === 'change_format' && (!format || format.trim().length < 2)) {
      return c.json({ message: 'Target format is required for change_format' }, 400);
    }

    if (feature === 'answer_question' && (!question || question.trim().length < 2)) {
      return c.json({ message: 'Question is required for answer_question' }, 400);
    }

    const promptByFeature: Record<typeof feature, string> = {
      summarize: `Summarize this content in 2-3 concise sentences. Return only summary text:\n\n${content}`,
      rewrite: `Rewrite this content clearly while preserving meaning. Return only rewritten text:\n\n${content}`,
      explain: `Explain this content clearly in simple terms. Return only explanation:\n\n${content}`,
      organize: `Organize this content into clear sections with short headings and bullet points. Return only organized output:\n\n${content}`,
      translate: `Translate this content to ${language}. Return only translated text:\n\n${content}`,
      improve: `Improve grammar, clarity, vocabulary, and flow of this content. Return only improved text:\n\n${content}`,
      change_format: `Convert this content into ${format}. Return only converted output:\n\n${content}`,
      main_theme: `Identify the main theme in 1-2 concise sentences. Return only result:\n\n${content}`,
      detect_tone: `Detect the tone (formal, emotional, persuasive, etc.) and justify briefly. Return only result:\n\n${content}`,
      key_points: `Extract key points as concise bullet points. Return only bullet list:\n\n${content}`,
      answer_question: `Using only this content, answer the question.\nQuestion: ${question}\n\nContent:\n${content}\n\nIf not answerable, say: "The content does not contain enough information."`
    };

    const output = await askGrok(promptByFeature[feature]);
    return c.json({ feature, output });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI service unavailable';
    console.error('AI process error:', message);
    return c.json({ message }, 503);
  }
});

export default aiRouter;
