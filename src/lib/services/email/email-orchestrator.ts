import { createAdminClient } from '@/lib/clients/supabase';
import { Database } from '@/types/supabase';
import { EmailSender } from './email-sender';
import { generateIdeaDigestEmail } from './templates/idea-digest-template';
import { captureError } from '@/lib/utils';

type Idea = Database['public']['Tables']['ideas']['Row'] & {
    theme: Database['public']['Tables']['themes']['Row'];
};

type Subscription = Database['public']['Tables']['subscriptions']['Row'] & {
    subscription_themes: Array<{
        theme_id: number;
    }>;
};

interface IdeaGroup {
    themeName: string;
    ideas: Idea[];
}

interface EmailOrchestratorResults {
    emails_sent: number;
    emails_skipped: number;
    errors: string[];
}

export class EmailOrchestrator {
    private supabaseClient = createAdminClient();
    private webAppUrl: string;

    constructor(
        private emailSender: EmailSender,
        webAppUrl: string
    ) {
        this.webAppUrl = webAppUrl;
    }

    async execute(): Promise<EmailOrchestratorResults> {
        console.log('[EmailOrchestrator] Starting daily digest email job...');

        const results: EmailOrchestratorResults = {
            emails_sent: 0,
            emails_skipped: 0,
            errors: [],
        };

        try {
            const todayIdeas = await this.fetchTodayIdeas();
            console.log(`[EmailOrchestrator] Found ${todayIdeas.length} ideas created today`);

            if (todayIdeas.length === 0) {
                console.log('[EmailOrchestrator] No ideas created today, skipping email job');
                return results;
            }

            const subscriptions = await this.fetchSubscriptionsWithThemes();
            console.log(`[EmailOrchestrator] Found ${subscriptions.length} active subscriptions`);

            if (subscriptions.length === 0) {
                console.log('[EmailOrchestrator] No active subscriptions, skipping email job');
                return results;
            }

            const ideasByTheme = this.groupIdeasByTheme(todayIdeas);
            await this.processAllSubscriptions(subscriptions, ideasByTheme, results);

            console.log('[EmailOrchestrator] Email job complete:', results);
            return results;
        } catch (error) {
            captureError(error, { context: 'EmailOrchestrator.execute' });
            results.errors.push(`Fatal error: ${(error as Error).message}`);
            return results;
        }
    }

    private async processAllSubscriptions(
        subscriptions: Subscription[],
        ideasByTheme: Map<number, Idea[]>,
        results: EmailOrchestratorResults
    ): Promise<void> {
        for (const subscription of subscriptions) {
            try {
                await this.processSubscription(subscription, ideasByTheme, results);
            } catch (error) {
                captureError(error, {
                    context: 'processSubscription',
                    subscriptionId: subscription.id
                });
                results.errors.push(
                    `Subscription ${subscription.email}: ${(error as Error).message}`
                );
            }
        }
    }

    private async fetchTodayIdeas(): Promise<Idea[]> {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data, error } = await this.supabaseClient
            .from('ideas')
            .select(`
                *,
                theme:themes(*)
            `)
            .gte('created_at', startOfToday.toISOString())
            .order('score', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch today's ideas: ${error.message}`);
        }

        return (data || []) as Idea[];
    }

    private async fetchSubscriptionsWithThemes(): Promise<Subscription[]> {
        const { data, error } = await this.supabaseClient
            .from('subscriptions')
            .select(
                `
                *,
                subscription_themes(theme_id)
            `
            )
            .order('id', { ascending: true });

        if (error) {
            throw new Error(`Failed to fetch subscriptions: ${error.message}`);
        }

        return (data || []) as Subscription[];
    }

    private groupIdeasByTheme(ideas: Idea[]): Map<number, Idea[]> {
        const grouped = new Map<number, Idea[]>();

        for (const idea of ideas) {
            const themeId = idea.theme_id;
            if (!grouped.has(themeId)) {
                grouped.set(themeId, []);
            }
            grouped.get(themeId)!.push(idea);
        }

        return grouped;
    }

    private async processSubscription(
        subscription: Subscription,
        ideasByTheme: Map<number, Idea[]>,
        results: EmailOrchestratorResults
    ): Promise<void> {
        const subscribedThemeIds = subscription.subscription_themes.map(st => st.theme_id);

        if (subscribedThemeIds.length === 0) {
            console.log(`[EmailOrchestrator] Subscription ${subscription.id} has no theme preferences, skipping`);
            results.emails_skipped++;
            return;
        }

        const relevantIdeas = this.getRelevantIdeas(subscribedThemeIds, ideasByTheme);

        if (relevantIdeas.length === 0) {
            console.log(`[EmailOrchestrator] No relevant ideas for subscription ${subscription.email}, skipping`);
            results.emails_skipped++;
            return;
        }

        await this.sendDigestEmail(subscription, relevantIdeas, results);
    }

    private getRelevantIdeas(themeIds: number[], ideasByTheme: Map<number, Idea[]>): Idea[] {
        const relevantIdeas: Idea[] = [];
        for (const themeId of themeIds) {
            const ideas = ideasByTheme.get(themeId) || [];
            relevantIdeas.push(...ideas);
        }
        return relevantIdeas;
    }

    private async sendDigestEmail(
        subscription: Subscription,
        ideas: Idea[],
        results: EmailOrchestratorResults
    ): Promise<void> {
        const ideaGroups = this.createIdeaGroups(ideas);
        const emailHtml = this.generateEmailHtml(subscription, ideaGroups);
        const subject = this.createEmailSubject(ideas.length);

        const result = await this.emailSender.sendEmail({
            to: subscription.email,
            subject,
            html: emailHtml,
        });

        if (result.success) {
            console.log(`[EmailOrchestrator] Email sent to ${subscription.email}`);
            results.emails_sent++;
        } else {
            console.error(`[EmailOrchestrator] Failed to send email to ${subscription.email}:`, result.error);
            results.errors.push(`${subscription.email}: ${result.error}`);
        }
    }

    private generateEmailHtml(subscription: Subscription, ideaGroups: IdeaGroup[]): string {
        return generateIdeaDigestEmail({
            subscriberEmail: subscription.email,
            subscriptionId: subscription.id,
            ideaGroups,
            webAppUrl: this.webAppUrl,
        });
    }

    private createEmailSubject(ideaCount: number): string {
        const ideaWord = ideaCount === 1 ? 'Idea' : 'Ideas';
        return `💡 Your Daily Idea Digest - ${ideaCount} New ${ideaWord}`;
    }

    private createIdeaGroups(ideas: Idea[]): IdeaGroup[] {
        const groupMap = new Map<number, IdeaGroup>();

        for (const idea of ideas) {
            const themeId = idea.theme_id;
            if (!groupMap.has(themeId)) {
                groupMap.set(themeId, {
                    themeName: idea.theme.name,
                    ideas: [],
                });
            }
            groupMap.get(themeId)!.ideas.push(idea);
        }

        const groups = Array.from(groupMap.values());
        groups.sort((a, b) => {
            const scoreA = a.ideas.reduce((sum, idea) => sum + idea.score, 0);
            const scoreB = b.ideas.reduce((sum, idea) => sum + idea.score, 0);
            return scoreB - scoreA;
        });

        return groups;
    }
}
