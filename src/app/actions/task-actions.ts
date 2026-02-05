'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper to get authenticated user ID
async function getAuthUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        return decoded.userId as number;
    } catch (error) {
        return null;
    }
}

export async function toggleTaskStatus(taskId: number, currentStatus: string) {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';

    try {
        await prisma.task.update({
            where: { TaskID: taskId },
            data: { Status: newStatus },
        });
        revalidatePath('/tasks/u_tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle task status:', error);
        return { success: false, error: 'Failed to update task' };
    }
}

export async function createPersonalTask(title: string) {
    const userId = await getAuthUserId();
    if (!userId) {
        throw new Error('Unauthorized');
    }

    try {
        // 1. Find or create a "Personal" project for this user
        let project = await prisma.project.findFirst({
            where: {
                CreatedBy: userId,
                ProjectName: 'Personal',
            },
        });

        if (!project) {
            project = await prisma.project.create({
                data: {
                    ProjectName: 'Personal',
                    Description: 'Personal tasks',
                    CreatedBy: userId,
                    Status: 'Active',
                }
            });
        }

        // 2. Find or create a "To Do" list in this project
        let taskList = await prisma.taskList.findFirst({
            where: {
                ProjectID: project.ProjectID,
                ListName: 'To Do'
            }
        });

        if (!taskList) {
            taskList = await prisma.taskList.create({
                data: {
                    ProjectID: project.ProjectID,
                    ListName: 'To Do'
                }
            });
        }

        // 3. Create the task
        await prisma.task.create({
            data: {
                Title: title,
                AssignedTo: userId,
                ListID: taskList.ListID,
                Status: 'Pending',
                Priority: 'Medium',
                DueDate: new Date(), // Due Today by default for quick add
            },
        });

        revalidatePath('/tasks/u_tasks');
        return { success: true };
    } catch (error) {
        console.error('Failed to create personal task:', error);
        return { success: false, error: 'Failed to create task' };
    }
}
