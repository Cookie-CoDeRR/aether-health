"use client";

import { Hospital } from "@/types/hospital";
import { MapPin, Phone, Navigation, Stethoscope, AlertCircle } from "lucide-react";

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
      className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm ${
        isSelected
          ? "border-[#064E3B] dark:border-[#10B981] bg-[#F9FBF9] dark:bg-[#0F241E] ring-2 ring-[#064E3B]/20 dark:ring-[#10B981]/30 shadow-md"
          : "border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] hover:border-[#064E3B] dark:hover:border-[#10B981] hover:shadow-md"
      }`}
    >
      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            {hospital.isEmergency ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>24/7 Emergency & ICU</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#10B981] border border-[#064E3B]/20 dark:border-white/15 px-2.5 py-0.5 text-[11px] font-bold">
                <span>🏥</span>
                <span>{hospital.type || "Hospital"}</span>
              </span>
            )}
          </div>

          <span className="font-bold text-[#064E3B] dark:text-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] border border-[#064E3B]/20 dark:border-white/15 px-2.5 py-0.5 rounded-full text-xs">
            📍 {hospital.distanceKm ?? 0} km away
          </span>
        </div>

        {/* Facility Name & Address */}
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5] group-hover:text-[#064E3B] dark:group-hover:text-[#10B981] transition-colors leading-snug">
            {hospital.name}
          </h3>
          <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-relaxed mt-1 line-clamp-2">
            {hospital.address}
          </p>
          {hospital.phone && (
            <p className="text-xs text-[#064E3B] dark:text-[#A7F3D0] mt-1.5 flex items-center gap-1 font-bold">
              <Phone className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
              <span>{hospital.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3.5 border-t border-[#064E3B]/15 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white dark:hover:bg-[#132D26] hover:border-[#064E3B] dark:hover:border-[#10B981] px-3 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all min-tap-target"
          >
            <Navigation className="w-3.5 h-3.5 text-[#064E3B] dark:text-[#10B981]" />
            <span>Directions</span>
          </a>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] hover:bg-white dark:hover:bg-[#132D26] px-3 py-2 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] transition-all min-tap-target"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onExploreDoctors(hospital);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4 py-2 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctors Roster</span>
        </button>
      </div>
    </div>
  );
}
