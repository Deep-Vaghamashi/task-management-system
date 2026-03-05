"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    ListTodo,
    BarChart3,
    UserPlus,
    Settings,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose?: () => void;
}

interface UserInfo {
    UserID: number;
    UserName: string;
    Email: string;
    Role: string;
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    role?: string; // Only show for this role
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch user info", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post('/auth/logout');
            router.push('/login');
        } catch (error) {
            console.error("Logout failed", error);
            router.push('/login');
        }
    };

    const navGroups: NavGroup[] = [
        {
            title: 'MAIN',
            items: [
                { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
                { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
            ],
        },
        {
            title: 'PERSONAL',
            items: [
                { href: '/dashboard/tasks/u_tasks', label: 'My To-Do', icon: ListTodo },
                { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
            ],
        },
        {
            title: 'MANAGEMENT',
            items: [
                { href: '/dashboard/team/invite', label: 'Invite Member', icon: UserPlus, role: 'Manager' },
                { href: '/dashboard/settings', label: 'Settings', icon: Settings },
            ],
        },
    ];

    const userInitials = user
        ? user.UserName.substring(0, 2).toUpperCase()
        : '..';

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <div className={cn(
            "fixed left-0 top-0 h-screen w-[70px] bg-card border-r border-border text-card-foreground backdrop-blur-md flex flex-col z-50 transition-all duration-300 ease-in-out group hover:w-[240px] shadow-xl",
            className
        )}>

            {/* Header / Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border/40 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                        DL
                    </div>
                    <span className="font-semibold text-lg tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Daily Life
                    </span>
                </div>
            </div>

            <ScrollArea className="flex-1 w-full overflow-hidden">
                <div className="p-3 space-y-4 w-[240px]">
                    {navGroups.map((group, groupIndex) => {
                        // Filter items based on user role
                        const visibleItems = group.items.filter(
                            (item) => !item.role || item.role === user?.Role
                        );

                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.title} className="space-y-1">
                                {/* Group Title */}
                                <p className="px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate uppercase">
                                    {group.title}
                                </p>

                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                        >
                                            <Button
                                                variant={active ? "secondary" : "ghost"}
                                                className={cn(
                                                    "w-full justify-start gap-4 mb-0.5 h-10 px-3 overflow-hidden",
                                                    active && "font-medium bg-primary/10 text-primary hover:bg-primary/15"
                                                )}
                                            >
                                                <Icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            </Button>
                                        </Link>
                                    );
                                })}

                                {/* Separator between groups */}
                                {groupIndex < navGroups.length - 1 && (
                                    <Separator className="w-[85%] mx-auto opacity-30 mt-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Footer / User Block */}
            <div className="p-3 border-t border-border/40 overflow-hidden">
                <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer w-[240px]">
                    <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-primary text-xs font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-medium truncate w-[120px]">
                            {user?.UserName || 'Loading...'}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate w-[120px]">
                            {user?.Role || ''}
                        </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto mr-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}

