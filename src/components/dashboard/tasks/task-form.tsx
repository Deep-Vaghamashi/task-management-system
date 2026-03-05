'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, FileText, Tag, Clock, Flag, UserIcon, FolderOpen } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { TaskWithRelations } from './types';

// Schema
const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High']),
    status: z.enum(['Pending', 'In Progress', 'Done']).optional(),
    dueDate: z.date().optional(),
    assignedTo: z.string().optional(),
    projectId: z.string().min(1, 'Project is required').optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
    defaultValues?: Partial<TaskFormValues>;
    onSubmit: (data: TaskFormValues) => Promise<void>;
    isSaving?: boolean;
    onCancel?: () => void;
    isEdit?: boolean;
    projectId?: number;
    showProjectSelect?: boolean;
}

interface ProjectOption {
    ProjectID: number;
    ProjectName: string;
}

interface UserOption {
    UserID: number;
    UserName: string;
    Email: string;
}

const PRIORITY_CONFIG = [
    { value: 'Low', label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { value: 'Medium', label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-600' },
    { value: 'High', label: 'High', color: 'bg-red-500', textColor: 'text-red-600' },
];

const STATUS_CONFIG = [
    { value: 'Pending', label: 'Pending', color: 'bg-slate-500' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'Done', label: 'Done', color: 'bg-emerald-500' },
];

export function TaskForm({ defaultValues, onSubmit, isSaving = false, onCancel, isEdit = false, projectId, showProjectSelect = false }: TaskFormProps) {
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);

    const shouldShowProjectSelect = showProjectSelect || !projectId;

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'Medium',
            status: 'Pending',
            dueDate: undefined,
            assignedTo: undefined,
            projectId: projectId ? String(projectId) : undefined,
            ...defaultValues
        },
    });

    useEffect(() => {
        if (shouldShowProjectSelect) {
            const fetchProjects = async () => {
                try {
                    const res = await axios.get('/api/projects?limit=50');
                    const data = res.data;
                    setProjects(Array.isArray(data) ? data : data.projects || []);
                } catch (error) {
                    console.error("Failed to load projects", error);
                }
            };
            fetchProjects();
        }
    }, [shouldShowProjectSelect]);

    // Fetch users for assignee dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users');
                setUsers(res.data);
            } catch (error) {
                console.error("Failed to load users", error);
            }
        };
        fetchUsers();
    }, []);

    // Update form value if prop changes
    useEffect(() => {
        if (projectId) {
            form.setValue('projectId', String(projectId));
        }
    }, [projectId, form]);

    const handleFormSubmit = (data: TaskFormValues) => {
        if (!projectId && !data.projectId) {
            form.setError('projectId', { message: 'Project is required' });
            return;
        }
        onSubmit(data);
    };

    const currentPriority = PRIORITY_CONFIG.find(p => p.value === form.watch('priority'));
    const currentStatus = STATUS_CONFIG.find(s => s.value === form.watch('status'));
    const descValue = form.watch('description') || '';

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Title
                </label>
                <Input
                    {...form.register('title')}
                    placeholder="e.g. Design landing page mockup"
                    className="h-10"
                />
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>

            {/* Project Select */}
            {shouldShowProjectSelect && (
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        Project
                    </label>
                    <Select
                        onValueChange={(val) => form.setValue('projectId', val)}
                        defaultValue={form.getValues('projectId')}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map((p) => (
                                <SelectItem key={p.ProjectID} value={String(p.ProjectID)}>
                                    {p.ProjectName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.projectId && (
                        <p className="text-sm text-red-500">{form.formState.errors.projectId.message}</p>
                    )}
                </div>
            )}

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Description
                </label>
                <Textarea
                    {...form.register('description')}
                    placeholder="Add details about this task..."
                    className="h-24 resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                    {descValue.length}/255 characters
                </p>
            </div>

            <Separator />

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                        Priority
                    </label>
                    <Select
                        onValueChange={(val) => form.setValue('priority', val as any)}
                        defaultValue={form.getValues('priority')}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                {currentPriority && (
                                    <div className={cn("w-2 h-2 rounded-full", currentPriority.color)} />
                                )}
                                <SelectValue placeholder="Select priority" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_CONFIG.map(p => (
                                <SelectItem key={p.value} value={p.value}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", p.color)} />
                                        {p.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        Status
                    </label>
                    <Select
                        onValueChange={(val) => form.setValue('status', val as any)}
                        defaultValue={form.getValues('status')}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                {currentStatus && (
                                    <div className={cn("w-2 h-2 rounded-full", currentStatus.color)} />
                                )}
                                <SelectValue placeholder="Select status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_CONFIG.map(s => (
                                <SelectItem key={s.value} value={s.value}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", s.color)} />
                                        {s.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date & Assignee */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Due Date
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal h-10",
                                    !form.watch('dueDate') && "text-muted-foreground"
                                )}
                            >
                                {form.watch('dueDate') ? (
                                    format(form.watch('dueDate')!, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={form.watch('dueDate')}
                                onSelect={(date) => form.setValue('dueDate', date)}
                                initialFocus
                            />
                            {form.watch('dueDate') && (
                                <div className="p-2 border-t">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => form.setValue('dueDate', undefined)}
                                    >
                                        Clear date
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        Assign To
                    </label>
                    <Select
                        onValueChange={(val) => form.setValue('assignedTo', val === 'unassigned' ? undefined : val)}
                        defaultValue={form.getValues('assignedTo')}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">
                                <span className="text-muted-foreground">Unassigned</span>
                            </SelectItem>
                            {users.map((u) => (
                                <SelectItem key={u.UserID} value={String(u.UserID)}>
                                    <div className="flex flex-col">
                                        <span>{u.UserName}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <div className="flex gap-3 justify-end pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
}
