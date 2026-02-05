"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import {
    Plus,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Activity,
    Users,
    Loader2
} from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"

interface ProjectDetails {
    id: string
    title: string
    description: string
    status: string
    completionRate: number
    totalTasks: number
    startDate: Date
    dueDate: Date
    manager: { name: string; avatar?: string }
    team: { id: string; name: string; avatar?: string }[]
    tasks: {
        id: string
        title: string
        assignee: { name: string; avatar?: string }
        status: "Pending" | "In Progress" | "Done"
        dueDate: Date
    }[]
}

// Chart Data Helper
const getChartData = (tasks: ProjectDetails["tasks"]) => {
    if (!tasks) return []
    const counts = {
        Active: tasks.filter(t => t.status === "In Progress").length,
        Pending: tasks.filter(t => t.status === "Pending").length,
        Done: tasks.filter(t => t.status === "Done").length,
    }
    return [
        { name: "Active", value: counts.Active, color: "#3b82f6" }, // Blue-500
        { name: "Pending", value: counts.Pending, color: "#f97316" }, // Orange-500
        { name: "Done", value: counts.Done, color: "#22c55e" }, // Green-500
    ]
}

export default function ProjectDetailsPage() {
    const params = useParams()
    const id = params.id as string
    const [project, setProject] = React.useState<ProjectDetails | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await axios.get(`/api/projects/${id}`)
                const dbProject = response.data;

                // Map DB response to UI format
                const mappedProject: ProjectDetails = {
                    id: dbProject.ProjectID.toString(),
                    title: dbProject.ProjectName,
                    description: dbProject.Description || "No description provided.",
                    status: dbProject.Status || "Active",
                    completionRate: 0, // Mock for now, will be real with Tasks relation
                    totalTasks: 0, // Mock
                    startDate: new Date(dbProject.CreatedAt),
                    dueDate: dbProject.DueDate ? new Date(dbProject.DueDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
                    manager: { name: "Me" }, // Placeholder until we fetch creator details
                    team: [], // Placeholder
                    tasks: [] // Placeholder until we fetch tasks
                }
                setProject(mappedProject)
            } catch (error) {
                console.error("Failed to fetch project details", error)
                toast.error("Failed to load project details")
            } finally {
                setIsLoading(false)
            }
        }
        if (id) fetchProject()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return <div className="flex h-full items-center justify-center">Project not found</div>
    }

    const chartData = getChartData(project.tasks)

    // Mock deadlines for Calendar
    const deadlines = project.tasks.map(t => t.dueDate)

    return (
        <div className="flex h-full flex-col space-y-8 p-8 max-md:p-4 animate-in fade-in duration-500">

            {/* 1. Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        {project.description}
                    </p>
                    <div className="pt-2">
                        <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                            {project.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/projects/${id}/edit`}>
                            Edit Project
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/dashboard/tasks/create?projectId=${id}`}>
                            <Plus className="mr-2 h-4 w-4" /> Add Task
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 2. Top Stats Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Tasks
                        </CardTitle>
                        <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.totalTasks}</div>
                        <p className="text-muted-foreground text-xs">
                            Across all distinct lists
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Completion Rate
                        </CardTitle>
                        <Activity className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.completionRate}%</div>
                        <p className="text-muted-foreground text-xs">
                            Current progress
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Team Members
                        </CardTitle>
                        <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">
                                {/* Placeholder for Team */}
                                <Avatar className="border-background h-8 w-8 border-2">
                                    <AvatarFallback>M</AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-muted-foreground text-xs">
                                Active members
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Main Content Area */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Left Column (2/3) */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Charts & Analytics */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Task Overview</CardTitle>
                            <CardDescription>
                                Distribution of tasks by status. (No tasks yet)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                                {project.tasks.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p>No tasks to display</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Tasks List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest tasks updated or created.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {project.tasks.length > 0 ? project.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {task.title}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                Assigned to {task.assignee.name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                task.status === "Done" ? "default" :
                                                    task.status === "In Progress" ? "secondary" : "outline"
                                            }
                                        >
                                            {task.status}
                                        </Badge>
                                    </div>
                                )) : <p className="text-sm text-muted-foreground">No recent activity.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Project Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm">
                                    <CalendarIcon className="text-muted-foreground h-4 w-4" />
                                    <span>Start Date</span>
                                </div>
                                <span className="font-medium text-sm">
                                    {project.startDate.toLocaleDateString()}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="text-muted-foreground h-4 w-4" />
                                    <span>Due Date</span>
                                </div>
                                <span className="font-medium text-sm">
                                    {project.dueDate.toLocaleDateString()}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm">
                                    <Users className="text-muted-foreground h-4 w-4" />
                                    <span>Manager</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={project.manager.avatar} />
                                        <AvatarFallback>{project.manager.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{project.manager.name}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Calendar */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex justify-center pb-4">
                            <Calendar
                                mode="multiple"
                                selected={deadlines}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
