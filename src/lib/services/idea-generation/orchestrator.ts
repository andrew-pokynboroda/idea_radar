import { SourceAdapter } from './adapters/source-adapter';
import { PainPointAnalyzer } from './analyzers/pain-point-analyzer';
import { IdeaGenerator } from './generators/idea-generator';
import { createAdminClient } from '@/lib/clients/supabase';
import { Theme, GenerationResults, ExistingIdea } from './types';

const supabaseClient = createAdminClient();

export interface OrchestratorOptions {
    sourceAdapters: SourceAdapter[];
    painPointAnalyzer: PainPointAnalyzer;
    ideaGenerator: IdeaGenerator;
    processingDelay?: number;
}

export class IdeaGenerationOrchestrator {
    private sourceAdapters: SourceAdapter[];
    private painPointAnalyzer: PainPointAnalyzer;
    private ideaGenerator: IdeaGenerator;
    private processingDelay: number;

    constructor(options: OrchestratorOptions) {
        this.sourceAdapters = options.sourceAdapters;
        this.painPointAnalyzer = options.painPointAnalyzer;
        this.ideaGenerator = options.ideaGenerator;
        this.processingDelay = options.processingDelay ?? 1000;
    }

    async execute(): Promise<GenerationResults> {
        console.log('[Orchestrator] Starting idea generation job...');

        const results: GenerationResults = {
            themes_processed: 0,
            ideas_created: 0,
            ideas_updated: 0,
            sources_logged: 0,
            errors: [],
        };

        const { data: themes, error: themesError } = await supabaseClient
            .from('themes')
            .select('id, name, keywords');

        if (themesError) {
            throw new Error(`Failed to fetch themes: ${themesError.message}`);
        }

        if (!themes || themes.length === 0) {
            console.log('[Orchestrator] No themes found');
            return results;
        }

        for (const theme of themes as Theme[]) {
            try {
                await this.processTheme(theme, results);
                results.themes_processed++;
            } catch (error) {
                console.error(`[Orchestrator] Error processing theme ${theme.name}:`, error);
                results.errors.push(`Theme ${theme.name}: ${(error as Error).message}`);
            }
        }

        console.log('[Orchestrator] Job complete:', results);
        return results;
    }

    private async processTheme(theme: Theme, results: GenerationResults): Promise<void> {
        console.log(`[Orchestrator] Processing theme: ${theme.name}`);

        const existingIdeas = await this.fetchExistingIdeas(theme.id);

        for (const adapter of this.sourceAdapters) {
            try {
                const content = await adapter.fetchContent(theme);

                for (const item of content) {
                    try {
                        await this.processContent(theme, item, existingIdeas, results);

                        // Add delay to avoid rate limiting
                        await this.delay(this.processingDelay);
                    } catch (error) {
                        console.error(`[Orchestrator] Error processing ${item.id}:`, error);
                        results.errors.push(`${adapter.name} ${item.id}: ${(error as Error).message}`);
                    }
                }
            } catch (error) {
                console.error(`[Orchestrator] Error with ${adapter.name}:`, error);
                results.errors.push(`${adapter.name}: ${(error as Error).message}`);
            }
        }
    }

    /**
     * Process a single content item
     */
    private async processContent(
        theme: Theme,
        content: { id: string; text: string; url: string; sourceType: string },
        existingIdeas: ExistingIdea[],
        results: GenerationResults
    ): Promise<void> {
        const painPointAnalysis = await this.painPointAnalyzer.analyze(content.text);

        if (!painPointAnalysis) return; // Skip if no significant pain point

        console.log(`[Orchestrator] Found pain point: ${painPointAnalysis.explanation}`);

        // Step 2: Generate or improve idea
        const ideaResult = await this.ideaGenerator.generate(
            theme.name,
            existingIdeas,
            content.text,
            painPointAnalysis
        );

        // Step 3: Persist to database
        if (ideaResult.action === 'NEW') {
            await this.createIdea(theme.id, ideaResult, content, existingIdeas);
            results.ideas_created++;
            console.log(`[Orchestrator] Created new idea: ${ideaResult.name}`);
        } else if (ideaResult.action === 'IMPROVE' && ideaResult.target_idea_id) {
            await this.updateIdea(ideaResult, content);
            results.ideas_updated++;
            console.log(`[Orchestrator] Updated idea: ${ideaResult.name}`);
        }
    }

