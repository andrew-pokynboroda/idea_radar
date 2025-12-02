import { PainPointAnalysis } from '../types';
import { openaiClient } from '@/lib/clients/open_router';

const PAIN_POINT_PROMPT = `You are an expert at identifying business pain points in social media discussions.

Analyze the following content and determine if it contains a genuine pain point that could be solved by a SaaS product.

A valid pain point is:
- A real problem or frustration expressed by users
- Something that causes inefficiency, wasted time, or money
- A gap in existing solutions
- A repetitive manual task that could be automated

Respond in JSON format:
{
  "hasPainPoint": boolean,
  "explanation": "Brief explanation of the pain point if found",
  "relevance": number (1-10, how strong the pain point is)
}

Think step by step:
1. What problem is being discussed?
2. Is this a real, actionable problem or just venting?
3. Is there any existing solutions that perfectly solve this problem?
4. Would a SaaS solution make sense here?
5. How urgent/important does this seem?

Content:
`;

const ACCEPTABLE_RELEVANCE_THRESHOLD = 7;

export class PainPointAnalyzer {
    async analyze(content: string): Promise<PainPointAnalysis | null> {
        try {
            const response = await openaiClient.chat.send({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                    {
                        role: 'user',
                        content: PAIN_POINT_PROMPT + '\n\n' + content,
                    },
                ],
                responseFormat: { type: 'json_object' },
                temperature: 0.0,
            });

            const responseContent = response.choices[0].message.content;
            const result = JSON.parse((typeof responseContent === 'string' ? responseContent : '') || '{}') as PainPointAnalysis;

            if (result.relevance && result.relevance > ACCEPTABLE_RELEVANCE_THRESHOLD) {
                return result;
            }
            return null;
        } catch (error) {
            console.error('[PainPointAnalyzer] Error:', error);
            return null;
        }
    }
}
