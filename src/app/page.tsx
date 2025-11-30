import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, BarChart3, Check, Lightbulb, Mail, Search, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid items-center gap-6 pb-8 pt-6 md:py-10 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              🚀 Best Idea Finder Tool
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Find & Validate <br className="hidden sm:inline" />
              SaaS Ideas Instantly
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Discover high-potential SaaS ideas from Reddit pain points.
              We analyze thousands of discussions to find problems worth solving.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#features">Explore More</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gray-300" />
                ))}
              </div>
              <p>Trusted by 1,000+ Indie Hackers</p>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[500px] lg:mr-0">
            {/* Abstract Dashboard Visual */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative h-full w-full rounded-2xl border bg-background/50 p-6 shadow-2xl backdrop-blur-sm">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">Idea Validation</h3>
                    <p className="text-xs text-muted-foreground">Real-time analysis</p>
                  </div>
                  <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    +12.5%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-card p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Search className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">1.2k</div>
                    <p className="text-xs text-muted-foreground">Pain Points Found</p>
                  </div>
                  <div className="rounded-xl border bg-card p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">85</div>
                    <p className="text-xs text-muted-foreground">Generated Ideas</p>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-medium">Trend Analysis</h4>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex h-32 items-end justify-between gap-2">
                    {[40, 70, 45, 90, 60, 80, 55].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t-sm bg-primary/20 transition-all hover:bg-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              Features
            </div>
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              Most Essential Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to find your next big SaaS idea.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-8 mt-12">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Zap className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Automated Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    AI evaluates ideas based on pain intensity, market size, and competition.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Mail className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Thematic Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to specific niches and get alerts when new problems arise.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Lightbulb className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Pitch Generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Get ready-to-use elevator pitches and value propositions generated by AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-24 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Why use Idea Radar?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Stop guessing what to build. Start solving real problems.
                </p>
                <ul className="space-y-4">
                  {[
                    "Save 100+ hours of manual research",
                    "Validate ideas before writing code",
                    "Find underserved niches with high demand",
                    "Get daily inspiration delivered to your inbox"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                        <ArrowRight className="h-3 w-3 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="mt-4" asChild>
                  <Link href="/sign-up">Start Finding Ideas</Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-background p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">R</div>
                    <div>
                      <p className="font-medium">r/SaaS</p>
                      <p className="text-xs text-muted-foreground">Posted 2 hours ago</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">"I wish there was a tool that..."</h4>
                    <p className="text-sm text-muted-foreground">
                      I spend hours every week trying to find... is there any software that automates this? I'd pay $50/mo easily.
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-xs font-semibold text-primary uppercase mb-1">Idea Radar Detected</p>
                    <p className="text-sm font-medium">High Pain Point: Manual Research Automation</p>
                    <p className="text-xs text-muted-foreground mt-1">Potential Revenue: $50/mo/user</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
              Simple Pricing
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Get full access to all features during our beta period.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-[400px]">
            <div className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-2xl">Beta Access</h3>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Limited Time
                </div>
              </div>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-muted-foreground">
                {[
                  "Unlimited idea generation",
                  "Full access to pain point database",
                  "Weekly trend reports",
                  "Priority support"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/sign-up">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
