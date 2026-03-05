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
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Zod Validation Schema ──────────────────────────────────────────────
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Register Page Component ────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("Manager");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── Form Submit Handler ────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormValues) => {
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setIsLoading(true);

    try {
      // Step 1: Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
          phone: data.phone?.trim() || undefined,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      toast.success("Account created!", {
        description: "Sending verification code to your email...",
      });

      // Step 2: Trigger email verification
      const verifyResponse = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email.trim() }),
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        // Redirect to the verification page
        router.push(
          `/verify-email?email=${encodeURIComponent(data.email.trim())}&token=${encodeURIComponent(verifyData.token)}`
        );
      } else {
        // Registration succeeded but verification email failed — go to login
        toast.warning("Account created but verification email failed. You can login directly.", {
          duration: 5000,
        });
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left Side: Brand Panel ───────────────────────────────── */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
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

        {/* Steps */}
        <div className="relative z-10 space-y-6 my-auto">
          <h2 className="text-2xl font-semibold tracking-tight">
            Get started in<br />
            <span className="text-violet-400">3 simple steps.</span>
          </h2>
          <div className="space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <span className="text-violet-400 font-semibold text-xs">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Create your account</p>
                <p className="text-zinc-500 text-xs">Fill in your details and choose a role</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <span className="text-violet-400 font-semibold text-xs">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Verify your email</p>
                <p className="text-zinc-500 text-xs">Enter the 6-digit code we send you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <span className="text-violet-400 font-semibold text-xs">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Start managing tasks</p>
                <p className="text-zinc-500 text-xs">Create projects, invite your team, and go</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2 border-l-2 border-violet-500/50 pl-4">
            <p className="text-sm font-medium leading-relaxed text-zinc-300">
              &quot;The best time to organize your life was yesterday. The second best time is right now.&quot;
            </p>
            <footer className="text-xs text-zinc-500">— Daily Life Philosophy</footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right Side: Registration Form ────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative transition-colors duration-300">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ModeToggle />
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create your Daily Life</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to start your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                placeholder="John Doe"
                {...register("username")}
                disabled={isLoading}
                className={errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                disabled={isLoading}
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone + Role (side by side) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                  disabled={isLoading}
                  className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  defaultValue="Manager"
                  value={role}
                  onValueChange={(val) => setRole(val)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                disabled={isLoading}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className={
                  errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked === true);
                  if (checked) setTermsError(false);
                }}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-snug text-muted-foreground cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary text-primary"
                  target="_blank"
                >
                  terms and conditions
                </Link>
              </label>
            </div>
            {termsError && (
              <p className="text-xs text-red-500 -mt-2">You must accept the terms and conditions</p>
            )}

            {/* Submit Button */}
            <Button disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary font-medium text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}