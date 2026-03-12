"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, Trash2, Loader2, ShieldAlert, Search, UserCog } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UserData {
    UserID: number
    UserName: string
    Email: string
    Role: string
}

export default function ManageUsersPage() {
    const router = useRouter()
    const [currentUser, setCurrentUser] = React.useState<UserData | null>(null)
    const [users, setUsers] = React.useState<UserData[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isAuthorized, setIsAuthorized] = React.useState(false)
    const [deletingId, setDeletingId] = React.useState<number | null>(null)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Fetch current user and all users
    React.useEffect(() => {
        const init = async () => {
            try {
                const meRes = await api.get("/auth/me")
                const me: UserData = meRes.data
                setCurrentUser(me)

                if (me.Role !== "Manager") {
                    setIsAuthorized(false)
                    setIsLoading(false)
                    return
                }

                setIsAuthorized(true)
                const usersRes = await api.get("/users")
                setUsers(usersRes.data)
            } catch {
                toast.error("Failed to load data")
            } finally {
                setIsLoading(false)
            }
        }
        init()
    }, [])

    const handleDeleteUser = async (userId: number) => {
        const isSelf = userId === currentUser?.UserID
        setDeletingId(userId)

        try {
            const res = await api.delete(`/users/${userId}`)

            if (res.data.selfDelete) {
                toast.success("Your account has been deleted. Redirecting to login…")
                setTimeout(() => router.push("/login"), 1500)
                return
            }

            toast.success("User deleted successfully")
            setUsers((prev) => prev.filter((u) => u.UserID !== userId))
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete user")
        } finally {
            setDeletingId(null)
        }
    }

    const filteredUsers = users.filter(
        (u) =>
            u.UserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.Role.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Access denied for non-managers
    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
                <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    You don&apos;t have permission to access this page.
                    Only users with the <strong>Manager</strong> role can manage user accounts.
                </p>
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-md">
                        <UserCog className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                        <p className="text-muted-foreground">
                            View and manage all user accounts in your workspace.
                        </p>
                    </div>
                </div>
            </div>
            <Separator />

            {/* Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="bg-gradient-to-br from-violet-500/5 to-blue-500/5 border-violet-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                <p className="text-3xl font-bold">{users.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-violet-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Managers</p>
                                <p className="text-3xl font-bold">
                                    {users.filter((u) => u.Role === "Manager").length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <ShieldAlert className="h-6 w-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-sky-500/5 to-cyan-500/5 border-sky-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Employees</p>
                                <p className="text-3xl font-bold">
                                    {users.filter((u) => u.Role === "Employee").length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-sky-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-sky-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or role…"
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        {/* Table Header */}
                        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_120px_80px] gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                            <span>User</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span className="text-center">Action</span>
                        </div>

                        {/* Table Body */}
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Users className="h-10 w-10 mb-3 opacity-40" />
                                <p className="font-medium">No users found</p>
                                <p className="text-sm">Try a different search query.</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelf = user.UserID === currentUser?.UserID
                                const initials = user.UserName.substring(0, 2).toUpperCase()

                                return (
                                    <div
                                        key={user.UserID}
                                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_80px] gap-2 sm:gap-4 px-4 py-3 items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                                    >
                                        {/* User */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 shrink-0">
                                                <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-primary text-xs font-semibold">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">
                                                    {user.UserName}
                                                    {isSelf && (
                                                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <p className="text-sm text-muted-foreground truncate">{user.Email}</p>

                                        {/* Role */}
                                        <div>
                                            <Badge
                                                variant={user.Role === "Manager" ? "default" : "secondary"}
                                                className={
                                                    user.Role === "Manager"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 hover:bg-sky-500/20"
                                                }
                                            >
                                                {user.Role}
                                            </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-center">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        disabled={deletingId === user.UserID}
                                                    >
                                                        {deletingId === user.UserID ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            {isSelf
                                                                ? "Delete your own account?"
                                                                : `Delete ${user.UserName}'s account?`}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {isSelf ? (
                                                                <>
                                                                    <strong className="text-destructive">Warning:</strong>{" "}
                                                                    This will permanently delete your account, all your
                                                                    projects, and associated data. You will be logged out
                                                                    immediately. This action cannot be undone.
                                                                </>
                                                            ) : (
                                                                <>
                                                                    This will permanently delete{" "}
                                                                    <strong>{user.UserName}</strong>&apos;s account and
                                                                    all associated data including their projects,
                                                                    comments, and history. Tasks assigned to them will be
                                                                    unassigned. This action cannot be undone.
                                                                </>
                                                            )}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteUser(user.UserID)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {isSelf ? "Delete My Account" : "Delete Account"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
