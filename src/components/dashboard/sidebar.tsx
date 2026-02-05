"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Kanban,
    Settings,
    Plus,
    LogOut,
    PanelLeftClose
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
// import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'; // Keeping this if original code had it, ensuring it exists

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

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

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
        { href: '/dashboard/tasks', label: 'My Tasks', icon: CheckSquare },
        { href: '/dashboard/board', label: 'Task Board', icon: Kanban },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className={cn(
            "fixed left-0 top-0 h-screen w-[70px] bg-card border-r border-border text-card-foreground backdrop-blur-md flex flex-col z-50 transition-all duration-300 ease-in-out group hover:w-[240px] shadow-xl",
            className
        )}>

            {/* 1. Header */}
            <div className="h-16 flex items-center px-4 border-b border-border/40 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="bg-primary/10 text-primary p-2 rounded-md shrink-0">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Daily Life
                    </span>
                </div>
            </div>

            <ScrollArea className="flex-1 w-full overflow-hidden">
                <div className="p-3 space-y-6 w-[240px]"> {/* Fixed width inner container to prevent text wrap during transition */}

                    {/* 4. Navigation Menu */}
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                >
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start gap-4 mb-1 h-10 px-3 overflow-hidden",
                                            isActive && "font-medium"
                                        )}
                                    >
                                        <Icon className="w-5 h-5 shrink-0" />
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    <Separator className="w-[85%] mx-auto opacity-50" />

                    {/* Projects Section - Visual Placeholder for now */}
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate">
                            RESOURCES
                        </p>
                        <Button variant="ghost" className="w-full justify-start gap-4 h-10 px-3 overflow-hidden">
                            <FolderKanban className="w-5 h-5 shrink-0 text-muted-foreground" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-normal">
                                Archived
                            </span>
                        </Button>
                    </div>

                </div>
            </ScrollArea>

            {/* Footer / User Block */}
            <div className="p-3 border-t border-border/40 overflow-hidden">
                <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer w-[240px]">
                    <Avatar className="h-9 w-9 border border-border shrink-0">
                        <AvatarImage src="" /> {/* Fallback to initials */}
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-medium truncate w-[140px]">John Doe</span>
                        <span className="text-xs text-muted-foreground truncate w-[140px]">john@example.com</span>
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
