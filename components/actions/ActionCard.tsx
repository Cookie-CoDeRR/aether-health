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
      className={`group relative flex flex-col justify-between rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 shadow-sm transition-all duration-200 ${
        modalView
          ? "cursor-default"
          : "cursor-pointer hover:bg-[#F9FBF9] dark:hover:bg-[#0F241E] hover:border-[#064E3B] dark:hover:border-[#10B981] hover:shadow-md"
      }`}
    >
      <div>
        {/* Category Badge & Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9FBF9] dark:bg-[#0F241E] text-lg border border-[#064E3B]/20 dark:border-white/15">
              {action.icon}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#064E3B] dark:text-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 px-2.5 py-0.5 rounded-full font-bold">
              {action.category}
            </span>
          </div>
        </div>

        {/* Title & Detail */}
        <div className="mt-3.5">
          <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] group-hover:text-[#064E3B] dark:group-hover:text-[#10B981] transition-colors">
            {action.title}
          </h3>
          <p className="text-[11px] text-[#064E3B] dark:text-[#10B981] mt-0.5 font-bold">
            {action.detail}
          </p>
          <p className="mt-2 text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-relaxed line-clamp-3">
            {action.description}
          </p>
        </div>
      </div>

      {/* Footer Metrics & CTA */}
      <div className="mt-5 pt-3.5 border-t border-[#064E3B]/15 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#064E3B]/50 dark:text-white/40">{action.metrics}</span>
        {!modalView && (
          <span className="flex items-center gap-1 font-bold text-[#064E3B] dark:text-[#10B981] group-hover:translate-x-0.5 transition-transform">
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
