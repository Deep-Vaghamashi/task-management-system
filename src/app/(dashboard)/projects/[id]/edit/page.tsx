import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { EditProjectForm } from "@/components/projects/edit-project-form"

const prisma = new PrismaClient()

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
        notFound()
    }

    const project = await prisma.project.findUnique({
        where: { ProjectID: projectId }
    })

    if (!project) {
        notFound()
    }

    // Serialize dates for Client Component
    const serializableProject = {
        ...project,
        DueDate: project.DueDate ? project.DueDate.toISOString() : null,
        Description: project.Description,
        Status: project.Status // Ensure this matches DB default if null, currently Schema says String @default("Active")
    }

    return (
        <div className="flex flex-col space-y-8 p-8 max-md:p-4">
            <EditProjectForm project={serializableProject} />
        </div>
    )
}
