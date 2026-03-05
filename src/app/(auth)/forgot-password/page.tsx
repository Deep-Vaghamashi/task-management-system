"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email address.");
            return;
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                toast.success("Check your email for a reset link.");
            } else {
                const data = await response.json();
                toast.error(data.error || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side: Brand */}
            <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="80" cy="20" r="30" fill="currentColor" />
                        <circle cx="20" cy="80" r="25" fill="currentColor" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">D</div>
                        Daily Life
                    </div>
                </div>

                <div className="relative z-10 mt-auto mb-20">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            &quot;Security is not about paranoia — it&apos;s about protecting what matters most. Reset, recover, and get back on track.&quot;
                        </p>
                        <footer className="text-sm opacity-80">— Safe & Sound</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative transition-colors duration-300">
                <div className="absolute top-4 right-4 md:top-8 md:right-8">
                    <ModeToggle />
                </div>

                <div className="w-full max-w-sm space-y-6">
                    {!isSubmitted ? (
                        <>
                            <div className="flex flex-col space-y-2 text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
                                <p className="text-sm text-muted-foreground">
                                    No worries — enter your email and we&apos;ll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button disabled={isLoading} className="w-full">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                                <Mail className="h-8 w-8 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                We sent a password reset link to <strong>{email}</strong>. The link expires in 15 minutes.
                            </p>
                            <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-2">
                                Didn&apos;t receive it? Try again
                            </Button>
                        </div>
                    )}

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
