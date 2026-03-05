"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ProjectForm, ProjectFormData } from '@/components/dashboard/projects/project-form';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [initialData, setInitialData] = useState<ProjectFormData | undefined>(undefined);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            if (!projectId) return;

            try {
                setLoading(true);
                const response = await axios.get(`/api/projects/${projectId}`);
                const project = response.data;

                setProjectName(project.ProjectName);
                setInitialData({
                    name: project.ProjectName,
                    description: project.Description || '',
                    status: project.Status,
                    dueDate: project.DueDate ? new Date(project.DueDate) : undefined,
                    employeeIds: project.Members ? project.Members.map((m: { User: { UserID: number } }) => m.User.UserID) : [],
                });
            } catch (error: unknown) {
                console.error("Error fetching project:", error);
                toast.error("Failed to load project details");
                router.push('/dashboard/projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, router]);

    const handleSubmit = async (data: ProjectFormData) => {
        if (!data.name.trim()) {
            toast.error("Project name is required");
            return;
        }

        setSaving(true);

        try {
            await axios.patch(`/api/projects/${projectId}`, {
                projectName: data.name,
                description: data.description,
                status: data.status,
                dueDate: data.dueDate,
                employeeIds: data.employeeIds,
            });

            toast.success(`"${data.name}" updated successfully`);
            router.push(`/dashboard/projects/${projectId}`);
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to update project";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <div className="grid grid-cols-2 gap-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Editing &ldquo;{projectName}&rdquo;
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Project Settings</CardTitle>
                    <CardDescription>
                        Update project details, timeline, and team members.
                    </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                    <ProjectForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        isSaving={saving}
                        onCancel={() => router.back()}
                        submitLabel="Save Changes"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
