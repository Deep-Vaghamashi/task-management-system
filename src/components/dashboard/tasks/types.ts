import { Task, User, TaskList, Project, TaskHistory } from '@prisma/client';

export type TaskWithRelations = Task & {
    Assignee: {
        UserID: number;
        UserName: string;
        Email: string;
        Avatar?: string; // Optional if not in schema yet
    } | null;
    TaskList: {
        ListName: string;
        ProjectID: number;
    };
    History?: (TaskHistory & {
        User: { UserName: string };
    })[];
};

export type TaskStatus = 'Pending' | 'In Progress' | 'Done'; // Matches Kanban columns

export interface KanbanColumn {
    id: TaskStatus;
    title: string;
    tasks: TaskWithRelations[];
}
