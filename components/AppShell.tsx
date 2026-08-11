"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Root landing page is standalone full-screen view
  if (pathname === "/") {
    return (
      <div className="min-h-screen bg-[#0A1620] text-[#F6F1E9] font-sans antialiased overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-[#0A1620] text-[#F6F1E9] font-sans antialiased">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />
        <div className="flex flex-1 min-h-0 flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

