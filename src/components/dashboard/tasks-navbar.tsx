"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Kanban, ListTodo, UserCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
    {
        title: "All Tasks",
        href: "/dashboard/tasks",
        icon: ListTodo,
    },
    {
        title: "My Tasks",
        href: "/dashboard/tasks/my-tasks",
        icon: UserCheck,
    },
    {
        title: "Board",
        href: "/dashboard/tasks/kanban",
        icon: Kanban,
    },
]

export function TasksNavbar() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border bg-background/80 p-2 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted/50",
                                            isActive
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.title}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="mb-2">
                                    <p>{item.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </div>
        </div>
    )
}
