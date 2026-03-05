"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectForm, ProjectFormData } from '@/components/dashboard/projects/project-form';

export default function CreateProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (data: ProjectFormData) => {
        if (!data.name.trim()) {
            toast.error("Project name is required");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/projects', {
                projectName: data.name,
                description: data.description,
                status: data.status,
                dueDate: data.dueDate,
                employeeIds: data.employeeIds,
            });

            toast.success("Project created successfully");
            router.push(`/dashboard/projects/${response.data.project.ProjectID}`);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>
                        Add a new project to track tasks and collaboration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectForm
                        onSubmit={handleSubmit}
                        isSaving={loading}
                        onCancel={() => router.back()}
                        submitLabel="Create Project"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
