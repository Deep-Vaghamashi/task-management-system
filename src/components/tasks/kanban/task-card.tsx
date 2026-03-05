"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TaskWithRelations } from "@/components/dashboard/tasks/types"
import { cn } from "@/lib/utils"

interface TaskCardProps {
    task: TaskWithRelations
    onClick?: (task: TaskWithRelations) => void
}

const PRIORITY_BAR: Record<string, string> = {
    'High': 'bg-red-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-emerald-500',
}

const PRIORITY_BADGE: Record<string, string> = {
    'High': 'bg-red-500/10 text-red-600 border-red-200',
    'Medium': 'bg-amber-500/10 text-amber-600 border-amber-200',
    'Low': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
}

const STATUS_BADGE: Record<string, string> = {
    'Pending': 'bg-slate-100 text-slate-600',
    'In Progress': 'bg-blue-100 text-blue-600',
    'Done': 'bg-emerald-100 text-emerald-600',
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.TaskID, data: { task } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[80px] w-full rounded-lg border-2 border-primary/20 bg-background/50 opacity-50 shadow-xl"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card
                className="group relative cursor-grab overflow-hidden border-0 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20 active:cursor-grabbing active:shadow-xl"
                onClick={() => onClick?.(task)}
            >
                <div
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        PRIORITY_BAR[task.Priority] || 'bg-gray-400'
                    )}
                />
                <CardHeader className="p-2.5 pb-1.5 pl-3.5">
                    <CardTitle className="text-xs font-medium leading-snug line-clamp-2">
                        {task.Title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 pt-0 pl-3.5">
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                            <Badge
                                variant="outline"
                                className={cn("h-4 px-1 text-[8px] border-0", STATUS_BADGE[task.Status] || '')}
                            >
                                {task.Status}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn("h-4 px-1 text-[8px] border-0", PRIORITY_BADGE[task.Priority] || '')}
                            >
                                {task.Priority}
                            </Badge>
                        </div>
                        {task.Assignee && (
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={task.Assignee.Avatar} />
                                <AvatarFallback className="text-[6px] bg-primary/10 text-primary">
                                    {getInitials(task.Assignee.UserName)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
