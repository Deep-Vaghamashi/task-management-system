import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import {
    Calendar,
    User,
    Flag,
    Briefcase,
    Edit,
    ArrowLeft,
    Clock,
    MessageSquare,
} from "lucide-react"

import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

// ── Data Fetching ─────────────────────────────────────────────────────
async function getTask(id: string) {
    const taskId = parseInt(id, 10)
    if (isNaN(taskId)) return null

    const task = await prisma.task.findUnique({
        where: { TaskID: taskId },
        include: {
            Assignee: {
                select: { UserID: true, UserName: true, Email: true },
            },
            TaskList: {
                select: {
                    ListName: true,
                    Project: {
                        select: { ProjectID: true, ProjectName: true },
                    },
                },
            },
            Comments: {
                include: {
                    User: { select: { UserName: true } },
                },
                orderBy: { CreatedAt: "desc" },
                take: 10,
            },
            History: {
                include: {
                    User: { select: { UserName: true } },
                },
                orderBy: { ChangeTime: "desc" },
                take: 5,
            },
        },
    })

    return task
}

// ── Helpers ───────────────────────────────────────────────────────────
function getPriorityColor(priority: string) {
    switch (priority.toLowerCase()) {
        case "high": return "text-red-500"
        case "medium": return "text-amber-500"
        case "low": return "text-blue-500"
        default: return "text-muted-foreground"
    }
}

function getPriorityBadge(priority: string): "default" | "secondary" | "outline" | "destructive" {
    switch (priority.toLowerCase()) {
        case "high": return "destructive"
        case "medium": return "outline"
        case "low": return "secondary"
        default: return "outline"
    }
}

function getStatusBadge(status: string): "default" | "secondary" | "outline" {
    switch (status) {
        case "Completed": return "default"
        case "InProgress":
        case "In Progress": return "secondary"
        default: return "outline"
    }
}

function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// ── Page ──────────────────────────────────────────────────────────────
interface PageProps {
    params: Promise<{ id: string }>
}

export default async function TaskDetailsPage({ params }: PageProps) {
    const { id } = await params
    const task = await getTask(id)

    if (!task) {
        notFound()
    }

    const project = task.TaskList.Project

    return (
        <div className="flex h-full flex-col space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/tasks">Tasks</BreadcrumbLink>
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
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/tasks">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/tasks/${id}/update`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                    <DeleteTaskDialog taskId={id} />
                </div>
            </div>

            <Separator />

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Left Column: Content (2/3) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Description Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Description</CardTitle>
                                <Link
                                    href={`/dashboard/projects/${project.ProjectID}`}
                                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium hover:bg-accent transition-colors"
                                >
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    {project.ProjectName}
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

                    {/* Comments Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg">
                                    Comments ({task.Comments.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {task.Comments.length > 0 ? (
                                <div className="space-y-4">
                                    {task.Comments.map((comment) => (
                                        <div key={comment.CommentID} className="flex gap-3">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                                                    {getInitials(comment.User.UserName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{comment.User.UserName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(comment.CreatedAt), "MMM d, yyyy 'at' h:mm a")}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{comment.CommentText}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity History */}
                    {task.History.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {task.History.map((entry) => (
                                        <div key={entry.HistoryID} className="flex items-center gap-3 text-sm">
                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            <span className="text-muted-foreground">
                                                <span className="font-medium text-foreground">{entry.User.UserName}</span>
                                                {" "}{entry.ChangeType}
                                            </span>
                                            <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                                                {format(new Date(entry.ChangeTime), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
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
                                <Badge variant={getStatusBadge(task.Status)}>
                                    {task.Status}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Priority</span>
                                <div className="flex items-center gap-2">
                                    <Flag className={`h-4 w-4 ${getPriorityColor(task.Priority)}`} />
                                    <Badge variant={getPriorityBadge(task.Priority)}>
                                        {task.Priority}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Task List</span>
                                <span className="text-sm">{task.TaskList.ListName}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Assignee */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Assignee</span>
                                {task.Assignee ? (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-xs">
                                                {getInitials(task.Assignee.UserName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{task.Assignee.UserName}</span>
                                            <span className="text-xs text-muted-foreground">{task.Assignee.Email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                                {task.DueDate ? (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{format(new Date(task.DueDate), "MMMM do, yyyy")}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No due date set</span>
                                )}
                            </div>

                            <Separator />

                            {/* Created At */}
                            <div className="text-xs text-muted-foreground">
                                Created on {format(new Date(task.CreatedAt), "PPP")}
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
