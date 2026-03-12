"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ListPlus } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TaskForm, TaskFormValues } from "@/components/dashboard/tasks/task-form"

export function CreateTaskPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const projectIdParam = searchParams.get("projectId")
    const projectId = projectIdParam ? parseInt(projectIdParam) : undefined

    const [isSaving, setIsSaving] = useState(false)

    const onSubmit = async (data: TaskFormValues) => {
        try {
            setIsSaving(true)
            const payload = {
                ...data,
                assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
                projectId: projectId || (data.projectId ? Number(data.projectId) : undefined),
            }

            await axios.post('/api/tasks', payload)
            toast.success('Task created successfully!', {
                description: `"${data.title}" has been added.`,
            })

            // Redirect back to the project page if created from there, otherwise to tasks
            if (projectId) {
                router.push(`/dashboard/projects/${projectId}`)
            } else {
                router.push('/dashboard/tasks')
            }
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.error || 'Failed to create task')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
                    <Link href={projectId ? `/dashboard/projects/${projectId}` : "/dashboard/tasks"}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {projectId ? 'Back to Project' : 'Back to Tasks'}
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <ListPlus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Fill in the details below to create a new task.
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Task Details</CardTitle>
                    <CardDescription>
                        Provide the title, project, priority, and other details for this task.
                    </CardDescription>
                    <Separator className="mt-2" />
                </CardHeader>
                <CardContent>
                    <TaskForm
                        onSubmit={onSubmit}
                        isSaving={isSaving}
                        projectId={projectId}
                        onCancel={() => router.push(projectId ? `/dashboard/projects/${projectId}` : '/dashboard/tasks')}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
