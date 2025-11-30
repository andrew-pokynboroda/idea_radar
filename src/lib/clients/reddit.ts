import RedditClient from 'reddit-client-api';

interface RedditCredentials {
    username: string;
    password: string;
}

/**
 * Creates and authenticates a Reddit client
 */
export async function createRedditClient(): Promise<RedditClient> {
    const reddit = new RedditClient({
        apiKey: process.env.REDDIT_CLIENT_ID!,
        apiSecret: process.env.REDDIT_CLIENT_SECRET!,
        userAgent: process.env.REDDIT_USER_AGENT || 'IdeaRadar/1.0',
    });

    // Authenticate
    await reddit.auth({
        username: process.env.REDDIT_USERNAME!,
        password: process.env.REDDIT_PASSWORD!,
    });

    return reddit;
}
