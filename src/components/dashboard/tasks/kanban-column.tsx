'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { TaskWithRelations, TaskStatus } from './types';
import { TaskCard } from './task-card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleDot, Timer, CheckCircle2, Inbox } from 'lucide-react';

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    tasks: TaskWithRelations[];
    onTaskClick: (task: TaskWithRelations) => void;
}

const COLUMN_CONFIG: Record<string, { icon: React.ReactNode; dot: string; headerBg: string; bg: string; border: string }> = {
    'Pending': {
        icon: <CircleDot className="h-3.5 w-3.5" />,
        dot: 'bg-slate-400',
        headerBg: 'bg-slate-100 dark:bg-slate-800',
        bg: 'bg-slate-50/50 dark:bg-slate-900/30',
        border: 'border-slate-200 dark:border-slate-700',
    },
    'In Progress': {
        icon: <Timer className="h-3.5 w-3.5" />,
        dot: 'bg-blue-500',
        headerBg: 'bg-blue-50 dark:bg-blue-950/50',
        bg: 'bg-blue-50/30 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
    },
    'Done': {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        dot: 'bg-emerald-500',
        headerBg: 'bg-emerald-50 dark:bg-emerald-950/50',
        bg: 'bg-emerald-50/30 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
};

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: "Column",
            columnId: id
        }
    });

    const config = COLUMN_CONFIG[id] || COLUMN_CONFIG['Pending'];

    return (
        <div className={`flex flex-col h-full rounded-xl border ${config.border} ${config.bg} transition-colors ${isOver ? 'ring-2 ring-primary/30' : ''}`}>
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${config.headerBg}`}>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    {title}
                </h3>
                <Badge variant="secondary" className="text-[11px] font-mono h-5 px-1.5">
                    {tasks.length}
                </Badge>
            </div>

            {/* Task List */}
            <ScrollArea className="flex-1 px-2 pt-2">
                <div ref={setNodeRef} className="pb-4 min-h-[400px]">
                    <SortableContext items={tasks.map(t => t.TaskID)} strategy={verticalListSortingStrategy}>
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60">
                                <Inbox className="h-8 w-8 mb-2" />
                                <p className="text-xs">No tasks</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <TaskCard key={task.TaskID} task={task} onClick={onTaskClick} />
                            ))
                        )}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
}
