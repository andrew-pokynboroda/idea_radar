import { SourceAdapter } from './source-adapter';
import { Theme, SourceContent } from '../types';
import { createRedditClient, MockRedditClient as RedditClient } from '@/lib/clients/reddit';

export class RedditSourceAdapter implements SourceAdapter {
    readonly name = 'Reddit';
    private client: RedditClient | null = null;

    async fetchContent(theme: Theme): Promise<SourceContent[]> {
        const content: SourceContent[] = [];

        const keywords = theme.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);

        if (keywords.length === 0) {
            console.log(`[Reddit] No keywords for theme ${theme.name}`);
            return [];
        }

        if (!this.client) {
            this.client = await createRedditClient();
        }

        console.log(`[Reddit] Fetching from ${keywords.length} keywords for ${theme.name}`);
        for (const keyword of keywords) {
            try {
                const posts = await this.fetchSubredditPosts(keyword);
                content.push(...posts);
            } catch (error) {
                console.error(`[Reddit] Error fetching with keyword ${keyword}:`, error);
            }
        }

        console.log(`[Reddit] Fetched ${content.length} posts total`);
        return content;
    }

    private async fetchSubredditPosts(keyword: string): Promise<SourceContent[]> {
        const content: SourceContent[] = [];

        const posts = await this.client!.getSubredditPostsWithKeyword(keyword);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        const cutoffTimestamp = cutoffDate.getTime() / 1000;

        const recentPosts = posts.filter((post: any) =>
            post.data.created_utc >= cutoffTimestamp
        );

        console.log(`[Reddit] Found ${recentPosts.length} recent posts with keyword ${keyword}`);

        for (const post of recentPosts.slice(0, 20)) {
            const postData = post.data;
            const text = `${postData.title}\n\n${postData.selftext || ''}`;

            // Skip if content is too short
            if (text.trim().length < 10) {
                continue;
            }

            content.push({
                id: postData.id,
                text,
                url: `https://reddit.com${postData.permalink}`,
                sourceType: 'reddit',
                metadata: {
                    subreddit: postData.title,
                    author: postData.author,
                    score: postData.score,
                    created_utc: postData.created_utc,
                },
            });
        }

        return content;
    }
}
