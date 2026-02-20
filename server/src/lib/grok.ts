import { env } from './env.js';

interface GrokChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function askGrok(prompt: string): Promise<string> {
  if (!env.AI_API_KEY) {
    throw new Error('AI API key is not configured');
  }

  const response = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  });

  const data = (await response.json()) as GrokChatResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `AI service unavailable (${response.status})`);
  }

  return data.choices?.[0]?.message?.content?.trim() || '';
}
