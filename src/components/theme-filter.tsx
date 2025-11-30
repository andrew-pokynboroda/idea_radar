"use client";

import { Button } from "@/components/ui/button";
import { Theme } from "@/lib/services/ideas";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface ThemeFilterProps {
    themes: Theme[];
}

export function ThemeFilter({ themes }: ThemeFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get selected themes from URL, default to empty (which means all in our logic, or we can make it explicit)
    // The requirement says "By default all is selected".
    // If URL param 'themes' is missing, we assume all.
    // If 'themes' is present, it's a comma-separated list of IDs.
    const selectedThemeIds = searchParams.get("themes")
        ? searchParams.get("themes")!.split(",").map(Number)
        : [];

    const isAllSelected = selectedThemeIds.length === 0;

    const toggleTheme = useCallback((themeId: number) => {
        const current = new Set(selectedThemeIds);
        if (current.has(themeId)) {
            current.delete(themeId);
        } else {
            current.add(themeId);
        }

        const params = new URLSearchParams(searchParams.toString());
        if (current.size === 0) {
            params.delete("themes");
        } else {
            params.set("themes", Array.from(current).join(","));
        }
        router.push(`?${params.toString()}`);
    }, [selectedThemeIds, searchParams, router]);

    const selectAll = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("themes");
        router.push(`?${params.toString()}`);
    }, [searchParams, router]);

    return (
        <div className="flex flex-wrap gap-2 md:flex-col md:items-start">
            <Button
                variant={isAllSelected ? "default" : "ghost"}
                className={cn("justify-start w-full", isAllSelected && "bg-primary text-primary-foreground")}
                onClick={selectAll}
            >
                All
            </Button>
            {themes.map((theme) => {
                const isSelected = selectedThemeIds.includes(theme.id);
                return (
                    <Button
                        key={theme.id}
                        variant={isSelected ? "default" : "ghost"}
                        className={cn("justify-start w-full", isSelected && "bg-primary text-primary-foreground")}
                        onClick={() => toggleTheme(theme.id)}
                    >
                        {theme.name}
                    </Button>
                );
            })}
        </div>
    );
}
