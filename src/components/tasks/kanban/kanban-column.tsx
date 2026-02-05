"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "@/components/tasks/columns"
import { TaskCard } from "./task-card"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KanbanColumnProps {
    id: string
    title: string
    tasks: Task[]
    isToday?: boolean
    subtitle?: string
}

export function KanbanColumn({ id, title, tasks, isToday, subtitle }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div className="flex h-full flex-col gap-2">
            <div
                className={cn(
                    "flex flex-col items-center justify-center rounded-t-lg border-b bg-muted/40 p-2 text-center transition-colors",
                    isToday && "bg-primary/10 text-primary"
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
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex flex-1 flex-col gap-3 overflow-y-auto rounded-b-lg border-x border-b bg-background/50 p-2 transition-all",
                    isOver && "bg-muted/50 ring-2 ring-inset ring-primary/20",
                    tasks.length === 0 && "items-center justify-center bg-muted/5"
                )}
            >
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-1 text-center text-muted-foreground opacity-40">
                            <div className="h-8 w-8 rounded-full border-2 border-dashed border-current" />
                            <span className="text-xs">No Tasks</span>
                        </div>
                    )}
                </SortableContext>

                {tasks.length > 0 && (
                    <Button variant="ghost" size="sm" className="mt-auto h-6 w-full text-[10px] text-muted-foreground opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                        <Plus className="mr-1 h-3 w-3" /> Add Task
                    </Button>
                )}
            </div>
        </div>
    )
}
