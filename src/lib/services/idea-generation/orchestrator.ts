import { SourceAdapter } from './adapters/source-adapter';
import { PainPointAnalyzer } from './analyzers/pain-point-analyzer';
import { IdeaGenerator } from './generators/idea-generator';
import { createAdminClient } from '@/lib/clients/supabase';
import { captureError } from '@/lib/utils';
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

        try {
            const themes = await this.fetchThemes();
            if (themes.length === 0) return results;
            await this.processAllThemes(themes, results);
        } catch (error) {
            captureError(error);
            results.errors.push(`Job failed: ${(error as Error).message}`);
        }

        console.log('[Orchestrator] Job complete:', results);
        return results;
    }

    private async fetchThemes(): Promise<Theme[]> {
        const { data: themes, error } = await supabaseClient
            .from('themes')
            .select('id, name, keywords');

        if (error) throw new Error(`Failed to fetch themes: ${error.message}`);

        if (!themes?.length) {
            console.log('[Orchestrator] No themes found');
            return [];
        }
        return themes as Theme[];
    }

    private async processAllThemes(themes: Theme[], results: GenerationResults): Promise<void> {
        for (const theme of themes) {
            try {
                await this.processTheme(theme, results);
                results.themes_processed++;
            } catch (error) {
                captureError(error, { theme: theme.name });
                results.errors.push(`Theme ${theme.name}: ${(error as Error).message}`);
            }
        }
    }

    private async processTheme(theme: Theme, results: GenerationResults): Promise<void> {
        console.log(`[Orchestrator] Processing theme: ${theme.name}`);
        const existingIdeas = await this.fetchExistingIdeas(theme.id);

        for (const adapter of this.sourceAdapters) {
            await this.processAdapter(adapter, theme, existingIdeas, results);
        }
    }

    private async processAdapter(
        adapter: SourceAdapter,
        theme: Theme,
        existingIdeas: ExistingIdea[],
        results: GenerationResults
    ): Promise<void> {
        try {
            const content = await adapter.fetchContent(theme);
            for (const item of content) {
                try {
                    await this.processContent(theme, item, existingIdeas, results);
                    await this.delay(this.processingDelay);
                } catch (error) {
                    captureError(error, { adapter: adapter.name, itemId: item.id });
                    results.errors.push(`${adapter.name} ${item.id}: ${(error as Error).message}`);
                }
            }
        } catch (error) {
            captureError(error, { adapter: adapter.name });
            results.errors.push(`${adapter.name}: ${(error as Error).message}`);
        }
    }

    private async processContent(
        theme: Theme,
        content: { id: string; text: string; url: string; sourceType: string },
        existingIdeas: ExistingIdea[],
        results: GenerationResults
    ): Promise<void> {
        const painPointAnalysis = await this.painPointAnalyzer.analyze(content.text);
        if (!painPointAnalysis) return;

        console.log(`[Orchestrator] Found pain point: ${painPointAnalysis.explanation}`);

        const ideaResult = await this.ideaGenerator.generate(
            theme.name,
            existingIdeas,
            content.text,
            painPointAnalysis
        );

        if (ideaResult.action === 'NEW') {
            await this.createIdea(theme.id, ideaResult, content);
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
        ideaResult: { name: string; pitch: string; key_pain_insight: string; score: number; mvp: any },
        contentSource: { url: string; sourceType: string }
    ): Promise<void> {
        console.log('[Orchestrator] Creating new idea:', { name: ideaResult.name, themeId });

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
            captureError(ideaError, { context: 'createIdea', themeId, name: ideaResult.name });
            throw ideaError;
        }

        if (newIdea) {
            await this.createIdeaSource(newIdea.id, contentSource);
        }
    }

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
            console.warn('[Orchestrator] Missing target_idea_id for update');
            return;
        }

        const { error: updateError } = await (supabaseClient
            .from('ideas') as any)
            .update({
                pitch: ideaResult.pitch,
                key_pain_insight: ideaResult.key_pain_insight,
                score: ideaResult.score,
                mvp: JSON.stringify(ideaResult.mvp)
            })
            .eq('id', ideaResult.target_idea_id);

        if (updateError) {
            captureError(updateError, { context: 'updateIdea', id: ideaResult.target_idea_id });
            throw updateError;
        }

        await this.createIdeaSource(ideaResult.target_idea_id, contentSource);
    }

    private async createIdeaSource(ideaId: number, contentSource: { url: string; sourceType: string }) {
        const sourceData = {
            idea_id: ideaId,
            source_type: contentSource.sourceType,
            url: contentSource.url
        };

        const { error } = await (supabaseClient.from('idea_sources') as any).insert(sourceData);

        if (error) {
            captureError(error, { context: 'createIdeaSource', sourceData });
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
