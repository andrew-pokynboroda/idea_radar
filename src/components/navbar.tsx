import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LogoText } from "@/components/logo";

export function Navbar() {
    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <LogoText />
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <Button asChild>
                            <Link href="/sign-in">Log In</Link>
                        </Button>
                    </SignedOut>
                    <SignedIn>
                        {/* Ideas link removed as it is the main page */}
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
