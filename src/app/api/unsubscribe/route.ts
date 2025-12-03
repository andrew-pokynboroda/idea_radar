import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/clients/supabase';
import { captureError } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const subscriptionId = searchParams.get('id');

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID is required' },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', parseInt(subscriptionId));

        if (error) {
            captureError(error, { context: 'unsubscribe', subscriptionId });
            throw error;
        }

        return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unsubscribed</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                        text-align: center;
                        max-width: 500px;
                        margin: 20px;
                    }
                    h1 {
                        color: #1f2937;
                        margin: 0 0 16px;
                        font-size: 28px;
                    }
                    p {
                        color: #6b7280;
                        line-height: 1.6;
                        margin: 0 0 24px;
                    }
                    .emoji {
                        font-size: 64px;
                        margin-bottom: 16px;
                    }
                    a {
                        display: inline-block;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                    }
                    a:hover {
                        opacity: 0.9;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="emoji">👋</div>
                    <h1>You've been unsubscribed</h1>
                    <p>
                        You won't receive any more daily idea digests from us. 
                        We're sorry to see you go!
                    </p>
                    <p>
                        If you change your mind, you can always subscribe again from our website.
                    </p>
                    <a href="https://${process.env.NEXT_PUBLIC_WEB_APP_URL}">Back to Idea Radar</a>
                </div>
            </body>
            </html>
        `, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        captureError(error, { context: 'GET /api/unsubscribe' });
        return NextResponse.json(
            {
                error: 'Failed to unsubscribe',
                message: (error as Error).message
            },
            { status: 500 }
        );
    }
}
