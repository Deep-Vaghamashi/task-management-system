"use client"

import { Suspense } from "react"
import { CreateTaskPageContent } from "./_components/create-task-content" 

function CreateTaskPageFallback() {
    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="h-10 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
    )
}

export default function CreateTaskPage() {
    return (
        <Suspense fallback={<CreateTaskPageFallback />}>
            <CreateTaskPageContent />
        </Suspense>
    )
}
