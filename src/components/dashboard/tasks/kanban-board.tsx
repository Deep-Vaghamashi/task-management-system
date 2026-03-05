'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    closestCorners // or custom collision detection
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskWithRelations, TaskStatus } from './types';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
    tasks: TaskWithRelations[];
    onTaskMove: (taskId: number, newStatus: TaskStatus) => void;
    onTaskClick: (task: TaskWithRelations) => void;
}

export function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

    const columns: { id: TaskStatus; title: string }[] = [
        { id: 'Pending', title: 'Pending' },
        { id: 'In Progress', title: 'In Progress' },
        { id: 'Done', title: 'Done' },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required to start drag
            },
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        // Optional: Implement robust drag over logic if managing sorting within columns carefully
        // For simple status change, onDragEnd is often sufficient mostly
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = active.data.current?.task as TaskWithRelations;

        // Dropped over a Column (empty area)
        if (over.data.current?.type === 'Column') {
            const newStatus = over.data.current.columnId as TaskStatus;
            if (activeTask.Status !== newStatus) {
                onTaskMove(Number(activeId), newStatus);
            }
        }
        // Dropped over another Task
        else if (over.data.current?.type === 'Task') {
            const overTask = over.data.current.task as TaskWithRelations;
            const newStatus = overTask.Status as TaskStatus;
            if (activeTask.Status !== newStatus) {
                onTaskMove(Number(activeId), newStatus);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            collisionDetection={closestCorners}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => (
                    <div key={col.id} className="flex-1 min-w-[300px]">
                        <KanbanColumn
                            id={col.id}
                            title={col.title}
                            tasks={tasks.filter((t) => t.Status === col.id)}
                            onTaskClick={onTaskClick}
                        />
                    </div>
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask && (
                        <div className="opacity-80 rotate-2 cursor-grabbing">
                            <TaskCard task={activeTask} onClick={() => { }} />
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
