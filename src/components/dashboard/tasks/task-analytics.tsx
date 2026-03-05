'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as ReTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface TaskAnalyticsProps {
    projectId?: number;
}

export function TaskAnalytics({ projectId }: TaskAnalyticsProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const url = projectId
                    ? `/api/tasks/analytics?projectId=${projectId}`
                    : `/api/tasks/analytics`;
                const res = await axios.get(url);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>Failed to load analytics data</p>
            </div>
        );
    }

    const priorityData = data.priorityDistribution.map((item: any) => ({
        name: item.Priority,
        value: item._count.Priority
    }));

    const statusData = data.statusDistribution.map((item: any) => ({
        name: item.Status,
        value: item._count.Status
    }));

    // Consistent colors matching the app design
    const PRIORITY_COLORS: Record<string, string> = {
        'High': '#ef4444',     // red-500
        'Medium': '#f59e0b',   // amber-500
        'Low': '#10b981',      // emerald-500
    };

    const STATUS_COLORS: Record<string, string> = {
        'Pending': '#64748b',     // slate-500
        'In Progress': '#3b82f6', // blue-500
        'Done': '#10b981',        // emerald-500
    };

    // Total tasks for the summary
    const totalTasks = statusData.reduce((sum: number, item: any) => sum + item.value, 0);
    const completedTasks = statusData.find((d: any) => d.name === 'Done')?.value || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Tasks</p>
                                <p className="text-3xl font-bold mt-1">{totalTasks}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-primary">#</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-600">{completedTasks}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-emerald-600">✓</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completion Rate</p>
                                <p className="text-3xl font-bold mt-1">{completionRate}%</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-600">%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Priority Distribution</CardTitle>
                        <CardDescription>Task breakdown by priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    innerRadius={50}
                                    fill="#8884d8"
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="hsl(var(--background))"
                                >
                                    {priorityData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PRIORITY_COLORS[entry.name] || '#94a3b8'}
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--background))',
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status Overview</CardTitle>
                        <CardDescription>Current status of all tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={statusData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} allowDecimals={false} />
                                <ReTooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--background))',
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[6, 6, 0, 0]}
                                    fill="#3b82f6"
                                >
                                    {statusData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[entry.name] || '#94a3b8'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
