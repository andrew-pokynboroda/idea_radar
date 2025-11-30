import { IdeaResult, PainPointAnalysis, ExistingIdea } from '../types';
import { openaiClient } from '@/lib/clients/openai';

const IDEA_GENERATION_PROMPT = (themeName: string, existingIdeas: string[]) => `You are an expert SaaS product strategist and market analyst.

THEME: ${themeName}

CONTEXT - Existing ideas in this theme:
${existingIdeas.length > 0 ? existingIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n') : 'No existing ideas yet.'}

TASK: Based on the pain point identified, either generate a NEW SaaS idea or suggest improvements to an EXISTING idea.

Analyze using chain of thought:

1. PAIN POINT ANALYSIS
   - What is the core problem?
   - Who experiences this problem?
   - How frequently does it occur?

2. SOLUTION ASSESSMENT
   - Does this pain point match any existing ideas above?
   - If yes, how can we improve that idea?
   - If no, what new solution would address this?

3. MARKET EVALUATION
   - Novelty: How unique is this idea? (Consider existing solutions)
   - Market size: How many potential users?
   - Willingness to pay: Would people pay for this?

4. FEASIBILITY
   - MVP complexity: How hard to build a minimum viable product?
   - Initial investment needed: Cost estimate
   - Time to market: How quickly could this be built?

5. COMPETITIVE LANDSCAPE
   - What existing solutions are there (be specific)?
   - What are the gaps in current solutions?

Respond in JSON format:
{
  "action": "NEW" | "IMPROVE",
  "target_idea_id": "id if improving existing idea, null otherwise",
  "name": "Short, catchy product name",
  "pitch": "One sentence value proposition",
  "key_pain_insight": "The core insight about the pain point",
  "score": number (0-100, based on novelty, market size, feasibility, investment needs),
  "painpoints": ["list", "of", "specific", "pain", "points"],
  "insights": ["key", "user", "observations", "and", "insights"],
  "competitors": ["specific competitor 1", "specific competitor 2", "etc"]
}

PAIN POINT DATA:
`;

/**
 * Service for generating or improving SaaS ideas based on pain points
 */
export class IdeaGenerator {
    /**
     * Generate or improve an idea based on a pain point
     * @param themeName The theme name
     * @param existingIdeas Existing ideas in this theme
     * @param painPointContent The original content containing the pain point
     * @param painPointAnalysis The pain point analysis result
     * @returns Idea generation result
     */
    async generate(
        themeName: string,
        existingIdeas: ExistingIdea[],
        painPointContent: string,
        painPointAnalysis: PainPointAnalysis
    ): Promise<IdeaResult> {
        const existingIdeasText = existingIdeas.map(
            idea => `${idea.name}: ${idea.pitch}`
        );

        const prompt = IDEA_GENERATION_PROMPT(themeName, existingIdeasText);

        const contextData = {
            pain_point: painPointAnalysis.explanation,
            relevance_score: painPointAnalysis.relevance,
            original_content: painPointContent.substring(0, 1000), // Limit length
        };

        try {
            const response = await openaiClient.chat.completions.create({
                model: 'openai/gpt-4o', // More capable model for idea generation
                messages: [
                    {
                        role: 'user',
                        content: prompt + '\n\n' + JSON.stringify(contextData, null, 2),
                    },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });

            const result = JSON.parse(response.choices[0].message.content || '{}');
            return result as IdeaResult;
        } catch (error) {
            console.error('[IdeaGenerator] Error:', error);
            throw error;
        }
    }
}
