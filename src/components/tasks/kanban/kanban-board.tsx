"use client"

import * as React from "react"
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import {
    addDays,
    format,
    startOfWeek,
    isSameDay,
    endOfWeek,
    eachDayOfInterval,
    subWeeks,
    addWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight, LayoutKanban, LayoutList } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Task } from "@/components/tasks/columns"
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"
import { createPortal } from "react-dom"

interface KanbanBoardProps {
    initialTasks: Task[] // In a real app, these would have dates
}

// Extended Task type for local state to include date
type KanbanTask = Task & { dueDate?: string | null }

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
    // Mocking initial dates for demo purposes
    const [tasks, setTasks] = React.useState<KanbanTask[]>(() =>
        initialTasks.map((t, i) => ({
            ...t,
            // Randomly assign some to this week, some to backlog
            dueDate: i % 3 === 0 ? null : format(addDays(new Date(), (i % 7) - 1), "yyyy-MM-dd"),
        }))
    )

    const [currentWeekStart, setCurrentWeekStart] = React.useState(
        startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday start
    )
    const [activeTask, setActiveTask] = React.useState<KanbanTask | null>(null)
    const [viewMode, setViewMode] = React.useState<"week" | "3day">("week")

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor)
    )

    const days = React.useMemo(() => {
        const start = currentWeekStart
        const end = endOfWeek(start, { weekStartsOn: 1 })
        const allDays = eachDayOfInterval({ start, end })

        if (viewMode === "3day") {
            // Just show Mon-Wed or Today-Today+2 for better mobile demo?
            // Let's just stick to showing the first 3 days of the week for simplicity or slice
            return allDays.slice(0, 3)
        }
        return allDays
    }, [currentWeekStart, viewMode])

    const backlogTasks = React.useMemo(
        () => tasks.filter((t) => !t.dueDate),
        [tasks]
    )

    const getTasksForDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd")
        return tasks.filter((t) => t.dueDate === dateStr)
    }

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = tasks.find((t) => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveTask(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        const activeTask = tasks.find(t => t.id === activeId)
        if (!activeTask) return

        // Determine destination date
        let newDate: string | null = null

        // Check if dropped on a column container (which has ID = date string or 'backlog')
        if (overId === "backlog") {
            newDate = null
        } else if (overId.match(/^\d{4}-\d{2}-\d{2}$/)) {
            newDate = overId
        } else {
            // Dropped on another task? Find that task's column
            const overTask = tasks.find(t => t.id === overId)
            if (overTask) {
                newDate = overTask.dueDate || null
            } else {
                // Fallback if we can't determine
                setActiveTask(null)
                return
            }
        }

        if (activeTask.dueDate !== newDate) {
            // Update task date
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === activeId ? { ...t, dueDate: newDate } : t
                )
            )
            const msg = newDate
                ? `Moved to ${format(new Date(newDate), "EEEE, MMM d")}`
                : "Moved to Backlog"
            toast.success(msg)
            // TODO: Call API to update task
            console.log(`Update Task ${activeId} with date: ${newDate}`)
        }

        setActiveTask(null)
    }

    return (
        <div className="flex h-full flex-col gap-6">
            {/* Header Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 rounded-lg border bg-card p-1 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentWeekStart((prev) => subWeeks(prev, 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-sm font-semibold">
                            {format(currentWeekStart, "MMMM yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {format(currentWeekStart, "d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "d")}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentWeekStart((prev) => addWeeks(prev, 1))}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="rounded-lg border bg-muted p-1">
                        <Button
                            variant={viewMode === "week" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("week")}
                            className="h-7 px-3 text-xs shadow-none"
                        >
                            Week
                        </Button>
                        <Button
                            variant={viewMode === "3day" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("3day")}
                            className="h-7 px-3 text-xs shadow-none md:hidden"
                        >
                            3-Day
                        </Button>
                    </div>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full flex-1 gap-6 overflow-hidden">
                    {/* Backlog Sidebar */}
                    <div className="flex w-[240px] shrink-0 flex-col gap-2 border-r bg-muted/10 pr-4">
                        <div className="flex items-center justify-between px-1 pb-2">
                            <h3 className="font-semibold leading-none tracking-tight">Backlog</h3>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                {backlogTasks.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            <KanbanColumn
                                id="backlog"
                                title="Unscheduled"
                                tasks={backlogTasks}
                            />
                        </div>
                    </div>

                    {/* Calendar Columns */}
                    <div className="flex flex-1 flex-col">
                        <div className="grid h-full flex-1 grid-cols-7 gap-3">
                            {days.map((day) => {
                                const dateStr = format(day, "yyyy-MM-dd")
                                const dayTasks = getTasksForDate(day)
                                const isTodayVal = isSameDay(day, new Date())

                                return (
                                    <div key={dateStr} className="min-w-0 flex-1">
                                        <KanbanColumn
                                            id={dateStr}
                                            title={format(day, "EEEE")}
                                            subtitle={format(day, "d")}
                                            tasks={dayTasks}
                                            isToday={isTodayVal}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {typeof window !== "undefined" && createPortal(
                    <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} /> : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    )
}
