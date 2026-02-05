"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    ArrowUpDown,
    MoreHorizontal,
    Circle,
    Timer,
    CheckCircle2,
    AlertCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    HelpCircle
} from "lucide-react"
import { toast } from "sonner"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Task = {
    id: string
    code: string
    title: string
    status: "Pending" | "In Progress" | "Done"
    priority: "Low" | "Medium" | "High"
    label: string
}

// Separate component for the interactive status cell
const StatusCell = ({ task }: { task: Task }) => {
    const updateStatus = async (newStatus: Task["status"]) => {
        try {
            // Mock API call
            // await fetch(\`/api/tasks/\${task.id}\`, {
            //   method: "PATCH",
            //   body: JSON.stringify({ status: newStatus }),
            // })
            console.log(`Updating task ${task.id} to ${newStatus}`)
            toast.success(`Task status updated to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update task status")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 dark:text-yellow-400"
            case "In Progress":
                return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:text-blue-400"
            case "Done":
                return "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:text-green-400"
            default:
                return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 dark:text-gray-400"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Circle className="mr-2 h-4 w-4" />
            case "In Progress": return <Timer className="mr-2 h-4 w-4" />
            case "Done": return <CheckCircle2 className="mr-2 h-4 w-4" />
            default: return <HelpCircle className="mr-2 h-4 w-4" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`h-8 w-max px-2 ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>{task.status}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => updateStatus("Pending")}>
                    <Circle className="mr-2 h-4 w-4 fill-yellow-500 text-yellow-500" />
                    Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("In Progress")}>
                    <Timer className="mr-2 h-4 w-4 fill-blue-500 text-blue-500" />
                    In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateStatus("Done")}>
                    <CheckCircle2 className="mr-2 h-4 w-4 fill-green-500 text-green-500" />
                    Done
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<Task>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const priority = row.original.priority
            return (
                <div className="flex items-center space-x-2">
                    {priority === "High" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className="font-medium">{row.getValue("title")}</span>
                    <Badge variant="outline" className="text-xs font-normal">
                        {row.original.label}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell task={row.original} />,
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string

            const getPriorityIcon = (p: string) => {
                switch (p) {
                    case "High": return <ArrowUpCircle className="mr-2 h-4 w-4 text-red-500" />
                    case "Medium": return <HelpCircle className="mr-2 h-4 w-4 text-yellow-500" />
                    case "Low": return <ArrowDownCircle className="mr-2 h-4 w-4 text-blue-500" />
                    default: return <HelpCircle className="mr-2 h-4 w-4" />
                }
            }

            return (
                <div className="flex items-center">
                    {getPriorityIcon(priority)}
                    <span>{priority}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const task = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(task.id)}
                        >
                            Copy task ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete task</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
