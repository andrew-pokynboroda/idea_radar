import { Database } from '@/types/supabase';

type Idea = Database['public']['Tables']['ideas']['Row'] & {
    theme: Database['public']['Tables']['themes']['Row'];
};

interface IdeaGroup {
    themeName: string;
    ideas: Idea[];
}

interface IdeaDigestTemplateProps {
    subscriberEmail: string;
    ideaGroups: IdeaGroup[];
    webAppUrl: string;
}

/**
 * Generates HTML email template for daily idea digest
 * Designed to render well across all email clients
 */
export function generateIdeaDigestEmail(props: IdeaDigestTemplateProps): string {
    const { subscriberEmail, ideaGroups, webAppUrl } = props;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Idea Digest</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main Container -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                💡 Your Daily Idea Digest
                            </h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                                Fresh ideas curated just for you
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Hi there! 👋<br><br>
                                We've discovered <strong>${getTotalIdeasCount(ideaGroups)} new ${getTotalIdeasCount(ideaGroups) === 1 ? 'idea' : 'ideas'}</strong> today that match your interests. Here's what caught our attention:
                            </p>

                            ${ideaGroups.map(group => renderIdeaGroup(group)).join('\n')}

                            <!-- CTA Section -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 40px;">
                                <tr>
                                    <td align="center" style="padding: 30px 20px; background-color: #f9fafb; border-radius: 8px;">
                                        <p style="margin: 0 0 20px; color: #374151; font-size: 16px; font-weight: 600;">
                                            Ready to explore more?
                                        </p>
                                        <a href="${webAppUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                                            Visit Idea Radar
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                                You're receiving this email at <strong>${subscriberEmail}</strong> because you subscribed to daily idea digests.
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} Idea Radar. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

function renderIdeaGroup(group: IdeaGroup): string {
    return `
        <!-- Theme Group -->
        <div style="margin-bottom: 35px;">
            <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid #667eea;">
                <h2 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                    🎯 ${escapeHtml(group.themeName)}
                </h2>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 13px;">
                    ${group.ideas.length} ${group.ideas.length === 1 ? 'idea' : 'ideas'}
                </p>
            </div>

            ${group.ideas.map((idea, index) => renderIdea(idea, index)).join('\n')}
        </div>
    `;
}

function renderIdea(idea: Idea, index: number): string {
    return `
        <!-- Idea Card -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
            <tr>
                <td style="padding: 20px;">
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                        <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <span style="color: #ffffff; font-weight: 700; font-size: 14px;">${index + 1}</span>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 8px; color: #111827; font-size: 18px; font-weight: 700; line-height: 1.3;">
                                ${escapeHtml(idea.name)}
                            </h3>
                            <div style="display: inline-block; padding: 4px 10px; background-color: #ede9fe; color: #6b21a8; font-size: 12px; font-weight: 600; border-radius: 4px;">
                                Score: ${idea.score}/10
                            </div>
                        </div>
                    </div>
                    
                    <p style="margin: 0 0 12px; color: #374151; font-size: 15px; line-height: 1.6;">
                        ${escapeHtml(idea.pitch)}
                    </p>
                    
                    <div style="padding: 14px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                            <strong>💡 Key Insight:</strong> ${escapeHtml(idea.key_pain_insight)}
                        </p>
                    </div>
                </td>
            </tr>
        </table>
    `;
}

function getTotalIdeasCount(ideaGroups: IdeaGroup[]): number {
    return ideaGroups.reduce((total, group) => total + group.ideas.length, 0);
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
