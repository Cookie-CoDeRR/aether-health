"use client";

import React, { useState, useMemo } from "react";
import { ACTION_ITEMS, ActionCategory, ActionItem } from "@/types/actions";
import ActionCard from "./ActionCard";
import ActionModal from "./ActionModal";
import { Search } from "lucide-react";

export default function ActionsGrid() {
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalAction, setActiveModalAction] = useState<ActionItem | null>(null);

  const categories: (ActionCategory | "All")[] = [
    "All",
    "Triage & Diagnosis",
    "Facility & Logistics",
    "Prescription & Pharmacy",
    "EHR & Data Sync",
  ];

  const filteredActions = useMemo(() => {
    return ACTION_ITEMS.filter((action) => {
      const matchesCategory = selectedCategory === "All" || action.category === selectedCategory;
      const matchesSearch =
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.detail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section className="space-y-6 text-[#064E3B] dark:text-[#ECFDF5]">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#064E3B]/15 dark:border-white/10 pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-tap-target ${
                selectedCategory === cat
                  ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-soft"
                  : "bg-white dark:bg-[#0B1D17] border border-[#064E3B]/20 dark:border-white/10 text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white hover:bg-[#F9FBF9] dark:hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064E3B]/50 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search action modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981] transition-colors"
          />
        </div>
      </div>

      {/* Grid of Action Cards */}
      {filteredActions.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-[#064E3B]/20 dark:border-white/15 rounded-2xl text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 bg-white dark:bg-[#0B1D17]">
          No actions found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => setActiveModalAction(action)}
            />
          ))}
        </div>
      )}

      {/* Execution Modal */}
      <ActionModal
        action={activeModalAction}
        onClose={() => setActiveModalAction(null)}
      />
    </section>
  );
}
