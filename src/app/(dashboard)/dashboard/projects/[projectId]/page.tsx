"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { format } from 'date-fns';
import {
    Calendar, Clock, MoreVertical, Edit, Trash2, ArrowLeft,
    CheckCircle2, AlertCircle, Plus, ListTodo, Timer,
    CircleDot, AlertTriangle, BarChart3, Users
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TaskSheet } from '@/components/dashboard/tasks/task-sheet';
import { TaskWithRelations } from '@/components/dashboard/tasks/types';

// ─── Types ────────────────────────────────────────────────────────────

interface TaskInfo {
    TaskID: number;
    Status: string;
    Priority: string;
    DueDate: string | null;
}

interface Project {
    ProjectID: number;
    ProjectName: string;
    Description: string | null;
    Status: string;
    DueDate: string | null;
    CreatedAt: string;
    Creator: {
        UserName: string;
        Email: string;
    };
    Members: {
        User: {
            UserID: number;
            UserName: string;
            Email: string;
        }
    }[];
    TaskLists: {
        Tasks: TaskInfo[];
    }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    'Pending': { icon: <CircleDot className="h-4 w-4" />, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-l-slate-400' },
    'In Progress': { icon: <Timer className="h-4 w-4" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-l-blue-500' },
    'Done': { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-l-emerald-500' },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
    'High': { color: 'text-red-600', bg: 'bg-red-500/10', badge: 'destructive' },
    'Medium': { color: 'text-amber-600', bg: 'bg-amber-500/10', badge: 'outline' },
    'Low': { color: 'text-emerald-600', bg: 'bg-emerald-500/10', badge: 'secondary' },
};

const PROJECT_STATUS_CONFIG: Record<string, { color: string; bg: string; badge: "default" | "secondary" | "outline" }> = {
    'Active': { color: 'text-blue-600', bg: 'bg-blue-500/10', badge: 'default' },
    'Completed': { color: 'text-emerald-600', bg: 'bg-emerald-500/10', badge: 'secondary' },
    'On Hold': { color: 'text-amber-600', bg: 'bg-amber-500/10', badge: 'outline' },
};

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getTaskStats(project: Project) {
    const allTasks = project.TaskLists?.flatMap(tl => tl.Tasks) || [];
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.Status === 'Pending').length;
    const inProgress = allTasks.filter(t => t.Status === 'In Progress').length;
    const done = allTasks.filter(t => t.Status === 'Done' || t.Status === 'Completed').length;
    const overdue = allTasks.filter(t => t.DueDate && new Date(t.DueDate) < new Date() && t.Status !== 'Done' && t.Status !== 'Completed').length;
    const high = allTasks.filter(t => t.Priority === 'High').length;
    const medium = allTasks.filter(t => t.Priority === 'Medium').length;
    const low = allTasks.filter(t => t.Priority === 'Low').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, pending, inProgress, done, overdue, high, medium, low, percentage };
}

// ─── Main Page ────────────────────────────────────────────────────────

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Task Logic
    const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
    const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
    const [expandedStatuses, setExpandedStatuses] = useState<Record<string, boolean>>({
        'Pending': true, 'In Progress': true, 'Done': true,
    });

    const fetchProject = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const response = await axios.get(`/api/projects/${projectId}`);
            setProject(response.data);
            setError(null);

