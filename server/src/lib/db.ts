import mongoose from 'mongoose';

import { env } from './env.js';

let isConnected = false;

export async function connectDb(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(env.MONGODB_URI);
  isConnected = true;
  console.log('MongoDB connected');
}
