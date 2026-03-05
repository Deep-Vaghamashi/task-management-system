"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define the shape of the project prop
interface Project {
  id: string; // 👈 We use 'id' here, not 'ProjectID'
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
}

interface EditProjectFormProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProjectForm({ project, open, onOpenChange, onSuccess }: EditProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form data directly from the project prop when it exists
  const [formData, setFormData] = useState({
    projectName: project?.title || "",
    description: project?.description || "",
    status: project?.status || "Active",
    dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ""
  })

  // Update local state when project changes (optional, but good for re-opening)
  // You might want to use a useEffect here if the project prop changes while the modal is closed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    setIsLoading(true)

    try {
      // 👇 FIX: Use project.id instead of project.ProjectID
      await axios.patch(`/api/projects/${project.id}`, {
        projectName: formData.projectName,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate || null,
      })

      toast.success("Project updated successfully")
      onOpenChange(false)
      router.refresh()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Update failed", error)
      toast.error(error.response?.data?.error || "Failed to update project")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}