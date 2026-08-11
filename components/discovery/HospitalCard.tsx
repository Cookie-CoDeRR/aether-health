"use client";

import { Hospital } from "@/types/hospital";

interface HospitalCardProps {
  hospital: Hospital;
  isSelected: boolean;
  onSelect: (hospital: Hospital) => void;
  onExploreDoctors: (hospital: Hospital) => void;
}

export default function HospitalCard({
  hospital,
  isSelected,
  onSelect,
  onExploreDoctors,
}: HospitalCardProps) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;

  return (
    <div
      onClick={() => onSelect(hospital)}
      className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-[#E8674A] bg-[#132A38] shadow-lg ring-1 ring-[#E8674A]"
          : "border-[rgba(246,241,233,0.09)] bg-[#0F2130] hover:bg-[#132A38] hover:border-[rgba(246,241,233,0.2)]"
      }`}
    >
      <div className="space-y-2.5">
        {/* Badges row */}
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            {hospital.isEmergency ? (
              <span className="inline-flex items-center gap-1 rounded bg-[#E8674A]/20 text-[#E8674A] border border-[#E8674A]/30 px-2 py-0.5 font-semibold">
                <span>🚨</span> 24/7 ICU & Emergency
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-[#4F9D8C]/20 text-[#4F9D8C] border border-[#4F9D8C]/30 px-2 py-0.5 font-medium uppercase">
                🏥 {hospital.type}
              </span>
            )}
          </div>
          <span className="font-semibold text-[#B9C4CC] bg-[#132A38] px-2 py-0.5 rounded border border-[rgba(246,241,233,0.09)]">
            📍 {hospital.distanceKm ?? 0} km away
          </span>
        </div>

        {/* Facility Name & Address */}
        <div>
          <h3 className="font-serif text-base font-medium text-[#F6F1E9] group-hover:text-[#E8674A] transition-colors leading-snug">
            {hospital.name}
          </h3>
          <p className="text-xs text-[#7C8A93] leading-relaxed mt-1 line-clamp-2">
            {hospital.address}
          </p>
          {hospital.phone && (
            <p className="text-[11px] font-mono text-[#B9C4CC] mt-1 flex items-center gap-1">
              <span>📞</span> {hospital.phone}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-[rgba(246,241,233,0.09)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-1.5 text-xs font-medium text-[#F6F1E9] hover:bg-[#E8674A] hover:text-[#0A1620] hover:border-[#E8674A] transition-all"
          >
            <span>🧭</span> Directions
          </a>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-1.5 text-xs font-medium text-[#F6F1E9] hover:bg-[#4F9D8C] hover:text-white transition-all"
            >
              <span>📞</span> Call
            </a>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onExploreDoctors(hospital);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-[#E8674A] px-3.5 py-1.5 text-xs font-semibold text-[#0A1620] hover:brightness-110 transition-all shadow-md"
        >
          <span>👨‍⚕️</span> Explore Doctors
        </button>
      </div>
    </div>
  );
}
