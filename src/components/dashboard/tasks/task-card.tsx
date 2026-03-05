'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, UserIcon, AlertTriangle } from 'lucide-react';
import { TaskWithRelations } from './types';
import { format } from 'date-fns';

interface TaskCardProps {
    task: TaskWithRelations;
    onClick: (task: TaskWithRelations) => void;
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
    'High': { color: 'text-red-600', bg: 'bg-red-500/10', badge: 'destructive' },
    'Medium': { color: 'text-amber-600', bg: 'bg-amber-500/10', badge: 'outline' },
    'Low': { color: 'text-emerald-600', bg: 'bg-emerald-500/10', badge: 'secondary' },
};

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.TaskID,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const prioConfig = PRIORITY_CONFIG[task.Priority] || PRIORITY_CONFIG['Medium'];
    const isOverdue = task.DueDate && new Date(task.DueDate) < new Date() && task.Status !== 'Done' && task.Status !== 'Completed';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2.5 touch-none">
            <Card
                className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${isOverdue ? 'border-l-red-500' :
                    task.Priority === 'High' ? 'border-l-red-400' :
                        task.Priority === 'Medium' ? 'border-l-amber-400' :
                            'border-l-emerald-400'
                    } bg-card`}
                onClick={() => onClick(task)}
            >
                <CardHeader className="p-3 pb-1.5">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-semibold line-clamp-2 leading-tight flex-1">
                            {task.Title}
                        </h4>
                        <Badge
                            variant={prioConfig.badge}
                            className={`text-[10px] px-1.5 py-0 h-5 whitespace-nowrap shrink-0 ${prioConfig.bg} ${prioConfig.color} border-0`}
                        >
                            {task.Priority}
                        </Badge>
                    </div>
                </CardHeader>

                {task.Description && (
                    <CardContent className="px-3 pt-0 pb-1.5">
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {task.Description}
                        </p>
                    </CardContent>
                )}

                <CardFooter className="px-3 pb-3 pt-1.5 flex justify-between items-center text-xs text-muted-foreground">
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        {isOverdue ? (
                            <AlertTriangle className="w-3 h-3" />
                        ) : (
                            <CalendarIcon className="w-3 h-3" />
                        )}
                        {task.DueDate ? format(new Date(task.DueDate), 'MMM d') : 'No date'}
                    </div>

                    {task.Assignee ? (
                        <div className="flex items-center gap-1.5">
                            <Avatar className="w-5 h-5 border border-background">
                                <AvatarImage src={task.Assignee.Avatar} alt={task.Assignee.UserName} />
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                    {getInitials(task.Assignee.UserName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] hidden sm:inline">{task.Assignee.UserName}</span>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="w-3 h-3 opacity-50" />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
