"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Label } from "@radix-ui/react-label"

const setupSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type SetupFormValues = z.infer<typeof setupSchema>

function JoinPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [isVerifying, setIsVerifying] = useState(true)
    const [isValid, setIsValid] = useState(false)
    const [userData, setUserData] = useState<{ name: string; email: string } | null>(
        null
    )
    const [error, setError] = useState<string | null>(null)

    // 1. Verification Effect
    useEffect(() => {
        async function verifyToken() {
            if (!token) {
                setIsVerifying(false)
                setError("No invitation token found.")
                return
            }

            try {
                const res = await fetch(`/api/team/invite/verify?token=${token}`)
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || "Invalid or expired link")
                }

                setUserData(data)
                setIsValid(true)
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError("An unknown error occurred")
                }
            } finally {
                setIsVerifying(false)
            }
        }

        verifyToken()
    }, [token])

    // 2. Form Setup
    const form = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    // 3. Submit Handler
    async function onSubmit(values: SetupFormValues) {
        try {
            const res = await fetch("/api/auth/complete-registration", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password: values.password,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to complete registration")
            }

            toast.success("Account set up successfully!")
            router.push("/login")
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message)
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        }
    }

    // Render: Loading State
    if (isVerifying) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying your invitation...</p>
                </div>
            </div>
        )
    }

    // Render: Invalid/Error State
    if (!isValid || error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error || "Invalid or expired link"}</AlertDescription>
                        </Alert>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={() => router.push("/login")} variant="outline">
                                Back to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Render: Valid State (Setup Form)
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Welcome, {userData?.name}!</CardTitle>
                    <CardDescription>
                        Set your password to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email (Read-only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={userData?.email || ""}
                                    disabled
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Complete Setup
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function JoinPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <JoinPageContent />
        </Suspense>
    )
}
