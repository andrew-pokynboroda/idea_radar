"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X } from "lucide-react";
import { Theme } from "@/lib/services/ideas";
import { subscribeToThemes, unsubscribeFromTheme } from "@/app/actions/subscriptions";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";

interface SubscriptionManagerProps {
    themes: Theme[];
    subscription: any; // Type this properly if possible, but 'any' for now to match the complex return type of getUserSubscription
}

export function SubscriptionManager({ themes, subscription }: SubscriptionManagerProps) {
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();

    const selectedThemeIds = searchParams.get("themes")
        ? searchParams.get("themes")!.split(",").map(Number)
        : [];

    // If no themes selected in filter, we might want to suggest all? 
    // Or just rely on what is explicitly selected.
    // The user said "subscribe if not subscribed to some topic yet".
    // Let's assume this means "Subscribe to [Selected Themes]"

    const subscribedThemeIds = new Set<number>(
        subscription?.subscription_themes?.map((st: any) => st.theme_id) || []
    );

    const themesToSubscribeTo = selectedThemeIds.filter(id => !subscribedThemeIds.has(id));

    const handleSubscribe = () => {
        if (themesToSubscribeTo.length === 0) return;

        startTransition(async () => {
            try {
                await subscribeToThemes(themesToSubscribeTo);
            } catch (error) {
                console.error("Failed to subscribe", error);
                alert("Failed to subscribe");
            }
        });
    };

    const handleUnsubscribe = (themeId: number) => {
        startTransition(async () => {
            try {
                await unsubscribeFromTheme(themeId);
            } catch (error) {
                console.error("Failed to unsubscribe", error);
                alert("Failed to unsubscribe");
            }
        });
    };

    return (
        <div className="rounded-lg border bg-card p-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" /> Get Alerts
            </h4>
            <p className="text-sm text-muted-foreground">
                Receive daily emails for new ideas in your subscribed themes.
            </p>

            {subscription?.email && (
                <p className="text-xs text-muted-foreground">
                    Updates sent to: <span className="font-medium text-foreground">{subscription.email}</span>
                </p>
            )}

            {subscription?.subscription_themes?.length > 0 && (
                <>
                    <p className="text-xs text-muted-foreground mb-1">
                        About:
                    </p>
                    <div className="flex flex-wrap gap-2">

                        {subscription.subscription_themes.map((st: any) => (
                            <Badge key={st.theme_id} variant="secondary" className="flex items-center gap-1">
                                {st.theme?.name}
                                <button
                                    onClick={() => handleUnsubscribe(st.theme_id)}
                                    className="ml-1 hover:text-destructive focus:outline-none"
                                    disabled={isPending}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            {themesToSubscribeTo.length > 0 && (
                <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleSubscribe}
                    disabled={isPending}
                >
                    {isPending ? "Subscribing..." : "Subscribe to Selected Themes"}
                </Button>
            )}

            {/* If no themes selected and no subscription, maybe show a generic subscribe button? 
                But the requirement says "subscribe if not subscribed to some topic yet".
                If I select "All" (empty list in logic usually, but here I made it explicit in filter), 
                I should probably handle "All" case.
                If selectedThemeIds is empty, it means "All". 
                So we should probably subscribe to ALL themes? Or just show "Select themes to subscribe".
                Let's assume "Select themes to subscribe" is safer than subscribing to everything.
            */}
            {selectedThemeIds.length === 0 && subscribedThemeIds.size === 0 && (
                <p className="text-xs text-muted-foreground italic">
                    Select themes to subscribe.
                </p>
            )}
        </div>
    );
}
