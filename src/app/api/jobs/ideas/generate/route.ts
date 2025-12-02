import { NextRequest, NextResponse } from 'next/server';
import { IdeaGenerationOrchestrator } from '@/lib/services/idea-generation/orchestrator';
import { RedditSourceAdapter } from '@/lib/services/idea-generation/adapters/reddit-source-adapter';
import { PainPointAnalyzer } from '@/lib/services/idea-generation/analyzers/pain-point-analyzer';
import { IdeaGenerator } from '@/lib/services/idea-generation/generators/idea-generator';
import { EmailOrchestrator } from '@/lib/services/email/email-orchestrator';
import { ResendEmailSender } from '@/lib/services/email/email-sender';
import { resendClient } from '@/lib/clients/resend';
import { captureError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface JobResults {
    ideas: ReturnType<IdeaGenerationOrchestrator['execute']> extends Promise<infer T> ? T : never;
    emails?: ReturnType<EmailOrchestrator['execute']> extends Promise<infer T> ? T : never;
}

export async function POST(request: NextRequest) {
    try {
        verifyAuth(request);

        await runIdeaGeneration();
        await runEmailDigest();

        return NextResponse.json({ ok: true });
    } catch (error) {
        return handleError(error);
    }
}

function verifyAuth(request: NextRequest): void {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        throw new Error('Unauthorized');
    }
}

async function runIdeaGeneration() {
    const orchestrator = createIdeaOrchestrator();
    await orchestrator.execute();
    console.log('[API] Idea generation complete');
}

function createIdeaOrchestrator(): IdeaGenerationOrchestrator {
    return new IdeaGenerationOrchestrator({
        sourceAdapters: [
            new RedditSourceAdapter(),
        ],
        painPointAnalyzer: new PainPointAnalyzer(),
        ideaGenerator: new IdeaGenerator(),
        processingDelay: 1000,
    });
}

async function runEmailDigest() {
    if (!isEmailConfigured()) {
        console.log('[API] Skipping email digest - email not configured');
        return;
    }

    try {
        const orchestrator = createEmailOrchestrator();
        await orchestrator.execute();
        console.log('[API] Email digest complete');
    } catch (error) {
        captureError(error, { context: 'runEmailDigest' });
        return {
            emails_sent: 0,
            emails_skipped: 0,
            errors: [(error as Error).message],
        };
    }
}

function isEmailConfigured(): boolean {
    return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function createEmailOrchestrator(): EmailOrchestrator {
    const emailSender = new ResendEmailSender(
        resendClient,
        process.env.RESEND_FROM_EMAIL!
    );

    return new EmailOrchestrator(emailSender, process.env.NEXT_PUBLIC_WEB_APP_URL!);
}

function handleError(error: unknown): NextResponse {
    captureError(error, { context: 'POST /api/jobs/ideas/generate' });

    if ((error as Error).message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
        {
            error: 'Internal server error',
            message: (error as Error).message
        },
        { status: 500 }
    );
}
