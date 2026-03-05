'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, Clock } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TaskWithRelations } from './types';
import axios from 'axios';
import { TaskForm, TaskFormValues } from './task-form'; // Import the new component

interface TaskSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: TaskWithRelations | null;
    projectId?: number;
    onTaskSaved: () => void;
}

export function TaskSheet({ open, onOpenChange, task, projectId, onTaskSaved }: TaskSheetProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Initial values logic moved here to pass to Form
    const defaultValues: Partial<TaskFormValues> = task ? {
        title: task.Title,
        description: task.Description || '',
        priority: (task.Priority as 'Low' | 'Medium' | 'High') || 'Medium',
        status: (task.Status as 'Pending' | 'In Progress' | 'Done') || 'Pending',
        dueDate: task.DueDate ? new Date(task.DueDate) : undefined,
        assignedTo: task.AssignedTo ? String(task.AssignedTo) : undefined,
    } : {
        priority: 'Medium',
        status: 'Pending',
    };

    useEffect(() => {
        if (open) {
            setActiveTab('details');
            if (task) {
                // Fetch History
                fetchTaskDetails(task.TaskID);
            } else {
                setHistory([]);
            }
        }
    }, [open, task]);

    const fetchTaskDetails = async (id: number) => {
        setLoadingHistory(true);
        try {
            const res = await axios.get(`/api/tasks?taskId=${id}`);
            if (res.data && res.data.History) {
                setHistory(res.data.History);
            }
        } catch (error) {
            console.error("Failed to fetch history");
        } finally {
            setLoadingHistory(false);
        }
    };


    const onSubmit = async (data: TaskFormValues) => {
        try {
            setIsSaving(true);
            const payload = {
                ...data,
                assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
                projectId: projectId || (task ? task.TaskList.ProjectID : undefined),
                listId: task ? task.ListID : undefined
            };

            if (task) {
                // Update existing task
                await axios.put('/api/tasks', { ...payload, taskId: task.TaskID });
                toast.success(`Task "${data.title}" updated successfully`);
                fetchTaskDetails(task.TaskID); // Refresh history
            } else {
                // Create new task
                const resolvedProjectId = projectId || (data.projectId ? Number(data.projectId) : null);

                if (resolvedProjectId) {
                    // Use the project-scoped RESTful endpoint
                    await axios.post(`/api/projects/${resolvedProjectId}/tasksList/tasks`, payload);
                } else {
                    // Fallback to the generic endpoint
                    await axios.post('/api/tasks', payload);
                }
                toast.success(`Task "${data.title}" created successfully`);
            }

            onTaskSaved();
            if (!task) onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${task ? 'update' : 'create'} task`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-hidden flex flex-col">
                <SheetHeader className="mb-4">
                    <SheetTitle>{task ? 'Edit Task' : 'Create New Task'}</SheetTitle>
                    <SheetDescription>
                        {task ? 'Update task details and view history.' : 'Add a new task to your board.'}
                    </SheetDescription>
                </SheetHeader>

                {task ? (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="flex-1 overflow-y-auto mt-4 px-1">
                            {/* Key helps reset form when task/open changes */}
                            <TaskForm
                                key={task.TaskID}
                                defaultValues={defaultValues}
                                onSubmit={onSubmit}
                                isSaving={isSaving}
                                onCancel={() => onOpenChange(false)}
                                isEdit={true}
                            />
                        </TabsContent>

                        <TabsContent value="history" className="flex-1 overflow-y-auto mt-4">
                            {loadingHistory ? (
                                <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="space-y-4">
                                    {history.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center">No history available.</p>
                                    ) : (
                                        history.map((h, i) => (
                                            <div key={i} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                                                <div className="mt-0.5">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{h.ChangeType} by {h.User.UserName}</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(h.ChangeTime), "PP p")}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex-1 overflow-y-auto mt-4 px-1">
                        <TaskForm
                            key="new"
                            defaultValues={defaultValues}
                            onSubmit={onSubmit}
                            isSaving={isSaving}
                            onCancel={() => onOpenChange(false)}
                            isEdit={false}
                        />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
