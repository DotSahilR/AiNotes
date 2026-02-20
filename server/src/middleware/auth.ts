import { createClerkClient, verifyToken } from '@clerk/backend';
import { createMiddleware } from 'hono/factory';

import { env } from '../lib/env.js';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export type AuthVariables = {
  userId: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ message: 'Not authorized' }, 401);
  }

  try {
    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
    const userId = payload.sub;
    if (!userId) {
      return c.json({ message: 'Not authorized' }, 401);
    }

    await clerkClient.users.getUser(userId);
    c.set('userId', userId);
    await next();
  } catch {
    return c.json({ message: 'Not authorized' }, 401);
  }
});
