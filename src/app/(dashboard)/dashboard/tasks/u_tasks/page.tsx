import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { isToday, isPast, isFuture, isSameDay, startOfToday } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MyTaskItem } from "@/components/tasks/my-task-item"
import { QuickAddTask } from "@/components/tasks/quick-add-task"
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react"

async function getTasks() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return { tasks: [], user: null }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as any
        const userId = decoded.userId

        const tasks = await prisma.task.findMany({
            where: {
                AssignedTo: userId,
                Status: { not: "Completed" },
            },
            include: {
                TaskList: {
                    include: {
                        Project: true,
                    },
                },
            },
            orderBy: [
                { Priority: 'asc' }, // Order by priority? Or due date? User said "Sort tasks by priority (High first)". 'High' > 'Low' alphabetically? No.
                { DueDate: 'asc' }
            ]
        })

        // Custom sort for priority if it's string based (High, Medium, Low)
        // High < Medium < Low (alphabetically H < L < M - wait. High, Low, Medium. H, L, M. H is first. 
        // Actually we should sort manually if needed. Let's sort in JS for better control.

        return { tasks, user: decoded }
    } catch (error) {
        console.error("Failed to fetch tasks", error)
        return { tasks: [], user: null }
    }
}

export default async function MyTasksPage() {
    const { tasks } = await getTasks()

    // Group tasks
    const today = startOfToday()

    // Custom priority sort helper
    const priorityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 }
    const sortTasks = (a: any, b: any) => {
        const pA = priorityOrder[a.Priority] || 99
        const pB = priorityOrder[b.Priority] || 99
        if (pA !== pB) return pA - pB
        return new Date(a.DueDate || 0).getTime() - new Date(b.DueDate || 0).getTime()
    }

    const overdueTasks = tasks.filter(t => t.DueDate && isPast(new Date(t.DueDate)) && !isToday(new Date(t.DueDate))).sort(sortTasks)
    const todayTasks = tasks.filter(t => t.DueDate && isSameDay(new Date(t.DueDate), today)).sort(sortTasks)
    const upcomingTasks = tasks.filter(t => !t.DueDate || (isFuture(new Date(t.DueDate)) && !isSameDay(new Date(t.DueDate), today))).sort(sortTasks)

    const pendingCount = overdueTasks.length + todayTasks.length

    return (
        <div className="h-full flex flex-col space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My To-Do List</h1>
                <p className="text-muted-foreground">
                    You have <span className="font-bold text-primary">{pendingCount}</span> pending tasks for today.
                </p>
            </div>

            {/* Quick Add */}
            <div className="max-w-xl">
                <QuickAddTask />
            </div>

            <Separator />

            {/* Content */}
            <ScrollArea className="flex-1 h-full pr-4">
                <div className="space-y-8 pb-10">

                    {/* Overdue Section */}
                    {overdueTasks.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-red-500">
                                <AlertCircle className="h-5 w-5" /> Overdue
                            </h2>
                            <div className="space-y-2">
                                {overdueTasks.map(task => (
                                    <MyTaskItem key={task.TaskID} task={task} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Today Section */}
                    <section className="space-y-3">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
                            <Calendar className="h-5 w-5" /> Today
                        </h2>
                        {todayTasks.length > 0 ? (
                            <div className="space-y-2">
                                {todayTasks.map(task => (
                                    <MyTaskItem key={task.TaskID} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground italic py-4">
                                <CheckCircle2 className="h-4 w-4" /> No tasks for today. Great job!
                            </div>
                        )}
                    </section>

                    {/* Upcoming Section */}
                    <section className="space-y-3">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                            <Calendar className="h-5 w-5" /> Upcoming
                        </h2>
                        {upcomingTasks.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingTasks.map(task => (
                                    <MyTaskItem key={task.TaskID} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">No upcoming tasks.</div>
                        )}
                    </section>
                </div>

                {/* Overall Empty State */}
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <div className="rounded-full bg-muted p-6 mb-4">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">All caught up! 🎉</h3>
                        <p>You have no pending tasks assigned to you.</p>
                    </div>
                )}

            </ScrollArea>
        </div>
    )
}
