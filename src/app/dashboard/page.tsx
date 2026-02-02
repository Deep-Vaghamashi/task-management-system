import React from 'react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
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
  Clock,
  CheckCircle2,
  Plus,
  Search,
} from 'lucide-react';

import { OverviewChart } from './_components/OverviewChart';
import { ProjectStatusDistribution } from './_components/ProjectStatusDistribution';
import { RecentActivity } from './_components/RecentActivity';
import { TeamMembers } from './_components/TeamMembers';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  let username = "Guest";
  let userId = null;
  let totalProjects = 0;
  let activeTasks: any[] = [];

  if (token) {
    try {
      const decoded = verify(token.value, process.env.JWT_SECRET!) as any;
      username = decoded.username || "User";
      userId = decoded.userId;

      // Fetch Real Data
      totalProjects = await prisma.project.count({
        where: { CreatedBy: userId }
      });

      activeTasks = await prisma.task.findMany({
        where: {
          // For now, fetch tasks assigned to user OR created by user if assignment logic isn't fully used
          // Assuming AssignedTo is the key. 
          OR: [
            { AssignedTo: userId },
            { TaskList: { Project: { CreatedBy: userId } } } // Fallback to show tasks in user's projects if not directly assigned
          ],
          Status: { not: 'Completed' }
        },
        take: 5,
        orderBy: { DueDate: 'asc' }, // Urgent first
        include: {
          TaskList: {
            include: {
              Project: true
            }
          }
        }
      });

    } catch (error) {
      console.error("Data fetch failed", error);
    }
  }

  // Mock Stats for the Grid
  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString() + " Active",
      icon: FolderKanban,
      trend: "+12%",
      trendUp: true,
      subtext: "from last month"
    },
    {
      title: "Running Projects",
      value: "5 In Progress", // Mocked as requested
      icon: Activity,
      color: "text-blue-500",
      trend: "+8%",
      trendUp: true,
      subtext: "from last week"
    },
    {
      title: "Pending Projects",
      value: "3 Waiting", // Mocked
      icon: Clock,
      color: "text-amber-500",
      trend: "-2%",
      trendUp: false,
      subtext: "from last week"
    },
    {
      title: "Ended Projects",
      value: "24 Completed", // Mocked
      icon: CheckCircle2,
      color: "text-green-500",
      trend: "+4%",
      trendUp: true,
      subtext: "from last month"
    }
  ];

  return (
    <div className="flex flex-col space-y-8 p-8 max-w-[1600px] mx-auto">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Good morning, {username}</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your project landscape today.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Quick add task..." className="pl-8 bg-card/50" />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Quick Actions
          </Button>
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
                <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.trendUp ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {stat.trend}
                  </span>{" "}
                  {stat.subtext}
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
              <CardTitle>Project Analytics & Overview</CardTitle>
              <CardDescription>Completion trends and status distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Chart Area */}
                <div className="flex-1 min-h-[250px]">
                  <OverviewChart />
                </div>
                <Separator orientation="vertical" className="hidden md:block h-auto" />
                <Separator orientation="horizontal" className="md:hidden" />
                {/* Status Area */}
                <div className="w-full md:w-[280px]">
                  <h4 className="text-sm font-semibold mb-4">Projects by Overview Status</h4>
                  <ProjectStatusDistribution />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Projects & Tasks</CardTitle>
              <CardDescription>High priority items requiring attention.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active tasks found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.map((task) => (
                    <div key={task.TaskID} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Status Circle */}
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
              <RecentActivity />
            </CardContent>
          </Card>

          {/* Card D: Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Key contributors.</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembers />
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}