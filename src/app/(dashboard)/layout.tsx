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

      {/* Desktop Sidebar (Fixed, hidden on mobile) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area — offset by sidebar width */}
      <div className="flex flex-col min-h-screen transition-[margin] duration-300 md:ml-[70px]">

        {/* Mobile Navigation Bar (visible on mobile only) */}
        <MobileNav />

        {/* Desktop Header with Breadcrumbs (visible on desktop only) */}
        <div className="hidden md:block sticky top-0 z-40">
          <Header />
        </div>

        {/* Page Content */}
        <main className="flex-1 relative">
          {children}
        </main>
      </div>

    </div>
  );
}