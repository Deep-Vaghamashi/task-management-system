import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    
    // 2. Read Data
    const body = await request.json();
    const { projectName, description } = body;

    // 3. Validation
    if (!projectName) {
        return NextResponse.json(
            { error: 'Project name is required' },
            { status: 400 }
        );
    }

    // 4. Database Action
    const newProject = await prisma.project.create({
      data: {
        ProjectName: projectName,
        Description: description,
        CreatedBy: decoded.userId // Securely set the creator
      }
    });

    return NextResponse.json(
      { message: 'Project created successfully', project: newProject },
      { status: 201 }
    );

  } catch (error) {
    console.error("Project creation failed:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}