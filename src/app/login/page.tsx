"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Chrome, Github, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.identifier || !formData.password) {
      toast.error("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Welcome back!", {
          description: "Login successful.",
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || "Login failed"}`);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* --- Left Side: Sidebar / Brand --- */}
      <div className="hidden lg:flex w-[40%] flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="0" cy="0" r="40" fill="currentColor" fillOpacity="0.5" />
            <path d="M0 100 L 100 0 L 100 100 Z" fill="currentColor" />
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
              "Productivity is the result of commitment to excellence, intelligent planning, and focused effort. Stay focused, stay consistent."
            </p>
            <footer className="text-sm opacity-80">— The Daily Focus</footer>
          </blockquote>
        </div>
      </div>

      {/* --- Right Side: Form Content --- */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background relative transition-colors duration-300">

        {/* Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ModeToggle />
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                name="identifier"
                placeholder="name@example.com"
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button disabled={isLoading} className="w-full">
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full">
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary font-medium text-primary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}