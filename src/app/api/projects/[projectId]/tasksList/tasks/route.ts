import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

// Helper to get user ID from JWT token
function getUserId(request: NextRequest): number | null {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return null;
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number; username: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

// GET: Fetch all tasks for a project (via its task lists)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { projectId } = await params;
        const projectIdInt = parseInt(projectId);

        if (isNaN(projectIdInt)) {
            return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
        }

        // Verify user has access to this project
        const project = await prisma.project.findUnique({
            where: { ProjectID: projectIdInt },
            include: { Members: { where: { UserID: userId } } },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const isCreator = project.CreatedBy === userId;
        const isMember = project.Members.length > 0;

        if (!isCreator && !isMember) {
            return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
        }

        // Fetch all tasks across all task lists for this project
        const tasks = await prisma.task.findMany({
            where: {
                TaskList: {
                    ProjectID: projectIdInt,
                },
            },
            include: {
                Assignee: {
                    select: { UserID: true, UserName: true, Email: true },
                },
                TaskList: {
                    select: { ListID: true, ListName: true, ProjectID: true },
                },
            },
            orderBy: { CreatedAt: 'desc' },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Fetch project tasks error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new task in a project's task list
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { projectId } = await params;
        const projectIdInt = parseInt(projectId);

        if (isNaN(projectIdInt)) {
            return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
        }

        // Verify user has access to this project
        const project = await prisma.project.findUnique({
            where: { ProjectID: projectIdInt },
            include: { Members: { where: { UserID: userId } } },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const isCreator = project.CreatedBy === userId;
        const isMember = project.Members.length > 0;

        if (!isCreator && !isMember) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Read request body
        const body = await request.json();
        const { title, description, priority, status, dueDate, assignedTo } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
        }

        // Find or create a default task list for this project
        let taskList = await prisma.taskList.findFirst({
            where: { ProjectID: projectIdInt },
            orderBy: { ListID: 'asc' },
        });

        if (!taskList) {
            // Auto-create a default "General" task list for the project
            taskList = await prisma.taskList.create({
                data: {
                    ProjectID: projectIdInt,
                    ListName: 'General',
                },
            });
        }

        // Create the task and record history in a transaction
        const newTask = await prisma.$transaction(async (tx) => {
            const task = await tx.task.create({
                data: {
                    ListID: taskList.ListID,
                    Title: title.trim(),
                    Description: description || null,
                    Priority: priority || 'Medium',
                    Status: status || 'Pending',
                    DueDate: dueDate ? new Date(dueDate) : null,
                    AssignedTo: assignedTo ? Number(assignedTo) : null,
                },
                include: {
                    Assignee: {
                        select: { UserID: true, UserName: true, Email: true },
                    },
                    TaskList: {
                        select: { ListID: true, ListName: true, ProjectID: true },
                    },
                },
            });

            // Record task creation in history
            await tx.taskHistory.create({
                data: {
                    TaskID: task.TaskID,
                    ChangedBy: userId,
                    ChangeType: 'Created',
                    ChangeTime: new Date(),
                },
            });

            return task;
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error('Create project task error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
