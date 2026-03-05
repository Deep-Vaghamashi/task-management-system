"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, FileText, Flag, Tag, Clock, UserIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
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
    title: z.string().min(1, "Title is required").max(100),
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

interface UserOption {
    UserID: number
    UserName: string
    Email: string
}

const PRIORITY_CONFIG = [
    { value: 'Low', color: 'bg-emerald-500' },
    { value: 'Medium', color: 'bg-amber-500' },
    { value: 'High', color: 'bg-red-500' },
]

const STATUS_CONFIG = [
    { value: 'Pending', color: 'bg-slate-500' },
    { value: 'In Progress', color: 'bg-blue-500' },
    { value: 'Done', color: 'bg-emerald-500' },
]

export function UpdateTaskForm({ taskId, initialData }: UpdateTaskFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [users, setUsers] = React.useState<UserOption[]>([])

    // Fetch real users for assignee dropdown
    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users')
                setUsers(res.data)
            } catch (error) {
                console.error("Failed to load users", error)
            }
        }
        fetchUsers()
    }, [])

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

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form

    const dateValue = watch("dueDate")
    const statusValue = watch("status")
    const priorityValue = watch("priority")
    const descValue = watch("description") || ""

    const currentPriority = PRIORITY_CONFIG.find(p => p.value === priorityValue)
    const currentStatus = STATUS_CONFIG.find(s => s.value === statusValue)

    const onSubmit = async (data: TaskFormValues) => {
        setIsLoading(true)
        try {
            await axios.put('/api/tasks', {
                taskId: Number(taskId),
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                dueDate: data.dueDate,
                assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null,
            })

            toast.success("Task updated!", {
                description: `"${data.title}" has been saved.`,
            })
            router.push('/dashboard/tasks')
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.response?.data?.error || "Failed to update task")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="grid gap-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Title
                </Label>
                <Input
                    id="title"
                    placeholder="Task title"
                    className="h-10"
                    {...register("title")}
                    disabled={isLoading}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Add details about this task..."
                    className="min-h-[120px] resize-none"
                    {...register("description")}
                    disabled={isLoading}
                />
                <p className="text-[11px] text-muted-foreground">
                    {descValue.length}/255 characters
                </p>
            </div>

            <Separator />

            {/* Status & Priority */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        Status
                    </Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("status", val)}
                        defaultValue={statusValue}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                {currentStatus && (
                                    <div className={cn("w-2 h-2 rounded-full", currentStatus.color)} />
                                )}
                                <SelectValue placeholder="Select status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_CONFIG.map(s => (
                                <SelectItem key={s.value} value={s.value}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", s.color)} />
                                        {s.value}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                        Priority
                    </Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("priority", val)}
                        defaultValue={priorityValue}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                {currentPriority && (
                                    <div className={cn("w-2 h-2 rounded-full", currentPriority.color)} />
                                )}
                                <SelectValue placeholder="Select priority" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_CONFIG.map(p => (
                                <SelectItem key={p.value} value={p.value}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", p.color)} />
                                        {p.value}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date & Assignee */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Due Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal h-10",
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
                            {dateValue && (
                                <div className="p-2 border-t">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => setValue("dueDate", undefined)}
                                    >
                                        Clear date
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        Assignee
                    </Label>
                    <Select
                        disabled={isLoading}
                        onValueChange={(val) => setValue("assignedTo", val === "unassigned" ? undefined : val)}
                        defaultValue={initialData.AssignedTo ? String(initialData.AssignedTo) : undefined}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">
                                <span className="text-muted-foreground">Unassigned</span>
                            </SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.UserID} value={String(u.UserID)}>
                                    {u.UserName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3 pt-2">
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
