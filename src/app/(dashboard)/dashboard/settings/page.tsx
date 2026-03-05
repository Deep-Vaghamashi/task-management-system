"use client"

import * as React from "react"
import { User, Lock, Bell, Moon, Sun, Camera, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface UserData {
    UserID: number;
    UserName: string;
    Email: string;
    Role: string;
}

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // User data from API
    const [user, setUser] = React.useState<UserData | null>(null)
    const [isLoadingUser, setIsLoadingUser] = React.useState(true)

    // Profile form
    const [name, setName] = React.useState("")
    const [isSavingProfile, setIsSavingProfile] = React.useState(false)

    // Password form
    const [currentPassword, setCurrentPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [isSavingPassword, setIsSavingPassword] = React.useState(false)

    // Preferences (local state — no API for these yet)
    const [emailNotifications, setEmailNotifications] = React.useState(true)
    const [taskReminders, setTaskReminders] = React.useState(true)

    // Fetch user data on mount
    React.useEffect(() => {
        setMounted(true)

        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me')
                setUser(res.data)
                setName(res.data.UserName)
            } catch (error) {
                toast.error("Failed to load user data")
            } finally {
                setIsLoadingUser(false)
            }
        }
        fetchUser()
    }, [])

    // Save Profile
    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error("Name cannot be empty")
            return
        }
        if (name.trim() === user?.UserName) {
            toast.info("No changes to save")
            return
        }

        setIsSavingProfile(true)
        try {
            const res = await api.patch('/auth/profile', { username: name.trim() })
            setUser(res.data)
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update profile")
        } finally {
            setIsSavingProfile(false)
        }
    }

    // Update Password
    const handleUpdatePassword = async () => {
        if (!currentPassword) {
            toast.error("Please enter your current password")
            return
        }
        if (!newPassword) {
            toast.error("Please enter a new password")
            return
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match")
            return
        }

        setIsSavingPassword(true)
        try {
            await api.post('/auth/change-password', {
                currentPassword,
                newPassword,
            })
            toast.success("Password updated successfully")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update password")
        } finally {
            setIsSavingPassword(false)
        }
    }

    if (!mounted) return null

    const userInitials = user
        ? user.UserName.substring(0, 2).toUpperCase()
        : "..."

    return (
        <div className="flex flex-col space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Lock className="h-4 w-4" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Bell className="h-4 w-4" /> Preferences
                    </TabsTrigger>
                </TabsList>

                {/* ── Profile Tab ─────────────────────────────────────── */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Update your personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {isLoadingUser ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-primary text-2xl font-semibold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="font-medium">{user?.UserName}</p>
                                            <p className="text-sm text-muted-foreground">{user?.Email}</p>
                                            <Button variant="outline" size="sm" className="mt-2 gap-2">
                                                <Camera className="h-3 w-3" />
                                                Change Photo
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={isSavingProfile}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Input
                                                id="role"
                                                value={user?.Role || ""}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={user?.Email || ""}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile || isLoadingUser}
                            >
                                {isSavingProfile ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ── Security Tab ────────────────────────────────────── */}
                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password. Use a strong password with at least 8 characters.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={isSavingPassword}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isSavingPassword}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isSavingPassword}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleUpdatePassword}
                                disabled={isSavingPassword}
                            >
                                {isSavingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ── Preferences Tab ─────────────────────────────────── */}
                <TabsContent value="preferences" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Theme Mode</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Select your preferred theme.
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-md border p-1 bg-muted">
                                    <Button
                                        variant={theme === 'light' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-7 w-7 p-0 rounded-sm"
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-7 w-7 p-0 rounded-sm"
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Configure how you receive alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Receive emails about your account activity and project updates.
                                    </div>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Task Reminders</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Get notified when a task due date is approaching.
                                    </div>
                                </div>
                                <Switch
                                    checked={taskReminders}
                                    onCheckedChange={setTaskReminders}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
