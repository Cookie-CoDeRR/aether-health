"use client";

import { useState, useEffect } from "react";
import { Hospital } from "@/types/hospital";
import { DiscoveryDoctor } from "@/types/discoveryDoctor";
import {
  getDoctorsByHospital,
  SPECIALTY_OPTIONS,
} from "@/services/domain/doctorDiscoveryService";

interface DoctorListDrawerProps {
  hospital: Hospital | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoctorListDrawer({
  hospital,
  isOpen,
  onClose,
}: DoctorListDrawerProps) {
  const [doctors, setDoctors] = useState<DiscoveryDoctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Consultation Booking Modal state
  const [bookingDoctor, setBookingDoctor] = useState<DiscoveryDoctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (hospital && isOpen) {
      setIsLoading(true);
      getDoctorsByHospital(hospital.name, selectedSpecialty)
        .then((data) => setDoctors(data))
        .finally(() => setIsLoading(false));
    }
  }, [hospital, isOpen, selectedSpecialty]);

  if (!isOpen || !hospital) return null;

  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSubmitting(false);
    setBookingConfirmed(true);
  };

  const closeBookingModal = () => {
    setBookingDoctor(null);
    setSelectedSlot("");
    setBookingConfirmed(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Side Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[#0F2130] border-l border-[rgba(246,241,233,0.16)] shadow-2xl transition-transform duration-300 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[rgba(246,241,233,0.09)] bg-[#132A38]/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded bg-[#E8674A]/20 text-[#E8674A] border border-[#E8674A]/30 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase">
                  Affiliated On-Duty Roster
                </span>
              </div>
              <h2 className="font-serif text-xl font-medium text-[#F6F1E9] mt-1">
                {hospital.name}
              </h2>
              <p className="text-xs text-[#7C8A93] mt-0.5">
                📍 {hospital.address} • {hospital.distanceKm ?? 0} km away
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#7C8A93] hover:bg-[#132A38] hover:text-[#F6F1E9] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Specialty Filter Tabs */}
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SPECIALTY_OPTIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                  selectedSpecialty === spec
                    ? "bg-[#E8674A] text-[#0A1620] font-semibold shadow-md"
                    : "bg-[#132A38] text-[#B9C4CC] hover:bg-[#F6F1E9]/10 border border-[rgba(246,241,233,0.09)]"
                }`}
              >
                {spec === "all" ? "All Specialties" : spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Profiles List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-xs font-mono text-[#7C8A93]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8674A] border-t-transparent"></div>
              <span>Querying on-duty doctor database...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[rgba(246,241,233,0.16)] rounded-xl text-xs text-[#7C8A93]">
              No specialists matching this category currently on shift.
            </div>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-3 hover:border-[#E8674A]/40 transition-all shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="h-12 w-12 rounded-lg object-cover border border-[rgba(246,241,233,0.16)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-medium text-[#F6F1E9] truncate">
                        {doc.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-[#4F9D8C] bg-[#4F9D8C]/10 px-2 py-0.5 rounded border border-[#4F9D8C]/20 shrink-0">
                        ₹{doc.consultationFee}
                      </span>
                    </div>
                    <p className="text-xs text-[#E8674A] font-mono font-medium mt-0.5">
                      {doc.qualification}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#7C8A93] mt-1">
                      <span>🎓 {doc.experienceYears}+ Yrs Exp</span>
                      <span>•</span>
                      <span>⭐ {doc.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Available Slots */}
                <div className="pt-2 border-t border-[rgba(246,241,233,0.09)]">
                  <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7C8A93] mb-1.5">
                    Available Shifts Today
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.availableSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded bg-[#0F2130] px-2 py-1 text-[11px] font-mono text-[#B9C4CC] border border-[rgba(246,241,233,0.09)]"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => {
                    setBookingDoctor(doc);
                    setSelectedSlot(doc.availableSlots[0] || "10:00 AM");
                  }}
                  className="w-full rounded-xl bg-[#E8674A] px-4 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-110 transition-all mt-2"
                >
                  Book Consultation
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[rgba(246,241,233,0.09)] bg-[#0F2130] text-[11px] text-[#7C8A93] text-center">
          Verified on-duty medical personnel database. Appointments are held for 15 mins.
        </div>
      </aside>

      {/* Booking Confirmation Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            {!bookingConfirmed ? (
              <>
                <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                      Confirm Consultation
                    </h3>
                    <p className="text-xs text-[#7C8A93]">
                      With {bookingDoctor.name} ({bookingDoctor.specialty})
                    </p>
                  </div>
                  <button onClick={closeBookingModal} className="text-[#7C8A93] hover:text-[#F6F1E9]">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-3 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#7C8A93]">Facility:</span>
                      <span className="text-[#F6F1E9]">{hospital.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7C8A93]">Consultation Fee:</span>
                      <span className="text-[#4F9D8C] font-bold">₹{bookingDoctor.consultationFee}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#F6F1E9] block mb-1.5">
                      Select Available Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      {bookingDoctor.availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-center text-xs transition-colors ${
                            selectedSlot === slot
                              ? "border-[#E8674A] bg-[#E8674A]/20 text-[#E8674A] font-bold"
                              : "border-[rgba(246,241,233,0.16)] bg-[#132A38] text-[#F6F1E9]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(246,241,233,0.09)]">
                  <button
                    onClick={closeBookingModal}
                    className="rounded-lg px-4 py-2 text-xs text-[#7C8A93] hover:text-[#F6F1E9]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !selectedSlot}
                    className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm & Reserve Slot"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4F9D8C] text-white text-xl font-bold">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                    Consultation Reserved!
                  </h3>
                  <p className="text-xs text-[#B9C4CC] leading-relaxed">
                    Your appointment with <strong>{bookingDoctor.name}</strong> at{" "}
                    <strong>{hospital.name}</strong> is confirmed for <strong>{selectedSlot}</strong>.
                  </p>
                </div>

                <button
                  onClick={closeBookingModal}
                  className="w-full rounded-xl bg-[#E8674A] px-4 py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
