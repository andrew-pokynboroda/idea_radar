import { Theme, SourceContent } from '../types';

/**
 * Abstract interface for source adapters
 * Implement this to add new content sources (Twitter, HackerNews, etc.)
 */
export interface SourceAdapter {
    /**
     * Human-readable name of the source
     */
    readonly name: string;

    /**
     * Fetch content related to a theme
     * @param theme The theme to fetch content for
     * @returns Array of source content items
     */
    fetchContent(theme: Theme): Promise<SourceContent[]>;
}
