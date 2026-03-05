import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 1. Security Check
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number | null = null;
    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Parse Query Params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '6')));
    const sortBy = searchParams.get('sortBy') || 'CreatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const status = searchParams.get('status') || 'all';

    // 3. Build where clause — only show projects the user created or is a member of
    const where: any = {
      OR: [
        { CreatedBy: userId },
        { Members: { some: { UserID: userId } } }
      ]
    };

    if (search) {
      where.ProjectName = { contains: search };
    }

    if (status !== 'all') {
      where.Status = status;
    }

    // 4. Build orderBy clause
    const allowedSortFields = ['CreatedAt', 'ProjectName', 'DueDate'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'CreatedAt';
    const orderBy = { [orderByField]: sortOrder };

    // 5. Get total count for pagination
    const total = await prisma.project.count({ where });

    // 6. Fetch paginated projects
    const projects = await prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        Creator: {
          select: {
            UserName: true,
            Email: true
          }
        },
        Members: {
          include: {
            User: {
              select: {
                UserID: true,
                UserName: true,
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
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });

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
    // Extract dueDate along with other fields
    const { projectName, description, dueDate } = body;

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
        // Convert the string date to a Date object, or set null if empty
        Status: body.status || "Active",
        DueDate: dueDate ? new Date(dueDate) : null,
        CreatedBy: decoded.userId,
        // Add members if provided
        Members: body.employeeIds && body.employeeIds.length > 0 ? {
          create: body.employeeIds.map((id: number) => ({
            UserID: id,
            Role: 'Member'
          }))
        } : undefined
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