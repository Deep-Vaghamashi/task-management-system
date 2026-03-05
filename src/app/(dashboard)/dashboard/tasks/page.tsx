'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, ListTodo, Clock, CheckCircle2, CircleDot, Timer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskSheet } from '@/components/dashboard/tasks/task-sheet';
import { KanbanBoard } from '@/components/dashboard/tasks/kanban-board';
import { TaskDataTable } from '@/components/dashboard/tasks/data-table';
import { TaskAnalytics } from '@/components/dashboard/tasks/task-analytics';
import { TaskWithRelations, TaskStatus } from '@/components/dashboard/tasks/types';
import { toast } from 'sonner';

export default function TasksPage() {
    const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
    const [activeTab, setActiveTab] = useState('board');

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/tasks');
            setTasks(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Compute stats
    const pending = tasks.filter(t => t.Status === 'Pending').length;
    const inProgress = tasks.filter(t => t.Status === 'In Progress').length;
    const done = tasks.filter(t => t.Status === 'Done' || t.Status === 'Completed').length;
    const overdue = tasks.filter(t => t.DueDate && new Date(t.DueDate) < new Date() && t.Status !== 'Done' && t.Status !== 'Completed').length;

    const handleTaskMove = async (taskId: number, newStatus: TaskStatus) => {
        // Optimistic Update
        const oldTasks = [...tasks];
        const updatedTasks = tasks.map(t =>
            t.TaskID === taskId ? { ...t, Status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await axios.put('/api/tasks', { taskId, status: newStatus });
        } catch (error) {
            // Revert on failure
            setTasks(oldTasks);
            toast.error('Failed to update task status');
        }
    };

    const handleEditTask = (task: TaskWithRelations) => {
        setSelectedTask(task);
        setIsSheetOpen(true);
    };

    const handleDeleteTask = async (task: TaskWithRelations) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const oldTasks = [...tasks];
        setTasks(tasks.filter(t => t.TaskID !== task.TaskID));

        try {
            await axios.delete(`/api/tasks?taskId=${task.TaskID}`);
            toast.success(`Task "${task.Title}" deleted`);
        } catch (error) {
            setTasks(oldTasks);
            toast.error('Failed to delete task');
        }
    };

    const handleTaskSaved = () => {
        fetchTasks();
        setSelectedTask(null);
    };

    const onSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) setSelectedTask(null);
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Manage and track your tasks efficiently.</p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </div>

            {/* Stats Row */}
            {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="p-2 rounded-md bg-slate-200 dark:bg-slate-700">
                            <CircleDot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">{pending}</p>
                            <p className="text-[11px] text-muted-foreground">Pending</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                        <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                            <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">{inProgress}</p>
                            <p className="text-[11px] text-muted-foreground">In Progress</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                        <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">{done}</p>
                            <p className="text-[11px] text-muted-foreground">Completed</p>
                        </div>
                    </div>
                    {overdue > 0 ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
                            <div className="p-2 rounded-md bg-red-100 dark:bg-red-900">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-red-600">{overdue}</p>
                                <p className="text-[11px] text-muted-foreground">Overdue</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <div className="p-2 rounded-md bg-muted">
                                <ListTodo className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{tasks.length}</p>
                                <p className="text-[11px] text-muted-foreground">Total Tasks</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Tabs defaultValue="board" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="board">Board</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                        <TabsTrigger value="analytics">Insights</TabsTrigger>
                    </TabsList>
                </div>

                {loading && activeTab !== 'analytics' ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="board" className="flex-1 h-full overflow-hidden mt-0">
                            <KanbanBoard
                                tasks={tasks}
                                onTaskMove={handleTaskMove}
                                onTaskClick={handleEditTask}
                            />
                        </TabsContent>

                        <TabsContent value="list" className="flex-1 mt-0">
                            <TaskDataTable
                                data={tasks}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                            />
                        </TabsContent>

                        <TabsContent value="analytics" className="mt-0">
                            <TaskAnalytics />
                        </TabsContent>
                    </>
                )}
            </Tabs>

            <TaskSheet
                open={isSheetOpen}
                onOpenChange={onSheetOpenChange}
                task={selectedTask}
                onTaskSaved={handleTaskSaved}
            />
        </div>
    );
}
