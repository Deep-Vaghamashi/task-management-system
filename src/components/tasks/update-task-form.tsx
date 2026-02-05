"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.string(),
    priority: z.string(),
    dueDate: z.date().optional(),
    assignedTo: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface UpdateTaskFormProps {
    taskId: string | number
    initialData: {
        Title: string
        Description?: string | null
        Status: string
        Priority: string
        DueDate?: Date | null
        AssignedTo?: number | null
    }
}

export function UpdateTaskForm({ taskId, initialData }: UpdateTaskFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: initialData.Title,
            description: initialData.Description || "",
            status: initialData.Status,
            priority: initialData.Priority,
            dueDate: initialData.DueDate ? new Date(initialData.DueDate) : undefined,
            assignedTo: initialData.AssignedTo ? String(initialData.AssignedTo) : undefined,
        },
    })

    // Register fields manually since we don't have the Form component wrapper
    const { register, handleSubmit, setValue, watch, formState: { errors } } = form

    // Watch values for controlled components
    const dateValue = watch("dueDate")
    const statusValue = watch("status")
    const priorityValue = watch("priority")

    const onSubmit = async (data: TaskFormValues) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate,
                    assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update task")
            }

            toast.success("Task updated!")
            router.push(`/tasks/${taskId}`)
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Task title"
                    {...register("title")}
                    disabled={isLoading}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Task description"
                    className="min-h-[120px]"
                    {...register("description")}
                    disabled={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Status */}
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("status", val)}
                        defaultValue={statusValue}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div className="grid gap-2">
                    <Label>Priority</Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("priority", val)}
                        defaultValue={priorityValue}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Due Date */}
                <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateValue && "text-muted-foreground"
                                )}
                                disabled={isLoading}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateValue}
                                onSelect={(date) => setValue("dueDate", date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Assignee - Mocked for now */}
                <div className="grid gap-2">
                    <Label>Assignee</Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("assignedTo", val)}
                    //  defaultValue={form.getValues("assignedTo")} // tricky with controlled components if nil
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* In a real app, we'd fetch users */}
                            <SelectItem value="1">Me (Current User)</SelectItem>
                            <SelectItem value="2">Alex Johnson</SelectItem>
                            <SelectItem value="3">Sarah Smith</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Mocked user list</p>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
