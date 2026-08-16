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
      className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-soft ${
        isSelected
          ? "border-[#1E5D57] bg-white ring-2 ring-[#E6F4F1] shadow-card"
          : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-card"
      }`}
    >
      <div className="space-y-3">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            {hospital.isEmergency ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF4F2] text-[#C85339] border border-[#FDE6E2] px-2.5 py-0.5 text-[11px] font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>24/7 Emergency & ICU</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4F1] text-[#134E48] border border-[#D0EAE4] px-2.5 py-0.5 text-[11px] font-medium">
                <span>🏥</span>
                <span>{hospital.type || "Hospital"}</span>
              </span>
            )}
          </div>

          <span className="font-semibold text-[#1E5D57] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full text-xs">
            📍 {hospital.distanceKm ?? 0} km away
          </span>
        </div>

        {/* Facility Name & Address */}
        <div>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E293B] group-hover:text-[#1E5D57] transition-colors leading-snug">
            {hospital.name}
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed mt-1 line-clamp-2">
            {hospital.address}
          </p>
          {hospital.phone && (
            <p className="text-xs text-[#475569] mt-1.5 flex items-center gap-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#1E5D57]" />
              <span>{hospital.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3.5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] hover:bg-white hover:border-[#1E5D57] px-3 py-2 text-xs font-medium text-[#1E293B] transition-all min-tap-target"
          >
            <Navigation className="w-3.5 h-3.5 text-[#1E5D57]" />
            <span>Directions</span>
          </a>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] hover:bg-[#E6F4F1] px-3 py-2 text-xs font-medium text-[#134E48] transition-all min-tap-target"
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
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all min-tap-target"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>View Doctors</span>
        </button>
      </div>
    </div>
  );
}
