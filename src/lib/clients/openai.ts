import OpenAI from 'openai';

// Singleton OpenAI client configured for OpenRouter
export const openaiClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
});
