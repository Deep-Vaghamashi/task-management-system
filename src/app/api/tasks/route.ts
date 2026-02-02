import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    // We might use decoded.userId later for logging history

    // 2. Read Data
    const body = await request.json();
    const { listId, title, description, priority, dueDate } = body;

    // 3. Validation
    if (!listId || !title) {
      return NextResponse.json(
        { error: 'List ID and Title are required' },
        { status: 400 }
      );
    }

    // 4. Create the Task
    const newTask = await prisma.task.create({
      data: {
        ListID: Number(listId),
        Title: title,
        Description: description || null,
        Priority: priority || 'Medium',
        DueDate: dueDate ? new Date(dueDate) : null, // Convert string to Date
        Status: 'Pending' // Default status
      },
    });

    return NextResponse.json(
      { message: 'Task created successfully', task: newTask },
      { status: 201 }
    );

  } catch (error) {
    console.error("Task creation failed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}