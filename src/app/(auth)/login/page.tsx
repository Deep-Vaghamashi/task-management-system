"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";

// ── Zod Validation Schema ──────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Username or email is required")
    .min(3, "Must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── SVG Icons for Social Buttons ───────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ── Login Page Component ───────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // ── Form Submit Handler ────────────────────────────────────────────
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: data.identifier.trim(),
          password: data.password,
        }),
      });

      if (response.ok) {
        toast.success("Welcome back!", {
          description: "Login successful. Redirecting...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Social Login Handler ───────────────────────────────────────────
  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      // Redirect to the OAuth provider's route
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      toast.error(`Failed to connect with ${provider}. Please try again.`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left Side: Brand Panel ───────────────────────────────── */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-violet-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
              DL
            </div>
            <span className="text-xl tracking-tight">Daily Life</span>
          </div>
        </div>

        {/* Features list */}
        <div className="relative z-10 space-y-6 my-auto">
          <h2 className="text-2xl font-semibold tracking-tight">
            Organize your work,<br />
            <span className="text-violet-400">amplify your impact.</span>
          </h2>
          <div className="space-y-4 text-sm text-zinc-400">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-violet-400 text-xs">✓</span>
              </div>
              <span>Manage projects and tasks with an intuitive Kanban board</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-violet-400 text-xs">✓</span>
              </div>
              <span>Real-time analytics and team performance insights</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-5 w-5 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-violet-400 text-xs">✓</span>
              </div>
              <span>Collaborate with your team across multiple projects</span>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2 border-l-2 border-violet-500/50 pl-4">
            <p className="text-sm font-medium leading-relaxed text-zinc-300">
              &quot;Daily Life transformed how our team tracks tasks. We shipped 40% faster in our first month.&quot;
            </p>
            <footer className="text-xs text-zinc-500">— Engineering Team Lead, TechCorp</footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right Side: Login Form ───────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative transition-colors duration-300">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ModeToggle />
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null || isLoading}
              className="w-full"
            >
              {socialLoading === "google" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span className="ml-2">Google</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              disabled={socialLoading !== null || isLoading}
              className="w-full"
            >
              {socialLoading === "github" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GithubIcon />
              )}
              <span className="ml-2">GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Identifier Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                placeholder="name@example.com"
                {...register("identifier")}
                disabled={isLoading}
                className={errors.identifier ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.identifier && (
                <p className="text-xs text-red-500">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                disabled={isLoading}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button disabled={isLoading || socialLoading !== null} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary font-medium text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}