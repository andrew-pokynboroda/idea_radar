"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, ExternalLink, Copy } from "lucide-react";
import { formatDistanceToNow, isToday } from "date-fns";
import { Idea } from "@/lib/services/ideas";

interface IdeaCardProps {
    idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
    const isNew = isToday(new Date(idea.created_at));
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Parse MVP if it's a JSON string
    let mvpData: { scope?: string; components?: string[]; estimated_time?: string } | null = null;
    let mvpText: string | null = null;

    try {
        if (idea.mvp) {
            if (typeof idea.mvp === 'string') {
                // Try to parse as JSON
                try {
                    const parsed = JSON.parse(idea.mvp);
                    // Check if it looks like our structured MVP object
                    if (parsed && (parsed.scope || parsed.components || parsed.estimated_time)) {
                        mvpData = parsed;
                    } else {
                        // If it parses but doesn't have our structure, or is just a string
                        mvpText = typeof parsed === 'string' ? parsed : idea.mvp;
                    }
                } catch {
                    // If parsing fails, treat as plain text
                    mvpText = idea.mvp;
                }
            } else {
                mvpData = idea.mvp;
            }
        }
    } catch (e) {
        console.error('Error parsing MVP data:', e);
        mvpText = String(idea.mvp);
    }

    const handleCopyAll = () => {
        let mvpContent = 'N/A';
        if (mvpData) {
            mvpContent = `
**Scope:** ${mvpData.scope || 'N/A'}

**Components:**
${mvpData.components?.map(c => `- ${c}`).join('\n') || 'N/A'}

**Estimated Time:** ${mvpData.estimated_time || 'N/A'}
`.trim();
        } else if (mvpText) {
            mvpContent = mvpText;
        }

        const markdown = `
# ${idea.name}

**Score:** ${idea.score}
**Theme:** ${idea.theme?.name || 'N/A'}

## The Pitch
${idea.pitch}

## Pain Point Insight
${idea.key_pain_insight}

## MVP
${mvpContent}

## Sources
${idea.sources?.map((s: any) => `- [${s.source_type}](${s.url})`).join('\n') || 'N/A'}
        `.trim();

        navigator.clipboard.writeText(markdown).then(() => {
            alert("Copied to clipboard!");
        });
    };

    return (
        <>
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
                                    <Badge className="bg-green-500">New</Badge>
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

                    <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20 p-4">
                        <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2">💡 Key Pain Point</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{idea.key_pain_insight}</p>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                        More
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            {idea.name}
                            {idea.theme && (
                                <Badge variant="secondary">{idea.theme.name}</Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-green-600 font-bold">
                                    <TrendingUp className="h-4 w-4" />
                                    Score: {idea.score}
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Pitch */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2">The Pitch</h3>
                            <p className="text-muted-foreground">{idea.pitch}</p>
                        </div>

                        {/* Pain Point */}
                        <div className="rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20 p-4">
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">💡 Key Pain Point</h3>
                            <p className="text-gray-700 dark:text-gray-300">{idea.key_pain_insight}</p>
                        </div>

                        {/* MVP */}
                        {(mvpData || mvpText) && (
                            <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 p-4">
                                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🚀 MVP Definition</h3>

                                {mvpData ? (
                                    <>
                                        {mvpData.scope && (
                                            <div className="mb-3">
                                                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Scope</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{mvpData.scope}</p>
                                            </div>
                                        )}

                                        {mvpData.components && mvpData.components.length > 0 && (
                                            <div className="mb-3">
                                                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Components</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {mvpData.components.map((component, idx) => (
                                                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">{component}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {mvpData.estimated_time && (
                                            <div>
                                                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Estimated Time</h4>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{mvpData.estimated_time}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{mvpText}</p>
                                )}
                            </div>
                        )}

                        {/* Sources with Links */}
                        {idea.sources && idea.sources.length > 0 && (
                            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">📚 Sources</h3>
                                <ul className="space-y-3">
                                    {idea.sources.map((source: any) => (
                                        <li key={source.id} className="border-b border-blue-200 dark:border-blue-800 last:border-0 pb-3 last:pb-0">
                                            <div className="flex items-start gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">{source.source_type}</Badge>
                                                <a
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    View Source
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{source.url}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Copy All Button */}
                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={handleCopyAll}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy All as Markdown
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CardDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-muted-foreground">{children}</p>;
}
