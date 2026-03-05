"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Pencil } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UpdateTaskForm } from "@/components/tasks/update-task-form"

export default function UpdateTaskPage() {
    const params = useParams()
    const router = useRouter()
    const taskId = params.id as string

    const [task, setTask] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true)
                const res = await axios.get(`/api/tasks?taskId=${taskId}`)
                setTask(res.data)
            } catch (err: any) {
                console.error("Failed to fetch task", err)
                if (err.response?.status === 404) {
                    setError("Task not found.")
                } else {
                    setError("Failed to load task details.")
                }
            } finally {
                setLoading(false)
            }
        }

        if (taskId) fetchTask()
    }, [taskId])

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !task) {
        return (
            <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">{error || "Task not found."}</p>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
                    </Link>
                </Button>
            </div>
        )
    }

    const initialData = {
        Title: task.Title,
        Description: task.Description,
        Status: task.Status,
        Priority: task.Priority,
        DueDate: task.DueDate ? new Date(task.DueDate) : null,
        AssignedTo: task.AssignedTo,
    }

    return (
        <div className="flex h-full flex-col space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/tasks">Tasks</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/dashboard/tasks/${taskId}`}>{task.Title}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Update</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Pencil className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Update Task</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Editing &ldquo;{task.Title}&rdquo;
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="max-w-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Edit Task Details</CardTitle>
                        <CardDescription>
                            Make changes to the task below. Click save when you&apos;re done.
                        </CardDescription>
                        <Separator className="mt-2" />
                    </CardHeader>
                    <CardContent>
                        <UpdateTaskForm taskId={taskId} initialData={initialData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
