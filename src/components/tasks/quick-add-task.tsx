"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createPersonalTask } from "@/app/actions/task-actions"

export function QuickAddTask() {
    const [value, setValue] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value.trim()) return

        setIsLoading(true)
        try {
            const result = await createPersonalTask(value)
            if (result.success) {
                setValue("")
                toast.success("Task added successfully")
            } else {
                toast.error("Failed to add task")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
                type="text"
                placeholder="Add a new task..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1"
                disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={isLoading || !value.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </form>
    )
}
