import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { getIdeas, getThemes } from "@/lib/services/ideas";
import { getUserSubscription } from "@/app/actions/subscriptions";
import { IdeaCard } from "@/components/idea-card";
import { ThemeFilter } from "@/components/theme-filter";
import { SubscriptionManager } from "@/components/subscription-manager";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ themes?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

const IDEAS_PER_PAGE = 5;

export default async function IdeasPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const selectedThemeIds = params.themes
        ? params.themes.split(',').map(Number)
        : [];
    const requestedPage = params.page ? parseInt(params.page) : 1;

    const [{ ideas, total }, themes, subscription] = await Promise.all([
        getIdeas(selectedThemeIds, 'score', requestedPage, IDEAS_PER_PAGE),
        getThemes(),
        getUserSubscription()
    ]);

    const totalPages = Math.max(1, Math.ceil(total / IDEAS_PER_PAGE));

    // Ensure current page is within valid range
    const currentPage = Math.max(1, Math.min(requestedPage, totalPages));

    // Build query params for pagination links
    const buildPageUrl = (page: number) => {
        const queryParams = new URLSearchParams();
        if (params.themes) {
            queryParams.set('themes', params.themes);
        }
        if (page > 1) {
            queryParams.set('page', page.toString());
        }
        return `/ideas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    };

    // If requested page is out of bounds and we have ideas, we need to handle it
    // by showing the clamped page (this prevents errors but shows valid data)
    const isOutOfBounds = requestedPage !== currentPage && total > 0;

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

                            {isOutOfBounds && (
                                <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                                    <CardContent className="py-4">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Page {requestedPage} doesn't exist. Showing page {currentPage} instead.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

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

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    {currentPage === 1 ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={buildPageUrl(currentPage - 1)}>
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Link>
                                        </Button>
                                    )}

                                    <div className="flex items-center gap-2 px-4">
                                        <span className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>

                                    {currentPage === totalPages ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={buildPageUrl(currentPage + 1)}>
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                    )}
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
