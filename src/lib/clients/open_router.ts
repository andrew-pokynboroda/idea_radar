import { OpenRouter } from '@openrouter/sdk';

// Singleton OpenRouter client
export const openaiClient = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});
