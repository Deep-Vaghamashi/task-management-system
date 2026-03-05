"use client";

import Link from "next/link";
import {
  CheckCircle2,
  BarChart3,
  Users,
  Kanban,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  ListTodo,
  Calendar,
  Bell,
  FolderKanban,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Features Data ─────────────────────────────────────────────────────
const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Create, organize, and track projects with status tracking, due dates, and team member assignments.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: ListTodo,
    title: "Smart Task Tracking",
    description: "Personal to-do lists with overdue/today/upcoming groups, priority sorting, and quick-add functionality.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Kanban,
    title: "Kanban & Scheduler",
    description: "Drag-and-drop weekly scheduler and task board to visually organize your workflow.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Live dashboards with completion trends, team workload charts, and project status distribution.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite members with role-based access, assign tasks, and track team performance together.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "JWT authentication, password hashing, email verification, and role-based access control.",
    color: "from-slate-500 to-zinc-600",
  },
];

// ── How It Works Steps ────────────────────────────────────────────────
const steps = [
  {
    step: "01",
    title: "Create an Account",
    description: "Sign up with your email, choose a role, and verify your email to get started.",
    icon: Shield,
  },
  {
    step: "02",
    title: "Set Up Projects",
    description: "Create projects, set due dates, add descriptions, and invite team members.",
    icon: FolderKanban,
  },
  {
    step: "03",
    title: "Assign & Track Tasks",
    description: "Break projects into tasks, assign them to team members, set priorities and deadlines.",
    icon: ListTodo,
  },
  {
    step: "04",
    title: "Monitor Progress",
    description: "Use dashboards and analytics to track team performance and stay on top of everything.",
    icon: BarChart3,
  },
];

// ── Stats ─────────────────────────────────────────────────────────────
const stats = [
  { value: "22+", label: "Pages Built" },
  { value: "21", label: "API Endpoints" },
  { value: "7", label: "Data Models" },
  { value: "100%", label: "Real Data" },
];

// ── Page Component ────────────────────────────────────────────────────
export default function HeroPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="font-bold text-lg tracking-tight">Daily Life</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#stats" className="text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-violet-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-blue-600/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm font-medium border-violet-500/30 text-violet-500">
              <Zap className="mr-1.5 h-3.5 w-3.5" /> Built with Next.js, Prisma & shadcn/ui
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Manage Your{" "}
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Daily Life
              </span>{" "}
              with Clarity
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The all-in-one task management system to organize projects, track team progress,
              and hit your deadlines — beautifully.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 h-12 px-8 text-base" asChild>
                <Link href="/register">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/login">
                  Sign In to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-16 sm:mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-2xl opacity-50" />
            <div className="relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted/60 rounded-md px-4 py-1 text-xs text-muted-foreground w-64 text-center">
                    localhost:3000/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard grid preview */}
              <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Stat cards */}
                {["Total Projects", "Active Tasks", "Completed", "Team Members"].map((label, i) => (
                  <div key={i} className="rounded-lg border border-border/40 bg-background/50 p-4 space-y-2">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-2xl font-bold">{[12, 34, 89, 5][i]}</div>
                    <div className={`h-1.5 rounded-full w-${[8, 10, 16, 6][i]}/12 ${["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"][i]}`} />
                  </div>
                ))}
                {/* Chart placeholder */}
                <div className="col-span-3 rounded-lg border border-border/40 bg-background/50 p-4 h-32">
                  <div className="text-xs text-muted-foreground mb-3">Task Completion Trend</div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 55, 35, 70, 50, 80, 60, 90, 75, 85, 95, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-violet-500 to-blue-500 rounded-sm opacity-60"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                {/* Team placeholder */}
                <div className="rounded-lg border border-border/40 bg-background/50 p-4 h-32">
                  <div className="text-xs text-muted-foreground mb-3">Team</div>
                  <div className="flex flex-col gap-2">
                    {["AJ", "SK", "MR"].map((initials, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-medium">
                          {initials}
                        </div>
                        <div className="h-2 rounded-full bg-muted flex-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 py-1 px-3">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Stay Organized
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete toolkit for managing projects, tasks, and teams — all in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:shadow-lg hover:border-violet-500/30 hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 border-t border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 py-1 px-3">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                4 Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-violet-500/40 to-blue-500/40" />
                  )}

                  <div className="relative inline-flex mb-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-violet-500" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Section ──────────────────────────────────── */}
      <section id="stats" className="py-20 sm:py-28 border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-violet-600/5 via-blue-600/5 to-cyan-600/5 p-10 sm:p-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Built for Real-World Use
              </h2>
              <p className="mt-2 text-muted-foreground">
                A full-stack application with no mock data left behind.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[300px] bg-gradient-to-r from-violet-600/15 to-blue-600/15 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to Take Control of{" "}
                <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Your Workflow?
                </span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
                Join now and start managing your projects, tasks, and team like a pro.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 h-12 px-8 text-base" asChild>
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/login">
                    I Already Have an Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                D
              </div>
              <span className="font-semibold">Daily Life</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Daily Life. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
