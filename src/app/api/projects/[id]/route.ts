import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get user from token
const getUser = (request: NextRequest) => {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;
    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        return decoded;
    } catch (e) {
        return null;
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // params is a Promise in Next.js 15
) {
    try {
        const user = getUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { ProjectID: projectId },
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

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await request.json();
        const { projectName, description, status, dueDate } = body;

        // Validation
        if (!projectName) {
            return NextResponse.json({ error: 'Project Name is required' }, { status: 400 });
        }

        // Verify ownership (optional but good practice)
        // const existingProject = await prisma.project.findUnique...

        const updatedProject = await prisma.project.update({
            where: { ProjectID: projectId },
            data: {
                ProjectName: projectName,
                Description: description,
                Status: status,
                DueDate: dueDate ? new Date(dueDate) : null
            }
        });

        return NextResponse.json(updatedProject);

    } catch (error) {
        console.error("Update project error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
