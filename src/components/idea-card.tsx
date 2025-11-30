"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Copy } from "lucide-react";
import { formatDistanceToNow, isToday } from "date-fns";
import { Idea } from "@/lib/services/ideas";
// import { toast } from "sonner"; // Removed as requested to fix lint error 
// Checking package.json would be good, but I'll stick to standard window.alert or console if no toast lib found.
// Actually, I'll check if there is a toast component.
// I saw `src/components/ui` but didn't see toast. I'll use a simple copy feedback.

interface IdeaCardProps {
    idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
    const isNew = isToday(new Date(idea.created_at));

    const handleCopy = () => {
        const markdown = `
# ${idea.name}

**Score:** ${idea.score}
**Theme:** ${idea.theme?.name || 'N/A'}

## The Pitch
${idea.pitch}

## Pain Point Insight
${idea.key_pain_insight}
        `.trim();

        navigator.clipboard.writeText(markdown).then(() => {
            // You might want to add a toast notification here
            // For now, we'll just log it or maybe change button text temporarily
            alert("Copied to clipboard!");
        });
    };

    return (
        <Card className="relative">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{idea.name}</CardTitle>
                            {idea.theme && (
                                <Badge variant="secondary">{idea.theme.name}</Badge>
                            )}
                            {isNew && (
                                <Badge className=" bg-green-500">New</Badge>
                            )}

                        </div>
                        <CardDescription>
                            {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                            <TrendingUp className="h-4 w-4" />
                            {idea.score}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-muted-foreground">{idea.pitch}</p>
                </div>
                <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20 p-4">
                    <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">💡 Key Pain Point</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{idea.key_pain_insight}</p>
                </div>
                {idea.theme?.sources && idea.theme.sources.length > 0 && (
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">📚 Sources</h4>
                        <ul className="space-y-1">
                            {idea.theme.sources.slice(0, 5).map((source) => (
                                <li key={source.id} className="text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{source.source_type}</Badge>
                                        <span className="text-gray-600 dark:text-gray-400 truncate">{source.extracted_insight.substring(0, 80)}...</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                </Button>
            </CardFooter>
        </Card>
    );
}

function CardDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-muted-foreground">{children}</p>;
}
