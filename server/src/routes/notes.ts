import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import { Note } from '../models/Note.js';

const createSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional()
});

const updateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  aiOutputs: z
    .array(
      z.object({
        originalInput: z.string(),
        feature: z.string(),
        output: z.string(),
        createdAt: z.string().optional()
      })
    )
    .optional()
});

const appendAiOutputSchema = z.object({
  originalInput: z.string().min(1),
  feature: z.string().min(1),
  output: z.string().min(1)
});

const notesRouter = new Hono<{ Variables: AuthVariables }>();

notesRouter.use('*', authMiddleware);

const normalizeNote = (note: Record<string, unknown>): Record<string, unknown> => ({
  ...note,
  tags: Array.isArray(note.tags) ? note.tags : [],
  aiOutputs: Array.isArray(note.aiOutputs) ? note.aiOutputs : []
});

notesRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const search = c.req.query('search')?.trim();

  const query: { userId: string; $or?: Array<Record<string, unknown>> } = { userId };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
  }

  const notes = await Note.find(query).sort({ updatedAt: -1 });
  return c.json(notes.map((note) => normalizeNote(note.toObject())));
});

notesRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const note = await Note.findOne({ _id: id, userId });

  if (!note) {
    return c.json({ message: 'Note not found' }, 404);
  }

  return c.json(normalizeNote(note.toObject()));
});

notesRouter.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  const note = await Note.create({
    userId,
    title: body.title || 'Untitled',
    content: body.content || ''
  });

  return c.json(normalizeNote(note.toObject()), 201);
});

notesRouter.put('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const note = await Note.findOneAndUpdate({ _id: id, userId }, { $set: body }, { new: true });

  if (!note) {
    return c.json({ message: 'Note not found' }, 404);
  }

  return c.json(normalizeNote(note.toObject()));
});

notesRouter.post('/:id/ai-output', zValidator('json', appendAiOutputSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    return c.json({ message: 'Note not found' }, 404);
  }

  note.aiOutputs.unshift({
    originalInput: body.originalInput,
    feature: body.feature,
    output: body.output,
    createdAt: new Date()
  });

  await note.save();
  return c.json(normalizeNote(note.toObject()), 201);
});

notesRouter.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const deleted = await Note.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    return c.json({ message: 'Note not found' }, 404);
  }

  return c.json({ message: 'Note deleted' });
});

export default notesRouter;
