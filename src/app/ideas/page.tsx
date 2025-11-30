import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";
import { getIdeas, getThemes } from "@/lib/services/ideas";
import { getUserSubscription } from "@/app/actions/subscriptions";
import { IdeaCard } from "@/components/idea-card";
import { ThemeFilter } from "@/components/theme-filter";
import { SubscriptionManager } from "@/components/subscription-manager";

interface PageProps {
    searchParams: Promise<{ themes?: string }>;
}

export const dynamic = "force-dynamic";

export default async function IdeasPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const selectedThemeIds = params.themes
        ? params.themes.split(',').map(Number)
        : [];

    const [ideas, themes, subscription] = await Promise.all([
        getIdeas(selectedThemeIds),
        getThemes(),
        getUserSubscription()
    ]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {/* Sidebar / Filters */}
                        <aside className="w-full md:w-[240px] flex-shrink-0 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>
                                <ThemeFilter themes={themes} />
                            </div>
                            <Separator />
                            <SubscriptionManager themes={themes} subscription={subscription} />
                        </aside>

                        {/* Main Feed */}
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold">Fresh Ideas</h1>
                            </div>

                            {ideas.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">
                                            No ideas found. Check back soon for fresh insights!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid flex-1 gap-6">
                                    {ideas.map((idea) => (
                                        <IdeaCard key={idea.id} idea={idea} />
                                    ))}
                                </div>
                            )}

                            {ideas.length > 0 && (
                                <div className="flex justify-center pt-8">
                                    <Button variant="outline" className="mx-auto">
                                        Load More Ideas
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
