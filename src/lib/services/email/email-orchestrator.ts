import { createAdminClient } from '@/lib/clients/supabase';
import { Database } from '@/types/supabase';
import { EmailSender } from './email-sender';
import { generateIdeaDigestEmail } from './templates/idea-digest-template';

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

/**
 * Orchestrator for sending daily idea digest emails
 * Implements efficient querying to prevent N+1 problems
 */
export class EmailOrchestrator {
    private supabaseClient = createAdminClient();
    private webAppUrl: string;

    constructor(
        private emailSender: EmailSender,
        webAppUrl: string = 'https://idea-radar-lyart.vercel.app/'
    ) {
        this.webAppUrl = webAppUrl;
    }

    /**
     * Execute the email sending pipeline
     * @returns Results summary
     */
    async execute(): Promise<EmailOrchestratorResults> {
        console.log('[EmailOrchestrator] Starting daily digest email job...');

        const results: EmailOrchestratorResults = {
            emails_sent: 0,
            emails_skipped: 0,
            errors: [],
        };

        try {
            // Step 1: Fetch ideas created today (single query)
            const todayIdeas = await this.fetchTodayIdeas();
            console.log(`[EmailOrchestrator] Found ${todayIdeas.length} ideas created today`);

            if (todayIdeas.length === 0) {
                console.log('[EmailOrchestrator] No ideas created today, skipping email job');
                return results;
            }

            // Step 2: Fetch all subscriptions with their themes (single query with join)
            const subscriptions = await this.fetchSubscriptionsWithThemes();
            console.log(`[EmailOrchestrator] Found ${subscriptions.length} active subscriptions`);

            if (subscriptions.length === 0) {
                console.log('[EmailOrchestrator] No active subscriptions, skipping email job');
                return results;
            }

            // Step 3: Group ideas by theme_id for efficient lookup
            const ideasByTheme = this.groupIdeasByTheme(todayIdeas);

            // Step 4: Process each subscription
            for (const subscription of subscriptions) {
                try {
                    await this.processSubscription(subscription, ideasByTheme, results);
                } catch (error) {
                    console.error(
                        `[EmailOrchestrator] Error processing subscription ${subscription.id}:`,
                        error
                    );
                    results.errors.push(
                        `Subscription ${subscription.email}: ${(error as Error).message}`
                    );
                }
            }

            console.log('[EmailOrchestrator] Email job complete:', results);
            return results;
        } catch (error) {
            console.error('[EmailOrchestrator] Fatal error in email job:', error);
            results.errors.push(`Fatal error: ${(error as Error).message}`);
            return results;
        }
    }

    /**
     * Fetch all ideas created today with their themes
     * Single query with join to prevent N+1
     */
    private async fetchTodayIdeas(): Promise<Idea[]> {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const { data, error } = await this.supabaseClient
            .from('ideas')
            .select(
                `
                *,
                theme:themes(*)
            `
            )
            .gte('created_at', startOfToday.toISOString())
            .order('score', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch today's ideas: ${error.message}`);
        }

        return (data || []) as Idea[];
    }

    /**
     * Fetch all subscriptions with their theme preferences
     * Single query with join to prevent N+1
     */
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

    /**
     * Group ideas by theme_id for efficient lookup
     */
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

    /**
     * Process a single subscription
     */
    private async processSubscription(
        subscription: Subscription,
        ideasByTheme: Map<number, Idea[]>,
        results: EmailOrchestratorResults
    ): Promise<void> {
        // Get theme IDs this subscriber is interested in
        const subscribedThemeIds = subscription.subscription_themes.map(st => st.theme_id);

        if (subscribedThemeIds.length === 0) {
            console.log(
                `[EmailOrchestrator] Subscription ${subscription.id} has no theme preferences, skipping`
            );
            results.emails_skipped++;
            return;
        }

        // Filter ideas matching subscriber's themes
        const relevantIdeas: Idea[] = [];
        for (const themeId of subscribedThemeIds) {
            const ideas = ideasByTheme.get(themeId) || [];
            relevantIdeas.push(...ideas);
        }

        if (relevantIdeas.length === 0) {
            console.log(
                `[EmailOrchestrator] No relevant ideas for subscription ${subscription.email}, skipping`
            );
            results.emails_skipped++;
            return;
        }

        // Group ideas by theme for email display
        const ideaGroups = this.createIdeaGroups(relevantIdeas);

        // Generate email HTML
        const emailHtml = generateIdeaDigestEmail({
            subscriberEmail: subscription.email,
            ideaGroups,
            webAppUrl: this.webAppUrl,
        });

        // Send email
        const result = await this.emailSender.sendEmail({
            to: subscription.email,
            subject: `💡 Your Daily Idea Digest - ${relevantIdeas.length} New ${relevantIdeas.length === 1 ? 'Idea' : 'Ideas'}`,
            html: emailHtml,
        });

        if (result.success) {
            console.log(`[EmailOrchestrator] Email sent to ${subscription.email}`);
            results.emails_sent++;
        } else {
            console.error(
                `[EmailOrchestrator] Failed to send email to ${subscription.email}:`,
                result.error
            );
            results.errors.push(`${subscription.email}: ${result.error}`);
        }
    }

    /**
     * Create idea groups organized by theme
     * Ideas within each theme are already sorted by score (from query)
     */
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

        // Convert to array and sort groups by total score (sum of idea scores)
        const groups = Array.from(groupMap.values());
        groups.sort((a, b) => {
            const scoreA = a.ideas.reduce((sum, idea) => sum + idea.score, 0);
            const scoreB = b.ideas.reduce((sum, idea) => sum + idea.score, 0);
            return scoreB - scoreA; // Descending order
        });

        return groups;
    }
}
