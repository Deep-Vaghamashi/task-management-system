import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // 1. Verify the caller is authenticated
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verify(token, process.env.JWT_SECRET!) as {
            userId: number;
            username: string;
        };

        // 2. Verify the caller is a Manager
        const caller = await prisma.user.findUnique({
            where: { UserID: decoded.userId },
            select: { UserID: true, Role: true },
        });

        if (!caller || caller.Role !== 'Manager') {
            return NextResponse.json(
                { error: 'Forbidden: Manager access required' },
                { status: 403 }
            );
        }

        // 3. Parse the target userId
        const { userId } = await params;
        const targetUserId = parseInt(userId, 10);
        if (isNaN(targetUserId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // 4. Check that the target user exists
        const targetUser = await prisma.user.findUnique({
            where: { UserID: targetUserId },
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 5. Cascade delete all related data in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete comments made by this user
            await tx.taskComment.deleteMany({ where: { UserID: targetUserId } });

            // Delete history entries by this user
            await tx.taskHistory.deleteMany({ where: { ChangedBy: targetUserId } });

            // Unassign tasks assigned to this user (don't delete the tasks)
            await tx.task.updateMany({
                where: { AssignedTo: targetUserId },
                data: { AssignedTo: null },
            });

            // Remove project memberships
            await tx.projectMember.deleteMany({ where: { UserID: targetUserId } });

            // Delete projects created by this user (cascade: taskLists -> tasks -> comments/history)
            const ownedProjects = await tx.project.findMany({
                where: { CreatedBy: targetUserId },
                select: { ProjectID: true },
            });

            for (const project of ownedProjects) {
                const taskLists = await tx.taskList.findMany({
                    where: { ProjectID: project.ProjectID },
                    select: { ListID: true },
                });
                const listIds = taskLists.map((tl) => tl.ListID);

                if (listIds.length > 0) {
                    // Delete comments on tasks in these lists
                    await tx.taskComment.deleteMany({
                        where: { Task: { ListID: { in: listIds } } },
                    });
                    // Delete history for tasks in these lists
                    await tx.taskHistory.deleteMany({
                        where: { Task: { ListID: { in: listIds } } },
                    });
                    // Delete tasks in these lists
                    await tx.task.deleteMany({
                        where: { ListID: { in: listIds } },
                    });
                }

                // Delete task lists
                await tx.taskList.deleteMany({ where: { ProjectID: project.ProjectID } });

                // Delete project members
                await tx.projectMember.deleteMany({ where: { ProjectID: project.ProjectID } });
            }

            // Delete the projects themselves
            await tx.project.deleteMany({ where: { CreatedBy: targetUserId } });

            // Finally, delete the user
            await tx.user.delete({ where: { UserID: targetUserId } });
        });

        // 6. If the manager deleted themselves, clear the auth cookie
        const isSelfDelete = targetUserId === caller.UserID;
        const response = NextResponse.json({
            message: `User deleted successfully`,
            selfDelete: isSelfDelete,
        });

        if (isSelfDelete) {
            response.cookies.set('token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 0,
                path: '/',
            });
        }

        return response;
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
