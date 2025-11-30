export function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Idea Radar. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-sm text-muted-foreground hover:underline">
                            Terms
                        </a>
                        <a href="#" className="text-sm text-muted-foreground hover:underline">
                            Privacy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
