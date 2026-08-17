"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";
import {
  HeartPulse,
  Pill,
  FileText,
  MapPin,
  Settings,
  X,
  ShieldCheck,
  PhoneCall,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    label: "Care Today",
    subLabel: "AI symptom check & care",
    href: "/triage",
    icon: <HeartPulse className="w-5 h-5 shrink-0" />,
  },
  {
    label: "Medications",
    subLabel: "Dose tracker & pricing",
    href: "/medicines",
    icon: <Pill className="w-5 h-5 shrink-0" />,
  },
  {
    label: "Records & Reports",
    subLabel: "Lab analysis & timeline",
    href: "/reports",
    icon: <FileText className="w-5 h-5 shrink-0" />,
  },
  {
    label: "Find Care",
    subLabel: "Hospitals & verified doctors",
    href: "/discovery",
    icon: <MapPin className="w-5 h-5 shrink-0" />,
  },
  {
    label: "Settings & Profile",
    subLabel: "Preferences & history",
    href: "/settings",
    icon: <Settings className="w-5 h-5 shrink-0" />,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userName, userEmail, userPhoto, isGmailAuthenticated, signOutGmail } =
    useSettings();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#064E3B]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over Drawer Sheet (From Left) */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white dark:bg-[#0B1D17] border-r border-[#064E3B]/20 dark:border-white/10 shadow-2xl p-6 text-[#064E3B] dark:text-[#ECFDF5] overflow-y-auto"
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-5 border-b border-[#064E3B]/15 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#064E3B] dark:bg-[#10B981] font-serif text-xl font-bold text-white dark:text-[#042F24] shadow-soft">
                  Æ
                </div>
                <div>
                  <div className="font-serif text-lg font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
                    Aether Health
                  </div>
                  <div className="text-[10px] font-sans font-semibold tracking-wider uppercase text-[#064E3B]/70 dark:text-[#6EE7B7]">
                    Patient Telemetry
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl p-2 text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#064E3B]/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Profile Card inside Drawer */}
            <div className="my-5 rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="h-10 w-10 rounded-full border-2 border-[#064E3B] dark:border-[#10B981] object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] font-bold text-sm">
                    {userName ? userName[0] : <User className="w-5 h-5" />}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5] truncate">
                    {userName || "Patient Account"}
                  </div>
                  <div className="text-[11px] text-[#064E3B]/70 dark:text-[#A7F3D0]/70 font-medium truncate">
                    {isGmailAuthenticated ? userEmail : "ABDM Profile Linked"}
                  </div>
                </div>
              </div>

              {isGmailAuthenticated && (
                <button
                  onClick={signOutGmail}
                  title="Sign out"
                  className="rounded-lg p-1.5 text-[#064E3B]/60 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-white dark:hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Navigation List */}
            <div className="px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/60 dark:text-white/40">
              Portal Navigation
            </div>

            <nav className="space-y-1.5 pt-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/discovery" && pathname === "/doctors") ||
                  (item.href === "/reports" && pathname === "/timeline");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-semibold transition-all duration-150 min-tap-target ${
                      isActive
                        ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-soft font-bold"
                        : "text-[#064E3B]/80 dark:text-[#ECFDF5]/80 hover:bg-[#064E3B]/5 dark:hover:bg-white/10 hover:text-[#064E3B] dark:hover:text-white"
                    }`}
                  >
                    <div
                      className={`transition-colors ${
                        isActive
                          ? "text-white dark:text-[#042F24]"
                          : "text-[#064E3B] dark:text-[#10B981]"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-tight font-bold">
                        {item.label}
                      </span>
                      <span
                        className={`block text-[11px] font-normal mt-0.5 truncate ${
                          isActive
                            ? "text-white/80 dark:text-[#042F24]/80"
                            : "text-[#064E3B]/60 dark:text-[#A7F3D0]/60"
                        }`}
                      >
                        {item.subLabel}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Emergency Hotline Assistance Card */}
            <div className="mt-auto space-y-3 pt-5 border-t border-[#064E3B]/15 dark:border-white/10">
              <div className="rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/10 p-4 space-y-2 text-xs shadow-xs">
                <div className="flex items-center gap-2 font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  <PhoneCall className="w-4 h-4 text-rose-500" />
                  <span>Immediate Medical Hotline</span>
                </div>
                <p className="text-[11.5px] text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed">
                  In case of clinical emergency, immediately call:
                </p>
                <div className="flex gap-2">
                  <a
                    href="tel:108"
                    className="flex-1 text-center rounded-xl bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] py-2 font-bold text-xs shadow-xs hover:bg-[#043327] dark:hover:bg-[#059669]"
                  >
                    Dial 108
                  </a>
                  <a
                    href="tel:112"
                    className="flex-1 text-center rounded-xl border border-[#064E3B] dark:border-white/20 text-[#064E3B] dark:text-[#ECFDF5] bg-white dark:bg-transparent py-2 font-bold text-xs shadow-xs hover:bg-[#064E3B]/5 dark:hover:bg-white/10"
                  >
                    Dial 112
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-[#064E3B]/60 dark:text-white/40 text-center font-medium">
                Aether Health • Autonomous Patient Triage
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
