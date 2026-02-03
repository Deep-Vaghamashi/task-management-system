"use client";

import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* 1. Sidebar (Fixed) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-col min-h-screen transition-[margin] duration-300 md:ml-[70px]">

        {/* Mobile Nav (Hide on desktop) */}
        <MobileNav />

        {/* 3. Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* 4. Page Content */}
        <main className="flex-1 p-0 relative">
          {children}
        </main>
      </div>

    </div>
  );
}