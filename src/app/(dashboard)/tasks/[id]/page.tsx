import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
    Calendar,
    User,
    Flag,
    Briefcase,
    Edit,
    Plus,
    ArrowLeft,
    CheckCircle2,
    Clock
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog"

// Mock Data Service
async function getTask(id: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (id === "error") throw new Error("Failed to fetch")
    if (id === "404") return null

    // Mock Task Object
    return {
        TaskID: id,
        Title: "Design System Update",
        Description: "We need to update the typography and color palette across the dashboard to match the new brand guidelines. Please review the Figma file and implement the changes in the theme-provider.",
        Status: "In Progress",
        Priority: "High",
        DueDate: new Date("2026-02-10T14:00:00"),
        CreatedAt: new Date("2026-02-01T09:30:00"),
        Assignee: {
            UserID: 1,
            UserName: "Alex Johnson",
            Email: "alex@example.com",
            AvatarUrl: "https://github.com/shadcn.png"
        },
        Project: {
            ProjectID: 101,
            ProjectName: "Website Redesign"
        }
    }
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TaskDetailsPage({ params }: PageProps) {
    const { id } = await params
    const task = await getTask(id)

    if (!task) {
        notFound()
    }

    // Helper for priority color
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "high": return "text-red-500"
            case "medium": return "text-yellow-500"
            case "low": return "text-blue-500"
            default: return "text-muted-foreground"
        }
    }

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{task.Title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{task.Title}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/create?projectId=${task.Project.ProjectID}`}>
                            <Plus className="mr-2 h-4 w-4" /> Add Related
                        </Link>
                    </Button>
                    <DeleteTaskDialog taskId={id} />
                </div>
            </div>

            <Separator />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Left Column: Context (2/3) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Description</CardTitle>
                                <Link
                                    href={`/projects/${task.Project.ProjectID}`}
                                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium hover:bg-accent"
                                >
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {task.Project.ProjectName}
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {task.Description ? (
                                <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                                    {task.Description}
                                </p>
                            ) : (
                                <p className="italic text-muted-foreground">No description provided.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subtasks (Optional visual placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Subtasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border bg-primary text-primary-foreground">
                                        <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                    <span className="text-sm line-through text-muted-foreground">Review API docs</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                                    <span className="text-sm">Update Theme config</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                                    <span className="text-sm">Test dark mode toggle</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Metadata (1/3) */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                                <Badge variant={task.Status === "Done" ? "default" : "secondary"}>
                                    {task.Status}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Priority</span>
                                <div className="flex items-center gap-2">
                                    <Flag className={`h-4 w-4 ${getPriorityColor(task.Priority)}`} />
                                    <span className="font-medium">{task.Priority}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Assignee */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Assignee</span>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={task.Assignee.AvatarUrl} />
                                        <AvatarFallback>
                                            {task.Assignee.UserName.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{task.Assignee.UserName}</span>
                                        <span className="text-xs text-muted-foreground">{task.Assignee.Email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{format(task.DueDate, "MMMM do, yyyy")}</span>
                                </div>
                            </div>

                            {/* Due Time */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Time</span>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{format(task.DueDate, "h:mm a")}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Created At */}
                            <div className="text-xs text-muted-foreground">
                                Created on {format(task.CreatedAt, "PPP")}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
