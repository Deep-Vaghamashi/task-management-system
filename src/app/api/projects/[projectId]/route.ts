import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

// Helper to validate the token and get the user ID
const getUserId = (request: NextRequest): number | null => {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    return decoded.userId;
  } catch (e) {
    return null;
  }
};

// 1. GET: Fetch a single project
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

    const project = await prisma.project.findUnique({
      where: { ProjectID: projectIdInt },
      include: {
        Creator: { select: { UserName: true, Email: true } },
        Members: {
          include: {
            User: {
              select: {
                UserID: true,
                UserName: true,
                Email: true,
                Role: true
              }
            }
          }
        },
        TaskLists: {
          include: {
            Tasks: {
              select: {
                TaskID: true,
                Status: true,
                Priority: true,
                DueDate: true,
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error("Fetch project error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PATCH: Update project details
export async function PATCH(
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

    const body = await request.json();
    const { projectName, description, status, dueDate, employeeIds } = body;

    // Optional: Verify user owns the project before updating
    const existingProject = await prisma.project.findUnique({
      where: { ProjectID: projectIdInt }
    });

    if (!existingProject) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    if (existingProject.CreatedBy !== userId) {
      return NextResponse.json({ error: 'Only the owner can edit this project' }, { status: 403 });
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      // 1. Update Project Details
      const project = await tx.project.update({
        where: { ProjectID: projectIdInt },
        data: {
          ProjectName: projectName,
          Description: description,
          Status: status,
          DueDate: dueDate ? new Date(dueDate) : null
        }
      });

      // 2. Update Members if provided
      if (employeeIds) {
        // Remove existing members (except maybe the creator if they are in the list? logic assumes Members list is the NEW full list)
        // Actually, ProjectMember table has (ProjectID, UserID) PK.
        // Simplest strategy: Delete all members for this project and re-create.
        // BUT: We might want to keep roles or join dates. 
        // For this task: "sync the ProjectMember table (using deleteMany and createMany)"

        await tx.projectMember.deleteMany({
          where: { ProjectID: projectIdInt }
        });

        if (employeeIds.length > 0) {
          await tx.projectMember.createMany({
            data: employeeIds.map((id: number) => ({
              ProjectID: projectIdInt,
              UserID: id,
              Role: 'Member'
            }))
          });
        }
      }

      return project;
    });

    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. DELETE: Remove project and all related data
export async function DELETE(
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

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { ProjectID: projectIdInt }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.CreatedBy !== userId) {
      return NextResponse.json({ error: 'Only the project owner can delete this project' }, { status: 403 });
    }

    // Transaction to safely delete everything 🛡️
    await prisma.$transaction(async (tx) => {
      // A. Find lists to identify tasks
      const taskLists = await tx.taskList.findMany({
        where: { ProjectID: projectIdInt },
        select: { ListID: true }
      });

      const listIds = taskLists.map(l => l.ListID);

      // B. Delete Tasks in those lists
      if (listIds.length > 0) {
        await tx.task.deleteMany({
          where: { ListID: { in: listIds } }
        });
      }

      // C. Delete TaskLists
      await tx.taskList.deleteMany({
        where: { ProjectID: projectIdInt }
      });

      // D. Delete ProjectMembers
      await tx.projectMember.deleteMany({
        where: { ProjectID: projectIdInt }
      });

      // E. Delete the Project
      await tx.project.delete({
        where: { ProjectID: projectIdInt }
      });
    });

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}