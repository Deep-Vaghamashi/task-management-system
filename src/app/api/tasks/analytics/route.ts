import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

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

export async function GET(request: Request) {
    try {
        const userId = getUserId(request);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        // Base filter: Tasks in projects user is part of, or assigned to user
        // If projectId is given, filter by that.

        // This is a simplified query. In a real world, we'd need more complex filtering.
        // For now, let's get analytics for "All tasks user has access to" OR "Specific Project"

        const whereClause: any = {};
        if (projectId) {
            // Verify access (omitted for brevity, duplicate of tasks route)
            // simplified:
            const isMember = await prisma.projectMember.findFirst({
                where: { ProjectID: Number(projectId), UserID: userId }
            });
            const project = await prisma.project.findUnique({ where: { ProjectID: Number(projectId) } });

            if (!isMember && project?.CreatedBy !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
            whereClause.TaskList = { ProjectID: Number(projectId) };
        } else {
            // "My Analytics" -> Tasks assigned to me
            whereClause.AssignedTo = userId;
        }

        const [byPriority, byStatus, recentHistory] = await Promise.all([
            prisma.task.groupBy({
                by: ['Priority'],
                where: whereClause,
                _count: {
                    Priority: true
                }
            }),
            prisma.task.groupBy({
                by: ['Status'],
                where: whereClause,
                _count: {
                    Status: true
                }
            }),
            prisma.taskHistory.findMany({
                where: {
                    Task: whereClause
                },
                orderBy: { ChangeTime: 'desc' },
                take: 10,
                include: {
                    Task: { select: { Title: true } },
                    User: { select: { UserName: true } }
                }
            })
        ]);

        return NextResponse.json({
            priorityDistribution: byPriority,
            statusDistribution: byStatus,
            recentActivity: recentHistory
        });

    } catch (error) {
        console.error("Analytics Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