    private async fetchExistingIdeas(themeId: number): Promise<ExistingIdea[]> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabaseClient
            .from('ideas')
            .select('id, name, pitch, key_pain_insight, score')
            .eq('theme_id', themeId)
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) {
            console.error(`[Orchestrator] Error fetching existing ideas for theme ${themeId}:`, error);
            return [];
        }

        return (data as ExistingIdea[]) || [];
    }

    /**
     * Create a new idea and its source
     */
    private async createIdea(
        themeId: number,
        ideaResult: { name: string; pitch: string; key_pain_insight: string; score: number },
        contentSource: { url: string; sourceType: string },
        existingIdeas: ExistingIdea[] // This parameter is not used here, but kept for consistency with original stub
    ): Promise<void> {
        console.log('[Orchestrator] Creating new idea:', {
            name: ideaResult.name,
            themeId,
            sourceType: contentSource.sourceType,
            sourceUrl: contentSource.url
        });

        const { data: newIdea, error: ideaError } = await (supabaseClient
            .from('ideas') as any)
            .insert({
                theme_id: themeId,
                name: ideaResult.name,
                pitch: ideaResult.pitch,
                key_pain_insight: ideaResult.key_pain_insight,
                score: ideaResult.score,
                mvp: JSON.stringify(ideaResult.mvp),
            })
            .select('id')
            .single();

        if (ideaError) {
            console.error(`[Orchestrator] Error creating idea: ${ideaError.message}`, ideaError);
            throw ideaError;
        }

        console.log('[Orchestrator] Idea created successfully with ID:', newIdea?.id);

        console.log('[Orchestrator] Inserting idea source:', newIdea);
        if (newIdea) {
            const sourceData = {
                idea_id: newIdea.id,
                source_type: contentSource.sourceType,
                url: contentSource.url
            };

            console.log('[Orchestrator] Inserting idea source:', sourceData);

            const { data: sourceResult, error: sourceError } = await (supabaseClient
                .from('idea_sources') as any)
                .insert(sourceData)
                .select();

            if (sourceError) {
                console.error(`[Orchestrator] Error creating idea source:`, {
                    message: sourceError.message,
                    code: sourceError.code,
                    details: sourceError.details,
                    hint: sourceError.hint,
                    sourceData
                });
                // Decide if you want to throw here or just log and continue
                // For now, we'll log and let the idea creation succeed
            } else {
                console.log('[Orchestrator] Idea source created successfully:', sourceResult);
            }
        } else {
            console.warn('[Orchestrator] No idea returned after insert, cannot create source');
        }
    }

    /**
     * Update an existing idea
     */
    private async updateIdea(
        ideaResult: {
            target_idea_id?: number;
            pitch: string;
            key_pain_insight: string;
            score: number;
            mvp: any;
        },
        contentSource: { url: string; sourceType: string }
    ): Promise<void> {
        if (!ideaResult.target_idea_id) {
            console.warn('[Orchestrator] Attempted to update idea without target_idea_id.');
            return;
        }

        console.log(`[Orchestrator] Updating idea ${ideaResult.target_idea_id}:`, {
            pitch: ideaResult.pitch,
            key_pain_insight: ideaResult.key_pain_insight,
            score: ideaResult.score,
            mvp: ideaResult.mvp,
            sourceType: contentSource.sourceType,
            sourceUrl: contentSource.url
        });

        const { error: updateError } = await supabaseClient
            .from('ideas')
            .update({
                pitch: ideaResult.pitch,
                key_pain_insight: ideaResult.key_pain_insight,
                score: ideaResult.score,
                mvp: JSON.stringify(ideaResult.mvp)
            })
            .eq('id', ideaResult.target_idea_id);

        if (updateError) {
            console.error(`[Orchestrator] Error updating idea ${ideaResult.target_idea_id}: ${updateError.message}`);
            throw updateError;
        }

        console.log(`[Orchestrator] Idea ${ideaResult.target_idea_id} updated successfully.`);

        // Create an idea source for the update
        const sourceData = {
            idea_id: ideaResult.target_idea_id,
            source_type: contentSource.sourceType,
            url: contentSource.url
        };

        console.log('[Orchestrator] Inserting idea source for updated idea:', sourceData);

        const { error: sourceError } = await (supabaseClient
            .from('idea_sources') as any)
            .insert(sourceData)
            .select();

        if (sourceError) {
            console.error(`[Orchestrator] Error creating idea source for updated idea ${ideaResult.target_idea_id}:`, {
                message: sourceError.message,
                code: sourceError.code,
                details: sourceError.details,
                hint: sourceError.hint,
                sourceData
            });
            // Log the error but don't re-throw, as the idea update itself was successful.
        } else {
            console.log(`[Orchestrator] Idea source created for updated idea ${ideaResult.target_idea_id}.`);
        }
    }

    /**
     * Utility: Delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
