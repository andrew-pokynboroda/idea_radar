import { SourceAdapter } from './source-adapter';
import { Theme, SourceContent } from '../types';
import { createRedditClient } from '@/lib/clients/reddit';
import RedditClient from 'reddit-client-api';

/**
 * Reddit source adapter
 * Fetches posts from subreddits specified in theme keywords
 */
export class RedditSourceAdapter implements SourceAdapter {
    readonly name = 'Reddit';
    private client: RedditClient | null = null;

    /**
     * Fetch content from Reddit subreddits
     */
    async fetchContent(theme: Theme): Promise<SourceContent[]> {
        const content: SourceContent[] = [];

        // Parse subreddit names from keywords
        const subreddits = theme.keywordss
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);

        if (subreddits.length === 0) {
            console.log(`[Reddit] No subreddits for theme ${theme.name}`);
            return [];
        }

        // Initialize Reddit client if needed
        if (!this.client) {
            this.client = await createRedditClient();
        }

        console.log(`[Reddit] Fetching from ${subreddits.length} subreddits for ${theme.name}`);

        // Fetch from each subreddit
        for (const subreddit of subreddits) {
            try {
                const posts = await this.fetchSubredditPosts(subreddit);
                content.push(...posts);
            } catch (error) {
                console.error(`[Reddit] Error fetching r/${subreddit}:`, error);
            }
        }

        console.log(`[Reddit] Fetched ${content.length} posts total`);
        return content;
    }

    /**
     * Fetch posts from a specific subreddit
     */
    private async fetchSubredditPosts(subreddit: string): Promise<SourceContent[]> {
        const content: SourceContent[] = [];

        // Fetch recent posts
        const posts = await this.client!.getNewPostsBySubreddit(subreddit, 100);

        // Filter by date (last 30 days)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        const cutoffTimestamp = cutoffDate.getTime() / 1000;

        const recentPosts = posts.filter((post: any) =>
            post.data.created_utc >= cutoffTimestamp
        );

        console.log(`[Reddit] Found ${recentPosts.length} recent posts in r/${subreddit}`);

        // Limit to 20 posts per subreddit to avoid rate limits
        for (const post of recentPosts.slice(0, 20)) {
            const postData = post.data;
            const text = `${postData.title}\n\n${postData.selftext || ''}`;

            // Skip if content is too short
            if (text.trim().length < 50) {
                continue;
            }

            content.push({
                id: postData.id,
                text,
                url: `https://reddit.com${postData.permalink}`,
                sourceType: 'reddit',
                metadata: {
                    subreddit,
                    author: postData.author,
                    score: postData.score,
                    created_utc: postData.created_utc,
                },
            });
        }

        return content;
    }
}
