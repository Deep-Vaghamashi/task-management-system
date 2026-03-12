"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
            {resolvedTheme === "dark" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
