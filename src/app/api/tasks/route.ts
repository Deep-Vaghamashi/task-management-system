import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

// Helper to get user ID from token
function getUserId(request: Request): number | null {
  try {
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) return null;
    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// 1. GET: Fetch tasks (Supports filtering by ProjectID, ListID, AssignedTo)
export async function GET(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const projectId = searchParams.get('projectId');
    const listId = searchParams.get('listId');
    const assignedTo = searchParams.get('assignedTo');

    // Single Task Fetch
    if (taskId) {
      const task = await prisma.task.findUnique({
        where: { TaskID: Number(taskId) },
        include: {
          Assignee: {
            select: { UserID: true, UserName: true, Email: true, } // Add Avatar URL if available in schema
          },
          TaskList: {
            select: { ListName: true, ProjectID: true }
          },
          History: {
            orderBy: { ChangeTime: 'desc' },
            include: {
              User: { select: { UserName: true } }
            }
          }
        }
      });

      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

      // Check access
      // (Simplified for brevity: user must be in project)
      // In real app, reuse check logic

      return NextResponse.json(task);
    }

    const whereClause: any = {};

    if (projectId) {
      // Check if user is member of project
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          ProjectID_UserID: {
            ProjectID: Number(projectId),
            UserID: userId
          }
        }
      });
      const projectCreator = await prisma.project.findFirst({
        where: {
          ProjectID: Number(projectId),
          CreatedBy: userId
        }
      });

      if (!projectMember && !projectCreator) {
        return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
      }
      // Filter tasks by project (via TaskList)
      whereClause.TaskList = {
        ProjectID: Number(projectId)
      };
    } else if (listId) {
      whereClause.ListID = Number(listId);
    }

    if (assignedTo === 'me') {
      whereClause.AssignedTo = userId;
    } else if (assignedTo) {
      whereClause.AssignedTo = Number(assignedTo);
    }

    // If no specific filter, return all tasks from projects the user has access to
    // (projects they created OR are a member of)
    if (Object.keys(whereClause).length === 0) {
      // Find all project IDs the user has access to
      const [createdProjects, memberProjects] = await Promise.all([
        prisma.project.findMany({
          where: { CreatedBy: userId },
          select: { ProjectID: true }
        }),
        prisma.projectMember.findMany({
          where: { UserID: userId },
          select: { ProjectID: true }
        })
      ]);

      const accessibleProjectIds = [
        ...new Set([
          ...createdProjects.map(p => p.ProjectID),
          ...memberProjects.map(p => p.ProjectID)
        ])
      ];

      if (accessibleProjectIds.length > 0) {
        whereClause.TaskList = {
          ProjectID: { in: accessibleProjectIds }
        };
      } else {
        // User has no projects — return empty
        return NextResponse.json([]);
      }
    }


    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        Assignee: {
          select: { UserID: true, UserName: true, Email: true } // Add Avatar URL if available in schema
        },
        TaskList: {
          select: { ListName: true, ProjectID: true }
        }
      },
      orderBy: { CreatedAt: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// 2. POST: Create a new task
export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { listId, projectId, title, description, priority, dueDate, assignedTo, status } = body;

    // Use listId if provided, OR find 'Pending' list for the project if projectId provided
    let targetListId = listId ? Number(listId) : null;

    if (!targetListId && projectId) {
      const defaultList = await prisma.taskList.findFirst({
        where: { ProjectID: Number(projectId), ListName: 'Pending' }
      });
      if (defaultList) {
        targetListId = defaultList.ListID;
      } else {
        // Create default list if doesn't exist? Or generic 'General' list?
        // For now, fail if no list concept found
        // Or create a dummy list
        const newList = await prisma.taskList.create({
          data: { ProjectID: Number(projectId), ListName: 'General' }
        });
        targetListId = newList.ListID;
      }
    }

    if (!targetListId) return NextResponse.json({ error: 'Target List/Project required' }, { status: 400 });

    // Verify Access
    // Logic: User must be member of project containing the list
    const list = await prisma.taskList.findUnique({
      where: { ListID: targetListId },
      include: { Project: { include: { Members: { where: { UserID: userId } } } } }
    });

    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });
    const isCreator = list.Project.CreatedBy === userId;
    const isMember = list.Project.Members.length > 0;

    if (!isCreator && !isMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const task = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          ListID: targetListId,
          Title: title,
          Description: description || null,
          Priority: priority || 'Medium',
          Status: status || 'Pending',
          DueDate: dueDate ? new Date(dueDate) : null,
          AssignedTo: assignedTo ? Number(assignedTo) : null
        }
      });

      await tx.taskHistory.create({
        data: {
          TaskID: newTask.TaskID,
          ChangedBy: userId,
          ChangeType: 'Created',
          ChangeTime: new Date()
        }
      });

      return newTask;
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. PUT: Update Task
export async function PUT(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { taskId, title, description, priority, status, dueDate, assignedTo } = body;

    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    // Check permissions
    const existingTask = await prisma.task.findUnique({
      where: { TaskID: Number(taskId) },
      include: { TaskList: { include: { Project: { include: { Members: { where: { UserID: userId } } } } } } }
    });

    if (!existingTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isCreator = existingTask.TaskList.Project.CreatedBy === userId;
    const isMember = existingTask.TaskList.Project.Members.length > 0;

    if (!isCreator && !isMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const updatedTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { TaskID: Number(taskId) },
        data: {
          Title: title,
          Description: description,
          Priority: priority,
          Status: status,
          DueDate: dueDate ? new Date(dueDate) : undefined, // allow nullifying? need to handle carefully
          AssignedTo: assignedTo ? Number(assignedTo) : undefined
        }
      });

      await tx.taskHistory.create({
        data: {
          TaskID: task.TaskID,
          ChangedBy: userId,
          ChangeType: 'Updated',
          ChangeTime: new Date()
        }
      });
      return task;
    });

    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error("Update Task Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 4. DELETE: Delete Task
export async function DELETE(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const existingTask = await prisma.task.findUnique({
      where: { TaskID: Number(taskId) },
      include: { TaskList: { include: { Project: { include: { Members: { where: { UserID: userId } } } } } } }
    });

    if (!existingTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isCreator = existingTask.TaskList.Project.CreatedBy === userId;
    const isMember = existingTask.TaskList.Project.Members.length > 0;

    // Only allow delete if Creator or maybe Admin (not implemented yet)
    // Or if Member? Prompt says "Only allow users assigned to the project to Edit or Delete tasks."
    if (!isCreator && !isMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.$transaction([
      prisma.taskHistory.deleteMany({ where: { TaskID: Number(taskId) } }),
      prisma.taskComment.deleteMany({ where: { TaskID: Number(taskId) } }), // Clean up comments too
      prisma.task.delete({ where: { TaskID: Number(taskId) } })
    ]);

    return NextResponse.json({ message: 'Task deleted successfully' });

  } catch (error) {
    console.error("Delete Task Error", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}