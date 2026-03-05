"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskWithRelations } from "@/components/dashboard/tasks/types"
import { TaskCard } from "./task-card"
import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

interface KanbanColumnProps {
    id: string
    title: string
    tasks: TaskWithRelations[]
    isToday?: boolean
    subtitle?: string
    onTaskClick?: (task: TaskWithRelations) => void
}

export function KanbanColumn({ id, title, tasks, isToday, subtitle, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div className="flex h-full flex-col gap-2">
            <div
                className={cn(
                    "flex flex-col items-center justify-center rounded-t-lg border-b bg-muted/40 p-2 text-center transition-colors",
                    isToday && "bg-primary/10 text-primary border-primary/30"
                )}
            >
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {title}
                </span>
                {subtitle && (
                    <span className={cn("text-xl font-bold", isToday && "text-primary")}>
                        {subtitle}
                    </span>
                )}
                {tasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex flex-1 flex-col gap-2 overflow-y-auto rounded-b-lg border-x border-b bg-background/50 p-2 transition-all",
                    isOver && "bg-primary/5 ring-2 ring-inset ring-primary/20",
                    tasks.length === 0 && "items-center justify-center bg-muted/5"
                )}
            >
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.TaskID)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.TaskID} task={task} onClick={onTaskClick} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-1 text-center text-muted-foreground opacity-40 py-4">
                            <Inbox className="h-6 w-6" />
                            <span className="text-[10px]">No Tasks</span>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    )
}
