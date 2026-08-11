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
      className={`group relative flex flex-col justify-between rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-6 shadow-xl transition-all duration-300 ${
        modalView
          ? "cursor-default"
          : "interactive-hover cursor-pointer hover:bg-[#0F2130] hover:border-[#E8674A]/50 hover:shadow-2xl"
      }`}
    >
      <div>
        {/* Category Badge & Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2130] text-xl border border-[rgba(246,241,233,0.16)]">
              {action.icon}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#4F9D8C] bg-[#4F9D8C]/10 px-2.5 py-1 rounded-md border border-[#4F9D8C]/20 font-bold">
              {action.category}
            </span>
          </div>
        </div>

        {/* Title & Detail */}
        <div className="mt-4">
          <h3 className="font-serif text-lg font-medium text-[#F6F1E9] group-hover:text-[#E8674A] transition-colors">
            {action.title}
          </h3>
          <p className="font-mono text-[11px] text-[#E8674A] mt-0.5 font-semibold">
            {action.detail}
          </p>
          <p className="mt-2.5 text-xs text-[#B9C4CC] font-sans leading-relaxed font-light line-clamp-3">
            {action.description}
          </p>
        </div>
      </div>

      {/* Footer Metrics & CTA */}
      <div className="mt-6 pt-4 border-t border-[rgba(246,241,233,0.09)] flex items-center justify-between font-mono text-xs">
        <span className="text-[11px] text-[#7C8A93]">{action.metrics}</span>
        {!modalView && (
          <span className="flex items-center gap-1 font-semibold text-[#E8674A] group-hover:translate-x-1 transition-transform">
            <span>Execute</span>
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
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {CardContent}
    </motion.div>
  );
}
