import { SourceAdapter } from './adapters/source-adapter';
import { PainPointAnalyzer } from './analyzers/pain-point-analyzer';
import { IdeaGenerator } from './generators/idea-generator';
import { createAdminClient } from '@/lib/clients/supabase';
import { Theme, GenerationResults, ExistingIdea } from './types';

const supabaseClient = createAdminClient();

export interface OrchestratorOptions {
    /**
     * Source adapters to use for fetching content
     */
    sourceAdapters: SourceAdapter[];

    /**
     * Pain point analyzer instance
     */
    painPointAnalyzer: PainPointAnalyzer;

    /**
     * Idea generator instance
     */
    ideaGenerator: IdeaGenerator;

    /**
     * Optional: Delay between processing items (ms)
     */
    processingDelay?: number;
}

/**
 * Main orchestrator for the idea generation pipeline
 * Coordinates sources, analysis, generation, and persistence
 */
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

    /**
     * Execute the idea generation pipeline
     * @returns Results summary
     */
    async execute(): Promise<GenerationResults> {
        console.log('[Orchestrator] Starting idea generation job...');

        const results: GenerationResults = {
            themes_processed: 0,
            ideas_created: 0,
            ideas_updated: 0,
            sources_logged: 0,
            errors: [],
        };

        // Fetch all themes
        const { data: themes, error: themesError } = await supabaseClient
            .from('themes')
            .select('id, name, keywordss');

        if (themesError) {
            throw new Error(`Failed to fetch themes: ${themesError.message}`);
        }

        if (!themes || themes.length === 0) {
            console.log('[Orchestrator] No themes found');
            return results;
        }

        // Process each theme
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

    /**
     * Process a single theme
     */
    private async processTheme(theme: Theme, results: GenerationResults): Promise<void> {
        console.log(`[Orchestrator] Processing theme: ${theme.name}`);

        // Fetch existing ideas for this theme
        const existingIdeas = await this.fetchExistingIdeas(theme.id);

        // Fetch content from all source adapters
        for (const adapter of this.sourceAdapters) {
            try {
                const content = await adapter.fetchContent(theme);

                // Process each content item
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
        // Step 1: Analyze for pain points
        const painPointAnalysis = await this.painPointAnalyzer.analyze(content.text);

        if (!this.painPointAnalyzer.isSignificant(painPointAnalysis)) {
            return; // Skip if no significant pain point
        }

        console.log(`[Orchestrator] Found pain point: ${painPointAnalysis.explanation}`);

        // Log the source
        await this.logSource(theme.id, content.sourceType, painPointAnalysis.explanation || '');
        results.sources_logged++;

        // Step 2: Generate or improve idea
        const ideaResult = await this.ideaGenerator.generate(
            theme.name,
            existingIdeas,
            content.text,
            painPointAnalysis
        );

        // Step 3: Persist to database
        if (ideaResult.action === 'NEW') {
            await this.createIdea(theme.id, ideaResult, existingIdeas);
            results.ideas_created++;
            console.log(`[Orchestrator] Created new idea: ${ideaResult.name}`);
        } else if (ideaResult.action === 'IMPROVE' && ideaResult.target_idea_id) {
            await this.updateIdea(ideaResult);
            results.ideas_updated++;
            console.log(`[Orchestrator] Updated idea: ${ideaResult.name}`);
        }
    }

    /**
     * Fetch existing ideas for a theme
     */
    private async fetchExistingIdeas(themeId: number): Promise<ExistingIdea[]> {
        // Stubbed to avoid type errors
        return [];
    }

    /**
     * Log a source to the database
     */
    private async logSource(
        themeId: number,
        sourceType: string,
        insight: string
    ): Promise<void> {
        // Stubbed to avoid type errors
        console.log('[Orchestrator] (Stub) Log source:', { themeId, sourceType, insight });
    }

    /**
     * Create a new idea
     */
    private async createIdea(
        themeId: number,
        ideaResult: { name: string; pitch: string; key_pain_insight: string; score: number },
        existingIdeas: ExistingIdea[]
    ): Promise<void> {
        // Stubbed to avoid type errors
        console.log('[Orchestrator] (Stub) Create idea:', ideaResult);
    }

    /**
     * Update an existing idea
     */
    private async updateIdea(ideaResult: {
        target_idea_id?: number;
        pitch: string;
        key_pain_insight: string;
        score: number;
    }): Promise<void> {
        // Stubbed to avoid type errors
        console.log('[Orchestrator] (Stub) Update idea:', ideaResult);
    }

    /**
     * Utility: Delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
