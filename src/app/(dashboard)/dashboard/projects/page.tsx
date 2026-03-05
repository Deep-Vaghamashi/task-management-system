"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
    Plus, Search, LayoutGrid, List as ListIcon, Calendar, Users,
    MoreHorizontal, Loader2, ArrowUpDown, Filter, ChevronLeft,
    ChevronRight, FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────

interface TaskInfo {
    TaskID: number;
    Status: string;
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
    Members: { User: { UserID: number; UserName: string } }[];
    TaskLists: { Tasks: TaskInfo[] }[];
}

interface ApiResponse {
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; border: string; bg: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
    Active: { color: 'text-blue-600', border: 'border-l-blue-500', bg: 'bg-blue-500/10', badge: 'default' },
    Completed: { color: 'text-emerald-600', border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', badge: 'secondary' },
    'On Hold': { color: 'text-amber-600', border: 'border-l-amber-500', bg: 'bg-amber-500/10', badge: 'outline' },
};

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || STATUS_CONFIG['Active'];
}

function getTaskStats(project: Project) {
    const allTasks = project.TaskLists?.flatMap(tl => tl.Tasks) || [];
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.Status === 'Completed').length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Sort Options ─────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { label: 'Newest First', sortBy: 'CreatedAt', sortOrder: 'desc' },
    { label: 'Oldest First', sortBy: 'CreatedAt', sortOrder: 'asc' },
    { label: 'Name (A-Z)', sortBy: 'ProjectName', sortOrder: 'asc' },
    { label: 'Name (Z-A)', sortBy: 'ProjectName', sortOrder: 'desc' },
    { label: 'Due Date (Soonest)', sortBy: 'DueDate', sortOrder: 'asc' },
];

const STATUS_OPTIONS = ['all', 'Active', 'Completed', 'On Hold'];

// ─── Main Page ────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('0'); // index into SORT_OPTIONS
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const sort = SORT_OPTIONS[parseInt(sortOption)];
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '6',
                sortBy: sort.sortBy,
                sortOrder: sort.sortOrder,
                status: statusFilter,
                search: searchQuery,
            });
            const response = await axios.get<ApiResponse>(`/api/projects?${params}`);
            setProjects(response.data.projects);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }, [page, sortOption, statusFilter, searchQuery]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Debounced search: reset to page 1 when search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when sort or filter changes
    useEffect(() => {
        setPage(1);
    }, [sortOption, statusFilter]);

    // ─── Loading State ─────────────────────────────

    if (loading && projects.length === 0) {
        return (
            <div className="container mx-auto py-10 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-96" />
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-[240px] w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* ─── Header ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        {total} project{total !== 1 ? 's' : ''} total &middot; Manage and collaborate with your team.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/projects/create">
                        <Plus className="mr-2 h-4 w-4" /> New Project
                    </Link>
                </Button>
            </div>

            {/* ─── Filters and Controls ─── */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-full sm:w-48">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((opt, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-44">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s === 'all' ? 'All Statuses' : s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1 self-start">
                    <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('list')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* ─── Content ─── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 border-dashed border-2 rounded-xl">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your search or filters, or create a new project.</p>
                </div>
            ) : (
                <>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard key={project.ProjectID} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <ProjectListItem key={project.ProjectID} project={project} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                        Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, total)} of {total} projects
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <Button
                                    key={p}
                                    variant={p === page ? 'default' : 'outline'}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Project Card (Grid View) ─────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
    const config = getStatusConfig(project.Status);
    const stats = getTaskStats(project);

    return (
        <Card className={`flex flex-col h-full border-l-4 ${config.border} hover:shadow-lg transition-all duration-200 group`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-2">
                        <CardTitle className="text-lg line-clamp-1">
                            <Link
                                href={`/dashboard/projects/${project.ProjectID}`}
                                className="hover:underline group-hover:text-primary transition-colors"
                            >
                                {project.ProjectName}
                            </Link>
                        </CardTitle>
                    </div>
                    <ProjectActions projectId={project.ProjectID} />
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                    {project.Description || "No description provided."}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pb-3">
                {/* Status + Due Date */}
                <div className="flex items-center justify-between">
                    <Badge
                        variant={config.badge}
                        className={`${config.bg} ${config.color} border-0 font-medium`}
                    >
                        {project.Status}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {project.DueDate ? format(new Date(project.DueDate), 'MMM d, yyyy') : 'No due date'}
                    </div>
                </div>

                {/* Task Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Task Progress</span>
                        <span className="font-medium">{stats.completed}/{stats.total} tasks</span>
                    </div>
                    <Progress value={stats.percentage} className="h-1.5" />
                </div>
            </CardContent>

            <CardFooter className="border-t pt-3 px-6">
                <div className="flex items-center justify-between w-full">
                    {/* Creator */}
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {getInitials(project.Creator.UserName)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{project.Creator.UserName}</span>
                    </div>

                    {/* Members */}
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                            {project.Members?.slice(0, 3).map((m, i) => (
                                <Avatar key={m.User.UserID} className="h-5 w-5 border-2 border-background">
                                    <AvatarFallback className="text-[8px] bg-muted">
                                        {getInitials(m.User.UserName)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {project.Members?.length || 0}
                            <Users className="h-3 w-3 inline ml-0.5" />
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

// ─── Project List Item (List View) ────────────────────────────────────

function ProjectListItem({ project }: { project: Project }) {
    const config = getStatusConfig(project.Status);
    const stats = getTaskStats(project);

    return (
        <div className={`flex items-center gap-4 p-4 border rounded-xl border-l-4 ${config.border} hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group`}>
            {/* Project Info */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/dashboard/projects/${project.ProjectID}`}
                    className="font-semibold hover:underline block truncate group-hover:text-primary transition-colors"
                >
                    {project.ProjectName}
                </Link>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {project.Description || "No description"}
                </p>
            </div>

            {/* Status */}
            <Badge
                variant={config.badge}
                className={`${config.bg} ${config.color} border-0 font-medium shrink-0`}
            >
                {project.Status}
            </Badge>

            {/* Progress */}
            <div className="hidden md:flex flex-col gap-1 w-28 shrink-0">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{stats.percentage}%</span>
                    <span className="font-medium">{stats.completed}/{stats.total}</span>
                </div>
                <Progress value={stats.percentage} className="h-1.5" />
            </div>

            {/* Due Date */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground w-28 shrink-0">
                <Calendar className="h-3.5 w-3.5" />
                {project.DueDate ? format(new Date(project.DueDate), 'MMM d, yyyy') : 'No date'}
            </div>

            {/* Members */}
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
                <div className="flex -space-x-1.5">
                    {project.Members?.slice(0, 3).map((m) => (
                        <Avatar key={m.User.UserID} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-[9px] bg-muted">
                                {getInitials(m.User.UserName)}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                {(project.Members?.length || 0) > 3 && (
                    <span className="text-xs text-muted-foreground">+{project.Members.length - 3}</span>
                )}
            </div>

            {/* Actions */}
            <ProjectActions projectId={project.ProjectID} />
        </div>
    );
}

// ─── Actions Dropdown ─────────────────────────────────────────────────

function ProjectActions({ projectId }: { projectId: number }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${projectId}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${projectId}/edit`}>Edit Project</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}