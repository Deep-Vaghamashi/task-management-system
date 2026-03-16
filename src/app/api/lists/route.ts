import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // 2. Read Data
    const body = await request.json();
    const { listName, projectId } = body;

    // 3. Validation
    if (!listName || !projectId) {
      return NextResponse.json(
        { error: 'List Name and Project ID are required' },
        { status: 400 }
      );
    }

    // 4. Verify Ownership (Security)
    // Ensure the project belongs to this user before modifying it
    const project = await prisma.project.findUnique({
      where: { ProjectID: Number(projectId) },
    });

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.CreatedBy !== userId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this project' }, { status: 403 });
    }

    // 5. Create the List
    const newList = await prisma.taskList.create({
      data: {
        ListName: listName,
        ProjectID: Number(projectId),
      },
    });

    return NextResponse.json(
      { message: 'List created successfully', list: newList },
      { status: 201 }
    );

  } catch (error) {
    console.error("List creation failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}