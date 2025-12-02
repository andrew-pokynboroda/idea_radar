import { NextRequest, NextResponse } from 'next/server';
import { IdeaGenerationOrchestrator } from '@/lib/services/idea-generation/orchestrator';
import { RedditSourceAdapter } from '@/lib/services/idea-generation/adapters/reddit-source-adapter';
import { PainPointAnalyzer } from '@/lib/services/idea-generation/analyzers/pain-point-analyzer';
import { IdeaGenerator } from '@/lib/services/idea-generation/generators/idea-generator';
import { EmailOrchestrator } from '@/lib/services/email/email-orchestrator';
import { ResendEmailSender } from '@/lib/services/email/email-sender';
import { resendClient } from '@/lib/clients/resend';

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

        // Execute the idea generation pipeline
        const ideaResults = await orchestrator.execute();

        console.log('[API] Idea generation complete, starting email digest...');

        // Send email digests after idea generation
        let emailResults = null;
        if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
            try {
                const emailSender = new ResendEmailSender(
                    resendClient,
                    process.env.RESEND_FROM_EMAIL
                );

                const emailOrchestrator = new EmailOrchestrator(
                    emailSender,
                    'https://idea-radar-lyart.vercel.app/'
                );

                emailResults = await emailOrchestrator.execute();
                console.log('[API] Email digest complete');
            } catch (emailError) {
                console.error('[API] Error sending email digests:', emailError);
                // Don't fail the entire job if emails fail
                emailResults = {
                    emails_sent: 0,
                    emails_skipped: 0,
                    errors: [(emailError as Error).message],
                };
            }
        } else {
            console.log('[API] Skipping email digest - RESEND_API_KEY or RESEND_FROM_EMAIL not configured');
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[API] Error in idea generation job:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: (error as Error).message },
            { status: 500 }
        );
    }
}
