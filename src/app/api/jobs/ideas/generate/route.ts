import { NextRequest, NextResponse } from 'next/server';
import { IdeaGenerationOrchestrator } from '@/lib/services/idea-generation/orchestrator';
import { RedditSourceAdapter } from '@/lib/services/idea-generation/adapters/reddit-source-adapter';
import { PainPointAnalyzer } from '@/lib/services/idea-generation/analyzers/pain-point-analyzer';
import { IdeaGenerator } from '@/lib/services/idea-generation/generators/idea-generator';

// Force dynamic rendering to avoid build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Verify Vercel Cron authentication
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize services
        const orchestrator = new IdeaGenerationOrchestrator({
            sourceAdapters: [
                new RedditSourceAdapter(),
                // Future: new TwitterSourceAdapter(),
                // Future: new HackerNewsSourceAdapter(),
            ],
            painPointAnalyzer: new PainPointAnalyzer(),
            ideaGenerator: new IdeaGenerator(),
            processingDelay: 1000, // 1 second between items
        });

        // Execute the pipeline
        const results = await orchestrator.execute();

        return NextResponse.json({
            success: true,
            ...results,
        });
    } catch (error) {
        console.error('[API] Error in idea generation job:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: (error as Error).message },
            { status: 500 }
        );
    }
}
