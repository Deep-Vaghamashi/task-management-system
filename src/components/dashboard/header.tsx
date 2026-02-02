"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Slash } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ModeToggle } from '@/components/mode-toggle';

export function Header() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    // Simple breadcrumb logic
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;

        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (segment === 'dashboard') label = 'Home';

        return { href, label, isLast };
    });

    return (
        <header className="sticky top-0 z-40 w-full h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.length > 0 ? (
                            breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={crumb.href}>
                                    <BreadcrumbItem>
                                        {crumb.isLast ? (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!crumb.isLast && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))
                        ) : (
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
                <ModeToggle />
            </div>
        </header>
    );
}
