"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Triage",
    subLabel: "AI symptom read",
    href: "/triage",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Nearby Hospitals",
    subLabel: "Map & OSM Engine",
    href: "/discovery",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Doctors",
    subLabel: "Find & book",
    href: "/doctors",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="7" r="4" />
        <path d="M17 11a4 4 0 1 0-4-4" />
        <path d="M1 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      </svg>
    ),
  },
  {
    label: "Reports",
    subLabel: "Upload & parse",
    href: "/reports",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    label: "Timeline",
    subLabel: "Health history",
    href: "/timeline",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    label: "Medicines",
    subLabel: "Tracker & pricing",
    href: "/medicines",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7l-7 7" />
        <line x1="8" y1="10" x2="16" y2="10" />
      </svg>
    ),
  },
  {
    label: "Actions",
    subLabel: "Operations & dispatch",
    href: "/actions",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    subLabel: "Theme, i18n & APIs",
    href: "/settings",
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];




interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container (248px fixed width) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col bg-[#0F2130] border-r border-[rgba(246,241,233,0.09)] px-4 py-7 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 pb-7">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#E8674A] font-serif text-[17px] font-semibold text-[#0A1620]">
            Æ
          </div>
          <div>
            <div className="font-serif text-[17px] font-medium tracking-[0.02em] text-[#F6F1E9]">
              AETHER
            </div>
            <div className="text-[9px] font-sans tracking-[0.14em] uppercase text-[#7C8A93] mt-[1px]">
              Health Navigator
            </div>
          </div>
        </div>

        {/* Navigation Category Label */}
        <div className="px-2.5 pt-2 pb-2.5 font-sans text-[10px] uppercase tracking-[0.15em] text-[#7C8A93]">
          Navigate
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-all duration-150",
                  isActive
                    ? "bg-[#E8674A]/12 text-[#F6F1E9]"
                    : "text-[#B9C4CC] hover:bg-[#F6F1E9]/5 hover:text-[#F6F1E9]"
                )}
              >
                {/* Active Indicator Left Bar */}
                {isActive && (
                  <span className="absolute left-[-16px] top-2 bottom-2 w-[3px] bg-[#E8674A] rounded-r-[3px]" />
                )}

                {item.icon}

                <div>
                  <span className="block font-medium leading-tight">{item.label}</span>
                  <small className="block text-[11px] font-normal text-[#7C8A93] mt-[1px]">
                    {item.subLabel}
                  </small>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Foot Disclaimer */}
        <div className="mt-auto border-t border-[rgba(246,241,233,0.09)] pt-3.5 px-3 text-[11px] leading-relaxed text-[#7C8A93]">
          <strong className="font-medium text-[#B9C4CC]">Informational prototype.</strong> AETHER assists navigation, it does not diagnose. High-urgency findings always route to emergency guidance.
        </div>
      </aside>
    </>
  );
}
