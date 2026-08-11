"use client";

import React, { useState, useMemo } from "react";
import { ACTION_ITEMS, ActionCategory, ActionItem } from "@/types/actions";
import ActionCard from "./ActionCard";
import ActionModal from "./ActionModal";

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
    <section className="space-y-8">
      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[rgba(246,241,233,0.09)] pb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#E8674A] text-[#0A1620] font-bold shadow-md"
                  : "bg-[#132A38] border border-[rgba(246,241,233,0.09)] text-[#B9C4CC] hover:text-[#F6F1E9] hover:border-[rgba(246,241,233,0.2)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search action modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#132A38] border border-[rgba(246,241,233,0.16)] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#E8674A] transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 text-[#7C8A93]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Grid of Action Cards */}
      {filteredActions.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[rgba(246,241,233,0.16)] rounded-2xl font-mono text-xs text-[#7C8A93]">
          No actions found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
