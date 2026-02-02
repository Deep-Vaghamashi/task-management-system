"use client";

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from '@/components/dashboard/sidebar';

export function MobileNav() {
    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    {/* Simple Logo Placeholder */}
                    <span className="font-bold text-primary text-lg">DL</span>
                </div>
                <span className="font-bold text-lg tracking-tight">Daily Life</span>
            </div>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="w-5 h-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <Sidebar className="border-none w-full" />
                </SheetContent>
            </Sheet>
        </div>
    );
}
