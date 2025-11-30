import { PainPointAnalysis } from '../types';
import { openaiClient } from '@/lib/clients/openai';

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
3. Would a SaaS solution make sense here?
4. How urgent/important does this seem?

Content:
`;

/**
 * Service for analyzing content to identify pain points using LLM
 */
export class PainPointAnalyzer {
    /**
     * Analyze content for pain points
     * @param content The content to analyze
     * @returns Pain point analysis result
     */
    async analyze(content: string): Promise<PainPointAnalysis> {
        try {
            const response = await openaiClient.chat.completions.create({
                model: 'openai/gpt-4o-mini', // Fast and cheap for initial filtering
                messages: [
                    {
                        role: 'user',
                        content: PAIN_POINT_PROMPT + '\n\n' + content,
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });

            const result = JSON.parse(response.choices[0].message.content || '{}');
            return result as PainPointAnalysis;
        } catch (error) {
            console.error('[PainPointAnalyzer] Error:', error);
            return { hasPainPoint: false };
        }
    }

    /**
     * Check if a pain point is significant enough to process
     * @param analysis The pain point analysis
     * @param threshold Minimum relevance score (default: 5)
     * @returns True if pain point is significant
     */
    isSignificant(analysis: PainPointAnalysis, threshold: number = 5): boolean {
        return analysis.hasPainPoint && (analysis.relevance || 0) >= threshold;
    }
}
