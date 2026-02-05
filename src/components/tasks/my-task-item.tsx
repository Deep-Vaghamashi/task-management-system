"use client"

import * as React from "react"
import { format } from "date-fns"
import { Check, Clock, AlertCircle, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
// We'll define a simpler Task type locally if needed or import a full one.
// Since we pass primitive values largely, we can define the prop type directly.
import { toggleTaskStatus } from "@/app/actions/task-actions"
import { Badge } from "@/components/ui/badge"

interface TaskItemProps {
    task: {
        TaskID: number
        Title: string
        Status: string
        Priority: string
        DueDate: Date | null
        TaskList: {
            ListName: string
            Project: {
                ProjectName: string
            }
        }
    }
}

export function MyTaskItem({ task }: TaskItemProps) {
    const [isDone, setIsDone] = React.useState(task.Status === "Done")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        const newStatus = !isDone
        // Optimistic update
        setIsDone(newStatus)

        try {
            const result = await toggleTaskStatus(task.TaskID, task.Status)
            if (!result.success) {
                setIsDone(!newStatus) // Revert
                toast.error("Failed to update status")
            }
        } catch (error) {
            setIsDone(!newStatus) // Revert
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "High":
                return <ArrowUp className="h-4 w-4 text-red-500" />
            case "Low":
                return <ArrowDown className="h-4 w-4 text-blue-500" />
            default:
                return <Minus className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div
            className={cn(
                "group flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent/50",
                isDone && "bg-muted/50 opacity-60"
            )}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border border-primary transition-all hover:bg-primary/20",
                        isDone ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-transparent"
                    )}
                >
                    {isDone && <Check className="h-4 w-4" />}
                </button>

                <div className="flex flex-col gap-1">
                    <span
                        className={cn(
                            "font-medium transition-all",
                            isDone && "text-muted-foreground line-through"
                        )}
                    >
                        {task.Title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] h-5">
                            {task.TaskList.Project.ProjectName}
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            {getPriorityIcon(task.Priority)} {task.Priority}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {task.DueDate && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.DueDate), "h:mm a")}
                    </div>
                )}
            </div>
        </div>
    )
}