            // Fetch tasks for this project using the project-scoped endpoint
            const taskRes = await axios.get(`/api/projects/${projectId}/tasksList/tasks`);
            setTasks(taskRes.data);

        } catch (err: unknown) {
            console.error("Error fetching project:", err);
            if (isAxiosError(err) && err.response?.status === 404) {
                setError("Project not found.");
            } else {
                setError("Failed to load project details.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/projects/${projectId}`);
            toast.success("Project deleted successfully");
            router.push('/dashboard/projects');
        } catch (err: unknown) {
            toast.error(isAxiosError(err) ? (err.response?.data?.error || "Failed to delete project") : "Failed to delete project");
        }
    };

    const toggleStatus = (status: string) => {
        setExpandedStatuses(prev => ({ ...prev, [status]: !prev[status] }));
    };

    // ─── Loading State ────────────────────────────

    if (loading) {
        return (
            <div className="container mx-auto py-10 max-w-6xl space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="container mx-auto py-10">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "Project not found"}</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const stats = getTaskStats(project);
    const projectStatusConfig = PROJECT_STATUS_CONFIG[project.Status] || PROJECT_STATUS_CONFIG['Active'];

    // Group tasks by status
    const tasksByStatus: Record<string, TaskWithRelations[]> = {
        'Pending': tasks.filter(t => t.Status === 'Pending'),
        'In Progress': tasks.filter(t => t.Status === 'In Progress'),
        'Done': tasks.filter(t => t.Status === 'Done' || t.Status === 'Completed'),
    };

    return (
        <div className="container mx-auto py-8 max-w-6xl space-y-8">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{project.ProjectName}</h1>
                            <Badge
                                variant={projectStatusConfig.badge}
                                className={`${projectStatusConfig.bg} ${projectStatusConfig.color} border-0 font-medium`}
                            >
                                {project.Status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            Created by {project.Creator.UserName} on {format(new Date(project.CreatedAt), 'PPP')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsTaskSheetOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${projectId}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Main Content ─── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">About this Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {project.Description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* ─── Tasks List (Grouped by Status) ─── */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-lg font-semibold">Tasks</CardTitle>
                                <Badge variant="secondary" className="font-mono">
                                    {tasks.length}
                                </Badge>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/dashboard/tasks?projectId=${projectId}`}>
                                    <BarChart3 className="mr-2 h-3.5 w-3.5" />
                                    View Board
                                </a>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {tasks.length === 0 ? (
                                <div className="text-center py-12 border-dashed border-2 rounded-xl">
                                    <ListTodo className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                                    <h3 className="font-semibold">No tasks yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Get started by creating your first task.</p>
                                    <Button variant="outline" className="mt-4" onClick={() => setIsTaskSheetOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" /> Create Task
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(['Pending', 'In Progress', 'Done'] as const).map((status) => {
                                        const statusTasks = tasksByStatus[status] || [];
                                        const config = STATUS_CONFIG[status];
                                        if (statusTasks.length === 0) return null;

                                        return (
                                            <div key={status} className="space-y-2">
                                                {/* Status Header */}
                                                <button
                                                    onClick={() => toggleStatus(status)}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors hover:bg-muted/50 ${config.bg}`}
                                                >
                                                    <div className={`flex items-center gap-2 font-medium text-sm ${config.color}`}>
                                                        {config.icon}
                                                        {status}
                                                        <Badge variant="secondary" className="ml-1 h-5 text-[10px] font-mono">
                                                            {statusTasks.length}
                                                        </Badge>
                                                    </div>
                                                    <svg
                                                        className={`w-4 h-4 transition-transform ${expandedStatuses[status] ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Task Items */}
                                                {expandedStatuses[status] && (
                                                    <div className="space-y-1.5 pl-1">
                                                        {statusTasks.map(task => {
                                                            const prioConfig = PRIORITY_CONFIG[task.Priority] || PRIORITY_CONFIG['Medium'];
                                                            const isOverdue = task.DueDate && new Date(task.DueDate) < new Date() && task.Status !== 'Done' && task.Status !== 'Completed';

                                                            return (
                                                                <div
                                                                    key={task.TaskID}
                                                                    className={`flex items-center justify-between p-3 rounded-lg border border-l-4 ${config.border} hover:bg-muted/30 transition-colors group`}
                                                                >
                                                                    <div className="flex-1 min-w-0 mr-3">
                                                                        <p className="font-medium text-sm truncate">{task.Title}</p>
                                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                            <Badge
                                                                                variant={prioConfig.badge}
                                                                                className={`text-[10px] h-5 ${prioConfig.bg} ${prioConfig.color} border-0`}
                                                                            >
                                                                                {task.Priority}
                                                                            </Badge>
                                                                            {task.Assignee && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Avatar className="h-4 w-4">
                                                                                        <AvatarFallback className="text-[7px] bg-primary/10 text-primary">
                                                                                            {getInitials(task.Assignee.UserName)}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <span className="text-[11px] text-muted-foreground">{task.Assignee.UserName}</span>
                                                                                </div>
                                                                            )}
                                                                            {task.DueDate && (
                                                                                <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    {format(new Date(task.DueDate), 'MMM d')}
                                                                                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Sidebar ─── */}
                <div className="space-y-6">
                    {/* Progress & Stats */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Project Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Overall Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{stats.percentage}% Complete</span>
                                    <span className="text-muted-foreground">{stats.done}/{stats.total} tasks</span>
                                </div>
                                <Progress value={stats.percentage} className="h-2" />
                            </div>

                            <Separator />

                            {/* Task Breakdown */}
                            <div className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status Breakdown</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                        <p className="text-lg font-bold text-slate-600">{stats.pending}</p>
                                        <p className="text-[10px] text-muted-foreground">Pending</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                                        <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
                                        <p className="text-[10px] text-muted-foreground">In Progress</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                                        <p className="text-lg font-bold text-emerald-600">{stats.done}</p>
                                        <p className="text-[10px] text-muted-foreground">Done</p>
                                    </div>
                                </div>
                            </div>

                            {/* Overdue Warning */}
                            {stats.overdue > 0 && (
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                                    <span className="text-xs font-medium text-red-600">
                                        {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            )}

                            <Separator />

                            {/* Priority Distribution */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</p>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'High', count: stats.high, color: 'bg-red-500' },
                                        { label: 'Medium', count: stats.medium, color: 'bg-amber-500' },
                                        { label: 'Low', count: stats.low, color: 'bg-emerald-500' },
                                    ].map(p => (
                                        <div key={p.label} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.color}`} />
                                                <span className="text-muted-foreground">{p.label}</span>
                                            </div>
                                            <span className="font-medium">{p.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Details */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Project Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> Created
                                </div>
                                <div className="font-medium text-sm">
                                    {format(new Date(project.CreatedAt), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> Due Date
                                </div>
                                <div className="font-medium text-sm">
                                    {project.DueDate ? format(new Date(project.DueDate), 'MMM d, yyyy') : 'No due date'}
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Total Tasks
                                </div>
                                <div className="font-medium text-sm">{stats.total}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Team */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" /> Project Team
                                <Badge variant="secondary" className="ml-auto font-mono text-[10px]">
                                    {1 + (project.Members?.length || 0)}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Creator */}
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {getInitials(project.Creator?.UserName || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-0.5">
                                    <p className="text-sm font-medium leading-none">{project.Creator?.UserName}</p>
                                    <p className="text-[11px] text-muted-foreground">Project Manager</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] h-5">Owner</Badge>
                            </div>

                            {project.Members && project.Members.length > 0 && <Separator />}

                            {project.Members?.map((member) => (
                                <div key={member.User.UserID} className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-muted text-xs">
                                            {getInitials(member.User.UserName || '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-sm font-medium leading-none">{member.User.UserName}</p>
                                        <p className="text-[11px] text-muted-foreground">{member.User.Email}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ─── Delete Dialog ─── */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the project
                            and all associated tasks.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Task Sheet ─── */}
            <TaskSheet
                open={isTaskSheetOpen}
                onOpenChange={setIsTaskSheetOpen}
                projectId={Number(projectId)}
                onTaskSaved={() => {
                    setIsTaskSheetOpen(false);
                    fetchProject(); // Refresh tasks
                }}
            />
        </div>
    );
}
