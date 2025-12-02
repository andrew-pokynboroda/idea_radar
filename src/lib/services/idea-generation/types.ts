/**
 * Shared types for the idea generation service
 */

export interface Theme {
    id: number;
    name: string;
    keywords: string; // Comma-separated keywords/subreddit names
}

export interface SourceContent {
    id: string;
    text: string;
    url: string;
    sourceType: string;
    metadata: Record<string, any>;
}

export interface PainPointAnalysis {
    hasPainPoint: boolean;
    explanation?: string;
    relevance?: number; // 1-10
}

export interface IdeaResult {
    action: 'NEW' | 'IMPROVE';
    target_idea_id?: number;
    name: string;
    pitch: string;
    key_pain_insight: string;
    score: number; // 0-100
    painpoints: string[];
    insights: string[];
    competitors: string[];
    mvp: {
        scope: string;
        components: string[];
        estimated_time: string;
    };
}

export interface GenerationResults {
    themes_processed: number;
    ideas_created: number;
    ideas_updated: number;
    sources_logged: number;
    errors: string[];
}

export interface ExistingIdea {
    id: number;
    name: string;
    pitch: string;
}
