import { notFound } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UpdateTaskForm } from "@/components/tasks/update-task-form"

// Mock Data Service (Matching Detail Page logic for consistency)
async function getTask(id: string) {
    // Simulate delay
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
        Assignee: 1, // Using ID for form
        Project: {
            ProjectID: 101,
            ProjectName: "Website Redesign"
        }
    }
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function UpdateTaskPage({ params }: PageProps) {
    const { id } = await params
    const task = await getTask(id)

    if (!task) {
        notFound()
    }

    // Transform for form
    const initialData = {
        Title: task.Title,
        Description: task.Description,
        Status: task.Status,
        Priority: task.Priority,
        DueDate: task.DueDate,
        AssignedTo: task.Assignee
    }

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/tasks">Tasks</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/tasks/${id}`}>{task.Title}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Update</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-2xl font-bold tracking-tight">Update Task</h1>
            </div>

            <div className="grid gap-6">
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Task Details</CardTitle>
                        <CardDescription>
                            Make changes to the task here. Click save when you&apos;re done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdateTaskForm taskId={id} initialData={initialData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
