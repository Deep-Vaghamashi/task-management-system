import type { Metadata } from "next"
import { TasksNavbar } from "@/components/dashboard/tasks-navbar"

export const metadata: Metadata = {
    title: "Tasks",
    description: "Manage your tasks and projects",
}

interface TasksLayoutProps {
    children: React.ReactNode
}

export default function TasksLayout({ children }: TasksLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <div className="flex-1 pb-24">
                {children}
            </div>
            <TasksNavbar />
        </div>
    )
}
