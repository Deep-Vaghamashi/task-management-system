"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CalendarIcon, FileText, Tag, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { UserSelector } from '@/app/(dashboard)/dashboard/projects/_components/user-selector';

export interface ProjectFormData {
    name: string;
    description: string;
    status: string;
    dueDate: Date | undefined;
    employeeIds: number[];
}

interface ProjectFormProps {
    initialData?: ProjectFormData;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    isSaving: boolean;
    onCancel: () => void;
    submitLabel: string;
}

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active', color: 'bg-blue-500' },
    { value: 'On Hold', label: 'On Hold', color: 'bg-amber-500' },
    { value: 'Completed', label: 'Completed', color: 'bg-emerald-500' },
];

export function ProjectForm({ initialData, onSubmit, isSaving, onCancel, submitLabel }: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        status: 'Active',
        dueDate: undefined,
        employeeIds: [],
        ...initialData
    });

    // Reset when initialData loads
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Project Name
                </Label>
                <Input
                    id="name"
                    placeholder="e.g. Website Redesign"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10"
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Brief details about the project..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                    {formData.description.length}/255 characters
                </p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        Status
                    </Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                                {currentStatus && (
                                    <div className={cn("w-2 h-2 rounded-full", currentStatus.color)} />
                                )}
                                <SelectValue placeholder="Select status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                                        {opt.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2 flex flex-col">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        Due Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal h-10",
                                    !formData.dueDate && "text-muted-foreground"
                                )}
                            >
                                {formData.dueDate ? (
                                    format(formData.dueDate, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formData.dueDate}
                                onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                                initialFocus
                            />
                            {formData.dueDate && (
                                <div className="p-2 border-t">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => setFormData({ ...formData, dueDate: undefined })}
                                    >
                                        Clear date
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Separator />

            {/* Team Members */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    Team Members
                </Label>
                <UserSelector
                    selectedUserIds={formData.employeeIds}
                    onSelectionChange={(ids) => setFormData({ ...formData, employeeIds: ids })}
                />
            </div>

            <Separator />

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
