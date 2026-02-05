"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/components/tasks/columns"
import { cn } from "@/lib/utils"

interface TaskCardProps {
    task: Task
}

export function TaskCard({ task }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id, data: { task } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "High":
                return "bg-red-500"
            case "Medium":
                return "bg-yellow-500"
            case "Low":
                return "bg-blue-500"
            default:
                return "bg-gray-400"
        }
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] w-full rounded-lg border-2 border-primary/20 bg-background/50 opacity-50 shadow-xl"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="group relative cursor-grab overflow-hidden border-0 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20 active:cursor-grabbing active:shadow-xl">
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        getPriorityColor(task.priority)
                    )}
                />
                <CardHeader className="p-3 pb-2 pl-4">
                    <CardTitle className="text-sm font-medium leading-snug">
                        {task.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 pl-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono text-[10px] opacity-70">{task.code}</span>
                        </div>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                            {task.label}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
