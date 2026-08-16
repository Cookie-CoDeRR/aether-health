"use client";

import React from "react";
import { motion } from "framer-motion";
import { ActionItem } from "@/types/actions";

interface ActionCardProps {
  action: ActionItem;
  modalView?: boolean;
  onClick?: () => void;
}

export default function ActionCard({
  action,
  modalView,
  onClick,
}: ActionCardProps) {
  const CardContent = (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-soft transition-all duration-200 ${
        modalView
          ? "cursor-default"
          : "cursor-pointer hover:bg-[#F8FAF9] hover:border-[#1E5D57] hover:shadow-card"
      }`}
    >
      <div>
        {/* Category Badge & Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F8FAF9] text-lg border border-[#E2E8F0]">
              {action.icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#134E48] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full font-bold">
              {action.category}
            </span>
          </div>
        </div>

        {/* Title & Detail */}
        <div className="mt-3.5">
          <h3 className="font-serif text-base font-semibold text-[#1E293B] group-hover:text-[#1E5D57] transition-colors">
            {action.title}
          </h3>
          <p className="text-[11px] text-[#1E5D57] mt-0.5 font-semibold">
            {action.detail}
          </p>
          <p className="mt-2 text-xs text-[#64748B] leading-relaxed line-clamp-3">
            {action.description}
          </p>
        </div>
      </div>

      {/* Footer Metrics & CTA */}
      <div className="mt-5 pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#94A3B8]">{action.metrics}</span>
        {!modalView && (
          <span className="flex items-center gap-1 font-semibold text-[#1E5D57] group-hover:translate-x-0.5 transition-transform">
            <span>Launch</span>
            <span>→</span>
          </span>
        )}
      </div>
    </div>
  );

  if (modalView) {
    return <div onClick={onClick}>{CardContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {CardContent}
    </motion.div>
  );
}
