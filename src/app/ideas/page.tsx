import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Filter, Flame, TrendingUp } from "lucide-react";

// Mock data for ideas
const MOCK_IDEAS = [
    {
        id: "1",
        name: "SaaS Metrics Dashboard for Notion",
        pitch: "A plugin that pulls Stripe data directly into Notion databases for real-time MRR tracking.",
        pain_insight: "Indie hackers hate switching between Stripe and Notion to track progress.",
        score: 92,
        theme: "DevTools",
        created_at: "2h ago"
    },
    {
        id: "2",
        name: "AI Email Triage for Support Teams",
        pitch: "Automatically drafts responses to common support tickets using historical data.",
        pain_insight: "Support teams are overwhelmed by repetitive queries.",
        score: 88,
        theme: "B2B",
        created_at: "4h ago"
    },
    {
        id: "3",
        name: "Local SEO Audit Tool for Agencies",
        pitch: "One-click report generation for local businesses to identify SEO gaps.",
        pain_insight: "Agencies spend too much time manually compiling audit reports.",
        score: 85,
        theme: "Marketing",
        created_at: "6h ago"
    },
    {
        id: "4",
        name: "Freelance Contract Generator",
        pitch: "Simple, legally binding contract generator for freelancers with e-signature.",
        pain_insight: "Freelancers often work without contracts due to complexity.",
        score: 81,
        theme: "Legal",
        created_at: "1d ago"
    },
];

const THEMES = ["All", "DevTools", "B2B", "Marketing", "Legal", "Health", "Finance"];

export default function IdeasPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 py-8">
                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Sidebar / Filters */}
                    <aside className="w-full md:w-[240px] flex-shrink-0 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Filter className="h-4 w-4" /> Filters
                            </h3>
                            <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
                                {THEMES.map((theme) => (
                                    <Button
                                        key={theme}
                                        variant={theme === "All" ? "default" : "ghost"}
                                        className="justify-start w-full"
                                    >
                                        {theme}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <div className="rounded-lg border bg-card p-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <Bell className="h-4 w-4" /> Get Alerts
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Subscribe to new ideas in your favorite themes.
                            </p>
                            <Button className="w-full" variant="outline">
                                Manage Subscriptions
                            </Button>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold">Fresh Ideas</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Sort by:</span>
                                <Button variant="ghost" size="sm" className="h-8 font-medium">
                                    Newest
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8">
                                    Score
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {MOCK_IDEAS.map((idea) => (
                                <Card key={idea.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-xl">{idea.name}</CardTitle>
                                                    <Badge variant="secondary">{idea.theme}</Badge>
                                                </div>
                                                <CardDescription>{idea.created_at}</CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                                                    <TrendingUp className="h-4 w-4" />
                                                    {idea.score}
                                                </div>
                                                <span className="text-xs text-muted-foreground">Potential Score</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">The Pitch</h4>
                                            <p className="text-muted-foreground">{idea.pitch}</p>
                                        </div>
                                        <div className="rounded-md bg-muted p-3">
                                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-1 text-orange-600">
                                                <Flame className="h-4 w-4" /> Pain Point Insight
                                            </h4>
                                            <p className="text-sm">{idea.pain_insight}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline">Save</Button>
                                        <Button>View Details</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="flex justify-center pt-8">
                            <Button variant="outline" className="mx-auto">
                                Load More Ideas
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
