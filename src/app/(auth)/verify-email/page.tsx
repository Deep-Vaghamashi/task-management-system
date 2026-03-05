"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus the first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pasted = value.slice(0, 6).split("");
            const newCode = [...code];
            pasted.forEach((char, i) => {
                if (index + i < 6) newCode[index + i] = char;
            });
            setCode(newCode);
            const nextIndex = Math.min(index + pasted.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            toast.error("Please enter the complete 6-digit code.");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await fetch("/api/auth/verify-email/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, code: fullCode }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Email verified successfully!", {
                    description: "Redirecting to login...",
                });
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                toast.error(data.error || "Invalid verification code.");
                setCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Email address not found.");
            return;
        }

        setIsResending(true);
        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("New verification code sent!");
                // Update the token in URL
                const newUrl = `/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.token)}`;
                router.replace(newUrl);
                setCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                toast.error(data.error || "Failed to resend code.");
            }
        } catch (error) {
            toast.error("Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (code.every((d) => d !== "")) {
            handleVerify();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side: Brand */}
            <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-0 w-72 h-72 bg-green-600/10 rounded-full -translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-600/10 rounded-full translate-x-1/3 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 font-bold text-xl">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                            DL
                        </div>
                        <span className="text-xl tracking-tight">Daily Life</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <blockquote className="space-y-2 border-l-2 border-violet-500/50 pl-4">
                        <p className="text-sm font-medium leading-relaxed text-zinc-300">
                            &quot;One more step to unlock your productivity dashboard. Verify your email and get started.&quot;
                        </p>
                        <footer className="text-xs text-zinc-500">— Almost There!</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Verification Form */}
            <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative transition-colors duration-300">
                <div className="absolute top-4 right-4 md:top-8 md:right-8">
                    <ModeToggle />
                </div>

                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col items-center space-y-3 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            We sent a 6-digit verification code to{" "}
                            <strong className="text-foreground">{email || "your email"}</strong>
                        </p>
                    </div>

                    {/* Code Input */}
                    <div className="flex justify-center gap-2">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                disabled={isVerifying}
                                className="h-14 w-12 text-center text-xl font-bold tracking-widest"
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <Button
                        onClick={handleVerify}
                        disabled={isVerifying || code.some((d) => d === "")}
                        className="w-full"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>

                    {/* Resend + Back */}
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-muted-foreground"
                        >
                            {isResending ? (
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-3 w-3" />
                            )}
                            Resend code
                        </Button>

                        <Link
                            href="/register"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
}
