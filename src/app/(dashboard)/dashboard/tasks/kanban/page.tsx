'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/tasks/kanban/kanban-board';
import { TaskSheet } from '@/components/dashboard/tasks/task-sheet';
import { TaskWithRelations } from '@/components/dashboard/tasks/types';

export default function KanbanPage() {
    const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);

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

    const handleDateChange = async (taskId: number, newDate: string | null) => {
        // Optimistic update
        const oldTasks = [...tasks];
        setTasks(prev =>
            prev.map(t => t.TaskID === taskId ? { ...t, DueDate: newDate ? new Date(newDate) : null } : t)
        );

        try {
            await axios.put('/api/tasks', {
                taskId,
                dueDate: newDate,
            });
        } catch (error) {
            setTasks(oldTasks);
            toast.error('Failed to update task date');
        }
    };

    const handleTaskClick = (task: TaskWithRelations) => {
        setSelectedTask(task);
        setIsSheetOpen(true);
    };

    const handleTaskSaved = () => {
        fetchTasks();
        setSelectedTask(null);
    };

    const onSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) setSelectedTask(null);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Weekly Scheduler</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Drag tasks to schedule them for the week.
                    </p>
                </div>
                <Button onClick={() => setIsSheetOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </div>

            <KanbanBoard
                tasks={tasks}
                onDateChange={handleDateChange}
                onTaskClick={handleTaskClick}
            />

            <TaskSheet
                open={isSheetOpen}
                onOpenChange={onSheetOpenChange}
                task={selectedTask}
                onTaskSaved={handleTaskSaved}
            />
        </div>
    );
}
