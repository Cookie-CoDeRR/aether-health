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
    <section className="space-y-6 text-[#1E293B]">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#1E5D57] text-white shadow-soft"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAF9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search action modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAF9] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#1E5D57] transition-colors"
          />
        </div>
      </div>

      {/* Grid of Action Cards */}
      {filteredActions.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#64748B] bg-white">
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
