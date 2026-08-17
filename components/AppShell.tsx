"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FloatingDock from "./FloatingDock";
import InteractiveSpotlight from "./InteractiveSpotlight";
import AmbientNatureOverlay from "./AmbientNatureOverlay";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleOpenTriagePrompt = (initialQuery?: string) => {
    if (pathname === "/triage") {
      window.dispatchEvent(
        new CustomEvent("aether-triage-prompt", {
          detail: { query: initialQuery || "" },
        })
      );
    } else {
      if (initialQuery) {
        router.push(`/triage?q=${encodeURIComponent(initialQuery)}`);
      } else {
        router.push("/triage");
      }
    }
  };

  // Root landing / greet page is standalone full-screen view (NO floating dock) - strictly isolated in light theme
  if (pathname === "/") {
    return (
      <div className="light relative min-h-screen bg-white text-[#064E3B] font-sans antialiased overflow-x-hidden">
        <InteractiveSpotlight />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  // Page title inference based on pathname
  let pageTitle = "Care Today";
  if (pathname.startsWith("/reports") || pathname.startsWith("/timeline")) {
    pageTitle = "Records & Reports";
  } else if (pathname.startsWith("/discovery") || pathname.startsWith("/doctors")) {
    pageTitle = "Find Care";
  } else if (pathname.startsWith("/settings")) {
    pageTitle = "Settings & Profile";
  } else if (pathname.startsWith("/medicines")) {
    pageTitle = "Medications & Prescriptions";
  } else if (pathname.startsWith("/actions")) {
    pageTitle = "System Operations";
  }

  // Floating dock is shown on all screens EXCEPT root greet page ("/")
  const showFloatingDock = pathname !== "/";

  return (
    <div className="relative flex h-screen max-h-screen w-full bg-white dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] font-sans antialiased overflow-hidden selection:bg-[#064E3B] selection:text-white dark:selection:bg-[#10B981] dark:selection:text-[#042F24] transition-colors duration-200">
      {/* Ambient Nature Atmosphere Layer (Corner Grass, Top Twig, Pollen & Wind-Blown Leaves) */}
      <AmbientNatureOverlay />

      {/* Interactive Cursor Spotlight Glow */}
      <InteractiveSpotlight />

      {/* Slide-over Drawer Navigation (Closed by default) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main App Container */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col h-full max-h-screen overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
          pageTitle={pageTitle}
        />
        <div className="flex flex-1 min-h-0 h-full overflow-hidden flex-col">
          {children}
        </div>
      </main>

      {/* Floating Bottom Dock Bar (Shown everywhere except greet page and profile page) */}
      {showFloatingDock && (
        <FloatingDock
          onToggleMenu={() => setSidebarOpen(true)}
          onOpenTriagePrompt={handleOpenTriagePrompt}
        />
      )}
    </div>
  );
}
