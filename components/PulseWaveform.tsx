"use client";

import { UrgencyLevel } from "@/types/symptomLog";

interface PulseWaveformProps {
  mode?: "loading" | "urgency" | "static";
  urgencyLevel?: UrgencyLevel;
  className?: string;
  height?: number;
}

export default function PulseWaveform({
  mode = "static",
  urgencyLevel = "low",
  className = "",
  height = 36,
}: PulseWaveformProps) {
  // Determine path amplitude based on mode & urgency level
  let pathD = "M0 18 H40 L45 10 L50 26 L55 18 H120 L125 10 L130 26 L135 18 H200"; // Low/Gentle

  if (mode === "loading") {
    pathD = "M0 18 H30 L35 8 L42 28 L48 12 L53 22 L58 18 H110 L115 8 L122 28 L128 12 L133 22 L138 18 H200";
  } else if (urgencyLevel === "moderate") {
    pathD = "M0 18 H25 L32 4 L40 32 L46 8 L52 24 L57 18 H115 L122 4 L130 32 L136 8 L142 24 L147 18 H200";
  } else if (urgencyLevel === "high_critical") {
    pathD = "M0 18 H15 L22 -2 L30 38 L36 -6 L44 36 L50 12 L55 18 H105 L112 -2 L120 38 L126 -6 L134 36 L140 12 L145 18 H200";
  }

  const strokeColor =
    urgencyLevel === "high_critical"
      ? "#BA1A1A"
      : urgencyLevel === "moderate"
      ? "#E8674A"
      : "#4F9D8C";

  return (
    <div className={`relative flex items-center overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 200 36"
        height={height}
        className="w-full h-auto text-secondary"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background baseline */}
        <line x1="0" y1="18" x2="200" y2="18" stroke={strokeColor} strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="4 4" />

        {/* Pulse waveform trace */}
        <path
          d={pathD}
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={mode === "loading" ? "animate-pulse-slow" : ""}
        />
      </svg>
    </div>
  );
}
