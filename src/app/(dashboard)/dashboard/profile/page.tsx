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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    FolderKanban,
    CheckSquare,
    CalendarDays,
    Settings,
    Mail,
    Shield,
    Clock,
} from 'lucide-react';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    let user: {
        UserID: number;
        UserName: string;
        Email: string;
        Role: string;
        CreatedAt: Date;
    } | null = null;

    let projectCount = 0;
    let taskCount = 0;
    let completedTaskCount = 0;

    if (token) {
        try {
            const decoded = verify(token.value, process.env.JWT_SECRET!) as { userId: number };

            user = await prisma.user.findUnique({
                where: { UserID: decoded.userId },
                select: {
                    UserID: true,
                    UserName: true,
                    Email: true,
                    Role: true,
                    CreatedAt: true,
                },
            });

            if (user) {
                // Count projects created or member of
                projectCount = await prisma.project.count({
                    where: {
                        OR: [
                            { CreatedBy: user.UserID },
                            { Members: { some: { UserID: user.UserID } } },
                        ],
                    },
                });

                // Count assigned tasks
                taskCount = await prisma.task.count({
                    where: { AssignedTo: user.UserID },
                });

                // Count completed tasks
                completedTaskCount = await prisma.task.count({
                    where: {
                        AssignedTo: user.UserID,
                        Status: 'Completed',
                    },
                });
            }
        } catch (error) {
            console.error("Profile data fetch failed", error);
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Unable to load profile. Please log in again.</p>
            </div>
        );
    }

    const initials = user.UserName.substring(0, 2).toUpperCase();
    const memberSince = new Date(user.CreatedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
    const pendingTasks = taskCount - completedTaskCount;
    const completionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

    const stats = [
        {
            label: "Projects",
            value: projectCount,
            icon: FolderKanban,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
        {
            label: "Total Tasks",
            value: taskCount,
            icon: CheckSquare,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Completed",
            value: completedTaskCount,
            icon: CheckSquare,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            label: "Pending",
            value: pendingTasks,
            icon: Clock,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
    ];

    return (
        <div className="flex flex-col space-y-6 p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">

            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-blue-500 text-white text-2xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{user.UserName}</h1>
                                <Badge
                                    variant={user.Role === 'Manager' ? 'default' : 'secondary'}
                                    className="w-fit mx-auto md:mx-0"
                                >
                                    {user.Role}
                                </Badge>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 justify-center md:justify-start">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user.Email}
                                </span>
                                <span className="flex items-center gap-1.5 justify-center md:justify-start">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Member since {memberSince}
                                </span>
                            </div>

                            <div className="pt-2">
                                <Link href="/dashboard/settings">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Settings className="h-3.5 w-3.5" />
                                        Edit Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="transition-all hover:shadow-md">
                            <CardContent className="pt-6 pb-4 text-center">
                                <div className={`mx-auto mb-2 h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Details Cards */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Account Details
                        </CardTitle>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Username</span>
                            <span className="text-sm font-medium">{user.UserName}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Email</span>
                            <span className="text-sm font-medium">{user.Email}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <Badge variant="outline">{user.Role}</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">User ID</span>
                            <span className="text-sm font-mono text-muted-foreground">#{user.UserID}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-primary" />
                            Activity Summary
                        </CardTitle>
                        <CardDescription>Your task completion progress</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Completion Rate</span>
                            <span className="text-sm font-bold text-primary">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className="bg-gradient-to-r from-violet-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Tasks Completed</span>
                            <span className="text-sm font-medium text-green-500">{completedTaskCount}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Tasks Pending</span>
                            <span className="text-sm font-medium text-amber-500">{pendingTasks}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Projects Involved</span>
                            <span className="text-sm font-medium">{projectCount}</span>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
