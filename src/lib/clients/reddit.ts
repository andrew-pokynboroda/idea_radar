import mockData from './reddit_mock.json';

// Define the shape of the mock data items
interface MockPost {
    id: string;
    title: string;
    body: string;
    pain_point_category: string;
    pain_point_severity: string;
}

interface MockSubreddit {
    subreddit: string;
    description: string;
    posts: MockPost[];
}

// Define the shape of the Reddit API response expected by the adapter
export interface RedditPost {
    data: {
        id: string;
        title: string;
        selftext: string;
        permalink: string;
        author: string;
        score: number;
        created_utc: number;
    };
}

export class MockRedditClient {
    constructor(config: any) {
        // Config is ignored for mock
    }

    async auth(credentials: any) {
        // Auth is a no-op for mock
        return Promise.resolve();
    }

    async getSubredditPostsWithKeyword(keyword: string): Promise<RedditPost[]> {
        // Find the subreddit in the mock data
        // The mock data has "r/subredditName", so we need to match that
        const searchTarget = `r/${keyword.toLowerCase()}`;
        const mockSubreddit = (mockData as MockSubreddit[]).find(
            (s) => s.subreddit.toLowerCase().includes(searchTarget)
        );

        if (!mockSubreddit) {
            console.warn(`[MockRedditClient] Subreddit matching "${keyword}" not found in mock data.`);
            return [];
        }

        // Map mock posts to the structure expected by RedditSourceAdapter
        return mockSubreddit.posts.map((post) => ({
            data: {
                id: post.id,
                title: post.title,
                selftext: post.body,
                // Generate fake values for fields missing in mock data but required by adapter
                permalink: `/${mockSubreddit.subreddit}/comments/${post.id}/mock_post`,
                author: 'mock_user',
                score: Math.floor(Math.random() * 1000),
                created_utc: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30), // Random time in last 30 days
            },
        }));
    }

    async getRecentPosts(keyword: string, days: number = 30): Promise<RedditPost[]> {
        const posts = await this.getSubredditPostsWithKeyword(keyword);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffTimestamp = cutoffDate.getTime() / 1000;

        return posts.filter((post) =>
            post.data.created_utc >= cutoffTimestamp
        );
    }
}

export async function createRedditClient(): Promise<MockRedditClient> {
    const reddit = new MockRedditClient({
        apiKey: 'mock',
        apiSecret: 'mock',
        userAgent: 'mock',
    });

    await reddit.auth({
        username: 'mock',
        password: 'mock',
    });

    return reddit;
}
