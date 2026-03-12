import React from 'react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FolderKanban,
  Activity,
  Plus,
  Search,
  UserPlus,
  Users,
  ListChecks,
  AlertTriangle,
} from 'lucide-react';

import { OverviewChart } from './_components/OverviewChart';
import { ProjectStatusDistribution } from './_components/ProjectStatusDistribution';
import { RecentActivity } from './_components/RecentActivity';
import { TeamMembers } from './_components/TeamMembers';

// ── Helper: Time-aware greeting ─────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Helper: Get day label (Mon, Tue, ...) ───────────────────────────────
function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  // Initialize variables
  let username = "Guest";
  let userId: number | null = null;
  let userRole = "Employee";
  let totalProjects = 0;

  let activeTasks: { TaskID: number; Title: string; Status: string; Priority: string; DueDate: Date | null; TaskList: { Project: { ProjectName: string } } }[] = [];
  let recentActivities: { HistoryID: number; ChangeType: string; ChangeTime: Date; User: { UserName: string }; Task: { Title: string } }[] = [];

  // Project Status Counts
  let activeProjects = 0;
  let onHoldProjects = 0;
  let completedProjects = 0;

  // Task Stats
  let totalPendingTasks = 0;
  let overdueTasks = 0;

  // Chart data (last 7 days)
  let chartData: { name: string; completed: number }[] = [];

  // Team members
  let teamMembers: { name: string; role: string; initials: string }[] = [];

  if (token) {
    try {
      const decoded = verify(token.value, process.env.JWT_SECRET!) as { userId: number; username: string };
      userId = decoded.userId;

      if (userId) {
        // A. Fetch User & Role
        const user = await prisma.user.findUnique({
          where: { UserID: userId },
          select: { UserName: true, Role: true }
        });

        if (user) {
          username = user.UserName;
          userRole = user.Role;
        }

        // B. Fetch Project Stats
        const projectCounts = await prisma.project.groupBy({
          by: ['Status'],
          where: { CreatedBy: userId },
          _count: { Status: true }
        });

        projectCounts.forEach(group => {
          if (group.Status === 'Active') activeProjects = group._count.Status;
          if (group.Status === 'On Hold') onHoldProjects = group._count.Status;
          if (group.Status === 'Completed') completedProjects = group._count.Status;
        });

        totalProjects = activeProjects + onHoldProjects + completedProjects;

        // C. Fetch Task Stats
        totalPendingTasks = await prisma.task.count({
          where: {
            OR: [
              { AssignedTo: userId },
              { TaskList: { Project: { CreatedBy: userId } } }
            ],
            Status: { not: 'Completed' }
          }
        });

        overdueTasks = await prisma.task.count({
          where: {
            OR: [
              { AssignedTo: userId },
              { TaskList: { Project: { CreatedBy: userId } } }
            ],
            Status: { not: 'Completed' },
            DueDate: { lt: new Date() }
          }
        });

        // D. Fetch Active Tasks (top 5)
        activeTasks = await prisma.task.findMany({
          where: {
            OR: [
              { AssignedTo: userId },
              { TaskList: { Project: { CreatedBy: userId } } }
            ],
            Status: { not: 'Completed' }
          },
          take: 5,
          orderBy: { DueDate: 'asc' },
          include: {
            TaskList: {
              include: { Project: true }
            }
          }
        });

        // E. Fetch Recent Activity
        recentActivities = await prisma.taskHistory.findMany({
          where: {
            Task: {
              TaskList: {
                Project: { CreatedBy: userId }
              }
            }
          },
          take: 5,
          orderBy: { ChangeTime: 'desc' },
          include: {
            User: { select: { UserName: true } },
            Task: { select: { Title: true } }
          }
        });

        // F. Chart Data — tasks completed per day (last 7 days)
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const completedTasksLast7 = await prisma.taskHistory.findMany({
          where: {
            ChangeType: { contains: 'Completed' },
            ChangeTime: { gte: sevenDaysAgo },
            Task: {
              TaskList: {
                Project: { CreatedBy: userId }
              }
            }
          },
          select: { ChangeTime: true }
        });

        // Build day-by-day map
        const dayMap: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const label = getDayLabel(d);
          dayMap[label] = 0;
        }

        completedTasksLast7.forEach(entry => {
          const label = getDayLabel(new Date(entry.ChangeTime));
          if (dayMap[label] !== undefined) {
            dayMap[label]++;
          }
        });

        chartData = Object.entries(dayMap).map(([name, completed]) => ({ name, completed }));

        // G. Team Members — fetch distinct users from ProjectMember for this user's projects
        const projectMembers = await prisma.projectMember.findMany({
          where: {
            Project: { CreatedBy: userId }
          },
          include: {
            User: {
              select: { UserName: true, Role: true }
            }
          },
          distinct: ['UserID'],
          take: 8,
        });

        teamMembers = projectMembers.map(pm => ({
          name: pm.User.UserName,
          role: pm.User.Role,
          initials: pm.User.UserName.substring(0, 2).toUpperCase(),
        }));
      }

    } catch (error) {
      console.error("Data fetch failed", error);
    }
  }

  // ── Stats Grid ──────────────────────────────────────────────────────
  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: FolderKanban,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      trend: "All Time",
      trendUp: true,
      subtext: "created by you"
    },
    {
      title: "Active Projects",
      value: activeProjects.toString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "Active",
      trendUp: true,
      subtext: "currently in progress"
    },
    {
      title: "Pending Tasks",
      value: totalPendingTasks.toString(),
      icon: ListChecks,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trend: totalPendingTasks > 0 ? "Action needed" : "All clear",
      trendUp: totalPendingTasks === 0,
      subtext: "across all projects"
    },
    {
      title: "Overdue Tasks",
      value: overdueTasks.toString(),
      icon: AlertTriangle,
      color: overdueTasks > 0 ? "text-red-500" : "text-green-500",
      bgColor: overdueTasks > 0 ? "bg-red-500/10" : "bg-green-500/10",
      trend: overdueTasks > 0 ? "Needs attention" : "On track",
      trendUp: overdueTasks === 0,
      subtext: "past due date"
    }
  ];

  const greeting = getGreeting();

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {username}</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {userRole === 'Manager' && (
            <Link href="/dashboard/team/invite">
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </Link>
          )}

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick add task..." className="pl-8 bg-card/50" />
          </div>

          <Link href="/dashboard/projects/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.trendUp ? "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                    {stat.trend}
                  </span>{" "}
                  — {stat.subtext}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card A: Analytics */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weekly Task Completion</CardTitle>
              <CardDescription>Tasks completed per day over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Chart Area */}
                <div className="flex-1 min-h-[250px]">
                  <OverviewChart data={chartData} />
                </div>
                <Separator orientation="vertical" className="hidden md:block h-auto" />
                <Separator orientation="horizontal" className="md:hidden" />
                {/* Status Area */}
                <div className="w-full md:w-[280px]">
                  <h4 className="text-sm font-semibold mb-4">Projects by Status</h4>
                  <ProjectStatusDistribution
                    active={activeProjects}
                    onHold={onHoldProjects}
                    completed={completedProjects}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>Tasks requiring your attention, sorted by due date.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active tasks found. You&apos;re all caught up! 🎉
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <div key={task.TaskID} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full border-2 ${task.Status === 'InProgress' ? 'border-blue-500 bg-blue-500/20' :
                          task.Status === 'Review' ? 'border-yellow-500 bg-yellow-500/20' :
                            'border-muted-foreground'
                          }`} />

                        <div>
                          <p className="font-medium text-sm leading-none">{task.Title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.TaskList?.Project?.ProjectName || "Unknown Project"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant={
                          task.Priority === 'High' ? 'destructive' :
                            task.Priority === 'Medium' ? 'default' : 'secondary'
                        }>
                          {task.Priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {task.DueDate ? new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Date'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">

          {/* Card C: Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest project updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={recentActivities} />
            </CardContent>
          </Card>

          {/* Card D: Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                {userRole === 'Manager' && <Users className="h-4 w-4 text-muted-foreground" />}
              </div>
              <CardDescription>
                {teamMembers.length > 0
                  ? `${teamMembers.length} contributor${teamMembers.length !== 1 ? 's' : ''} across your projects.`
                  : "Key contributors."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembers members={teamMembers} />
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}