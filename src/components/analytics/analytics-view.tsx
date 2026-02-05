"use client"

import * as React from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts"
import {
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    CheckCircle,
    Activity,
    Calendar as CalendarIcon
} from "lucide-react"
import { toast } from "sonner"
import { addDays, format, subDays } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Icon Mapping
const ICON_MAP: Record<string, React.ElementType> = {
    CheckCircle,
    TrendingUp,
    Activity,
    Users
}

// Type Definitions
interface KPIData {
    label: string
    value: string | number
    change: string
    trend: "up" | "down" | "neutral"
    icon: string
}

interface AnalyticsViewProps {
    data: {
        kpi: KPIData[]
        completionTrend: any[]
        projectStatus: any[]
        teamWorkload: any[]
    }
}

const CHART_COLORS = ["#2563eb", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"]

export function AnalyticsView({ data }: AnalyticsViewProps) {
    const [timeRange, setTimeRange] = React.useState("30d")

    const handleExport = () => {
        toast.success("Report downloaded successfully", {
            description: "Analytics_Report_Feb_2026.pdf"
        })
    }

    // Filter logic could be implemented here based on timeRange
    // For now, we use the passed static mock data

    return (
        <div className="flex flex-col space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
                    <p className="text-muted-foreground">Track team performance and project health.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[160px]">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data.kpi.map((item, index) => {
                    const Icon = ICON_MAP[item.icon] || Activity // Fallback icon

                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.label}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.value}</div>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    {item.trend === "up" ? (
                                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                                    ) : item.trend === "down" ? (
                                        <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                                    ) : null}
                                    <span className={item.trend === "up" ? "text-green-500" : item.trend === "down" ? "text-red-500" : ""}>
                                        {item.change}
                                    </span>
                                    <span className="ml-1">from last month</span>
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Task Completion Trend (Area Chart) - 4 cols */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Task Completion Trend</CardTitle>
                        <CardDescription>
                            Tasks completed over time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.completionTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        const d = new Date(value);
                                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tasks"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorTasks)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Project Status Distribution (Pie Chart) - 3 cols */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Project Status</CardTitle>
                        <CardDescription>
                            Current distribution of project health.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.projectStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.projectStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Team Workload</CardTitle>
                        <CardDescription>
                            Active tasks currently assigned to team members.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data.teamWorkload} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="activeTasks" fill="#adfa1d" radius={[4, 4, 0, 0]}>
                                    {data.teamWorkload.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563eb" : "#1e40af"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
