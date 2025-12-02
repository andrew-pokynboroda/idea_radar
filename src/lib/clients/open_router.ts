import { OpenRouter } from '@openrouter/sdk';
import { captureError } from '@/lib/utils';

export class AIClient {
    private client: OpenRouter;
    private defaultModel = 'google/gemini-2.5-flash';

    constructor() {
        this.client = new OpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY!,
        });
    }

    async generateJSON<T>(prompt: string, context: any, model?: string): Promise<T> {
        try {
            const response = await this.client.chat.send({
                model: model || this.defaultModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt + '\n\n' + JSON.stringify(context, null, 2),
                    },
                ],
                responseFormat: { type: 'json_object' },
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            return JSON.parse((typeof content === 'string' ? content : '') || '{}') as T;
        } catch (error) {
            captureError(error, { context: 'AIClient.generateJSON', model });
            throw error;
        }
    }
}

export const aiClient = new AIClient();
