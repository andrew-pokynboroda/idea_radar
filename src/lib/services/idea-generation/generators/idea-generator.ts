import { IdeaResult, PainPointAnalysis, ExistingIdea } from '../types';
import { openaiClient } from '@/lib/clients/open_router';

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
   - If yes, how can we improve that idea? (Use the EXACT name from the list above)
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

6. MVP DEFINITION
   - What is the minimal scope to validate this idea?
   - What are the essential components needed?
   - What is a realistic implementation timeline?

Respond in JSON format:
{
  "action": "NEW" | "IMPROVE",
  "target_idea_name": "EXACT name of existing idea if improving (must match list above), null otherwise",
  "name": "Short, catchy product name (if NEW, create new name; if IMPROVE, use target_idea_name)",
  "pitch": "One sentence value proposition",
  "key_pain_insight": "The core insight about the pain point",
  "score": number (0-100, based on novelty, market size, feasibility, investment needs),
  "painpoints": ["list", "of", "specific", "pain", "points"],
  "insights": ["key", "user", "observations", "and", "insights"],
  "competitors": ["specific competitor 1", "specific competitor 2", "etc"],
  "mvp": "Multiline MVP definition with 3 sections: 
    1. Scope & components
    2. Implamentation time estimate
    3. MVP cost estimate"
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
            const response = await openaiClient.chat.send({
                model: 'google/gemini-2.5-flash', // More capable model for idea generation
                messages: [
                    {
                        role: 'user',
                        content: prompt + '\n\n' + JSON.stringify(contextData, null, 2),
                    },
                ],
                responseFormat: { type: 'json_object' },
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            const rawResult = JSON.parse((typeof content === 'string' ? content : '') || '{}');

            // Map target_idea_name to target_idea_id
            let target_idea_id: number | undefined = undefined;
            if (rawResult.action === 'IMPROVE' && rawResult.target_idea_name) {
                const matchingIdea = existingIdeas.find(
                    idea => idea.name === rawResult.target_idea_name
                );
                if (matchingIdea) {
                    target_idea_id = matchingIdea.id;
                } else {
                    console.warn(`[IdeaGenerator] Could not find idea with name "${rawResult.target_idea_name}". Creating new idea instead.`);
                    rawResult.action = 'NEW';
                }
            }

            const result: IdeaResult = {
                ...rawResult,
                target_idea_id,
            };

            return result;
        } catch (error) {
            console.error('[IdeaGenerator] Error:', error);
            throw error;
        }
    }
}
