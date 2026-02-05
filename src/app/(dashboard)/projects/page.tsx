"use client"

import * as React from "react"
import Link from "next/link"
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Trash2,
    Calendar,
    Users,
    List,
    Loader2
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import axios from "axios"
import { toast } from "sonner"

// --- Types ---

// Matches Prisma Model partially
interface DBProject {
    ProjectID: number
    ProjectName: string
    Description: string | null
    CreatedBy: number
    CreatedAt: string
    Creator?: {
        UserName: string
        Email: string
    }
}

// UI Project Type - mapped from DBProject to fit existing UI needs
interface UIProject {
    id: string
    title: string
    description: string
    status: "Active" | "Completed" | "On Hold" // Mocked for now
    dueDate: string // Mocked for now
    progress: number // Mocked for now
    team: { id: string; name: string; image?: string }[]
    createdAt: Date
}

import { useRouter } from "next/navigation"

export default function ProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = React.useState<UIProject[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [debouncedSearch, setDebouncedSearch] = React.useState("")
    const [statusFilters, setStatusFilters] = React.useState<string[]>([])
    const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest" | "alphabetical">("newest")
    const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null)
    const [isFilterOpen, setIsFilterOpen] = React.useState(false)

    // Debounce Search - Wait 500ms before triggering effect
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchQuery])

    // Fetch Projects
    const fetchProjects = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (debouncedSearch) params.append("search", debouncedSearch)

            const response = await axios.get<DBProject[]>(`/api/projects?${params.toString()}`)

            // Map DB projects to UI projects
            const mappedProjects: UIProject[] = response.data.map((p) => ({
                id: p.ProjectID.toString(),
                title: p.ProjectName,
                description: p.Description || "No description provided.",
                status: "Active", // TODO: Add status field to DB
                dueDate: new Date(new Date(p.CreatedAt).setDate(new Date(p.CreatedAt).getDate() + 30)).toISOString(), // Mock due date (created + 30 days)
                progress: Math.floor(Math.random() * 100), // Mock progress
                createdAt: new Date(p.CreatedAt),
                team: p.Creator ? [{
                    id: p.CreatedBy.toString(),
                    name: p.Creator.UserName,
                    // image: "..." // user avatar if available
                }] : []
            }))

            setProjects(mappedProjects)
        } catch (error) {
            console.error("Failed to fetch projects", error)

            const errorMessage = axios.isAxiosError(error) && error.response?.data?.error
                ? error.response.data.error
                : "Failed to load projects"

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error(errorMessage || "Session expired. Please login again.")
                router.push("/login")
            } else {
                toast.error(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }, [debouncedSearch]) // Re-fetch when search changes

    React.useEffect(() => {
        fetchProjects()
    }, [fetchProjects])


    // Client-side Filter & Sort (API handles Search, Client handles Status/Sort for now as DB is simple)
    const filteredProjects = React.useMemo(() => {
        let result = [...projects]

        // Status Filter
        if (statusFilters.length > 0) {
            result = result.filter((p) => statusFilters.includes(p.status))
        }

        // Sort
        result.sort((a, b) => {
            if (sortOrder === "newest") return b.createdAt.getTime() - a.createdAt.getTime()
            if (sortOrder === "oldest") return a.createdAt.getTime() - b.createdAt.getTime()
            if (sortOrder === "alphabetical") return a.title.localeCompare(b.title)
            return 0
        })

        return result
    }, [projects, statusFilters, sortOrder])

    // Handlers
    const toggleStatusFilter = (status: string) => {
        setStatusFilters((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        )
    }

    const handleDeleteProject = () => {
        // TODO: Implement API delete
        if (projectToDelete) {
            toast.info("Delete functionality not yet implemented in API/DB")
            setProjectToDelete(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            case "Completed":
                return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
            case "On Hold":
                return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
            default:
                return ""
        }
    }

    return (
        <div className="flex h-full flex-col space-y-8 p-8 max-md:p-4">

            {/* --- Page Header --- */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <Badge variant="outline" className="text-sm">
                        {filteredProjects.length}
                    </Badge>
                </div>

                <div className="flex flex-1 items-center gap-2 md:max-w-xl md:justify-end">
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filter Projects</SheetTitle>
                                <SheetDescription>
                                    Refine your project list by status and sorting order.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-6 py-6">

                                {/* Sort Options */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium leading-none">Sort By</h3>
                                    <div className="flex flex-col gap-2">
                                        {(["newest", "oldest", "alphabetical"] as const).map((option) => (
                                            <label
                                                key={option}
                                                className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 hover:bg-accent"
                                            >
                                                <input
                                                    type="radio"
                                                    name="sort"
                                                    className="accent-primary"
                                                    checked={sortOrder === option}
                                                    onChange={() => setSortOrder(option)}
                                                />
                                                <span className="capitalize">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Filters */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium leading-none">Status</h3>
                                    <div className="flex flex-col gap-2">
                                        {(["Active", "Completed", "On Hold"] as const).map((status) => (
                                            <div key={status} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`status-${status}`}
                                                    checked={statusFilters.includes(status)}
                                                    onCheckedChange={() => toggleStatusFilter(status)}
                                                />
                                                <label
                                                    htmlFor={`status-${status}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {status}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                            <SheetFooter>
                                <Button onClick={() => setIsFilterOpen(false)} className="w-full">
                                    Apply Filters
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    <Button asChild>
                        <Link href="/dashboard/projects/add">
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Link>
                    </Button>
                </div>
            </div>

            {/* --- Project Grid --- */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center">
                    <div className="rounded-full bg-muted p-3">
                        <List className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No projects found</h3>
                        <p className="text-muted-foreground text-sm">
                            Try adjusting your filters or search query, or create a new project.
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => {
                        setSearchQuery("")
                        setStatusFilters([])
                    }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="flex flex-col transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base line-clamp-1" title={project.title}>
                                        <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                                            {project.title}
                                        </Link>
                                    </CardTitle>
                                    <Badge variant="secondary" className={cn("font-normal", getStatusColor(project.status))}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() => setProjectToDelete(project.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="flex-1 pb-4">
                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                    {project.description}
                                </CardDescription>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4">
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {project.team.slice(0, 3).map((member) => (
                                            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                                <AvatarImage src={member.image} alt={member.name} />
                                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {project.team.length > 3 && (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                                +{project.team.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* --- Delete Dialog --- */}
            <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the project
                            and all associated tasks and data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
