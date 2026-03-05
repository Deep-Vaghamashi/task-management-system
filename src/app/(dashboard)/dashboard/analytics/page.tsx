import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { AnalyticsView } from "@/components/analytics/analytics-view";

async function getAnalyticsData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return null;
    }

    try {
        const decoded = verify(token.value, process.env.JWT_SECRET!) as { userId: number };
        const userId = decoded.userId;

        // ── 1. Task Counts ────────────────────────────────────────────
        const totalTasks = await prisma.task.count({
            where: {
                OR: [
                    { AssignedTo: userId },
                    { TaskList: { Project: { CreatedBy: userId } } },
                ],
            },
        });

        const completedTasks = await prisma.task.count({
            where: {
                OR: [
                    { AssignedTo: userId },
                    { TaskList: { Project: { CreatedBy: userId } } },
                ],
                Status: 'Completed',
            },
        });

        const inProgressTasks = await prisma.task.count({
            where: {
                OR: [
                    { AssignedTo: userId },
                    { TaskList: { Project: { CreatedBy: userId } } },
                ],
                Status: 'InProgress',
            },
        });

        const overdueTasks = await prisma.task.count({
            where: {
                OR: [
                    { AssignedTo: userId },
                    { TaskList: { Project: { CreatedBy: userId } } },
                ],
                Status: { not: 'Completed' },
                DueDate: { lt: new Date() },
            },
        });

        // ── 2. KPI Cards ──────────────────────────────────────────────
        const completionRate = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        const kpi = [
            {
                label: "Total Tasks",
                value: totalTasks,
                change: `${completedTasks} done`,
                trend: "neutral" as const,
                icon: "CheckCircle",
            },
            {
                label: "Completion Rate",
                value: `${completionRate}%`,
                change: `${completedTasks}/${totalTasks}`,
                trend: completionRate >= 70 ? "up" as const : completionRate >= 40 ? "neutral" as const : "down" as const,
                icon: "TrendingUp",
            },
            {
                label: "In Progress",
                value: inProgressTasks,
                change: `${totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% of total`,
                trend: "neutral" as const,
                icon: "Activity",
            },
            {
                label: "Overdue",
                value: overdueTasks,
                change: overdueTasks > 0 ? "Needs attention" : "All on track",
                trend: overdueTasks > 0 ? "down" as const : "up" as const,
                icon: "Users",
            },
        ];

        // ── 3. Completion Trend (last 14 days) ────────────────────────
        const today = new Date();
        const fourteenDaysAgo = new Date(today);
        fourteenDaysAgo.setDate(today.getDate() - 13);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const completedHistory = await prisma.taskHistory.findMany({
            where: {
                ChangeType: { contains: 'Completed' },
                ChangeTime: { gte: fourteenDaysAgo },
                Task: {
                    TaskList: { Project: { CreatedBy: userId } },
                },
            },
            select: { ChangeTime: true },
        });

        // Build day-by-day
        const completionTrend: { date: string; tasks: number }[] = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - (13 - i));
            const dateStr = d.toISOString().split('T')[0];
            completionTrend.push({ date: dateStr, tasks: 0 });
        }

        completedHistory.forEach((entry) => {
            const dateStr = new Date(entry.ChangeTime).toISOString().split('T')[0];
            const found = completionTrend.find((ct) => ct.date === dateStr);
            if (found) found.tasks++;
        });

        // ── 4. Project Status Distribution ────────────────────────────
        const projectStatusGroups = await prisma.project.groupBy({
            by: ['Status'],
            where: { CreatedBy: userId },
            _count: { Status: true },
        });

        const projectStatus = projectStatusGroups.map((g) => ({
            name: g.Status,
            value: g._count.Status,
        }));

        // If no projects, provide a placeholder
        if (projectStatus.length === 0) {
            projectStatus.push({ name: 'No Projects', value: 0 });
        }

        // ── 5. Team Workload (tasks per team member) ──────────────────
        const teamTasks = await prisma.task.groupBy({
            by: ['AssignedTo'],
            where: {
                TaskList: { Project: { CreatedBy: userId } },
                AssignedTo: { not: null },
                Status: { not: 'Completed' },
            },
            _count: { TaskID: true },
            orderBy: { _count: { TaskID: 'desc' } },
            take: 8,
        });

        // Fetch usernames for those IDs
        const userIds = teamTasks
            .map((t) => t.AssignedTo)
            .filter((id): id is number => id !== null);

        const users = await prisma.user.findMany({
            where: { UserID: { in: userIds } },
            select: { UserID: true, UserName: true },
        });

        const userMap = new Map(users.map((u) => [u.UserID, u.UserName]));

        const teamWorkload = teamTasks.map((t) => ({
            name: userMap.get(t.AssignedTo!) || 'Unknown',
            activeTasks: t._count.TaskID,
        }));

        return { kpi, completionTrend, projectStatus, teamWorkload };
    } catch (error) {
        console.error("Analytics data fetch failed:", error);
        return null;
    }
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Unable to load analytics. Please log in again.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
            <AnalyticsView data={data} />
        </div>
    );
}
