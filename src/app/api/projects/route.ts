import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. Security Check
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse Query Params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // 3. Database Action
    const projects = await prisma.project.findMany({
      where: {
        ProjectName: {
          contains: search,
          // mode: 'insensitive' // Note: Prisma MySQL default collation is usually case-insensitive, but 'insensitive' mode is Postgres specific or requires specific collation in MySQL. Removing to avoid error if not configured.
        }
      },
      orderBy: {
        CreatedAt: 'desc'
      },
      include: {
        Creator: {
          select: {
            UserName: true,
            Email: true
          }
        }
      }
    });

    return NextResponse.json(projects, { status: 200 });

  } catch (error) {
    console.error("Project fetch failed:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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