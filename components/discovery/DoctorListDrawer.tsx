"use client";

import { useState, useEffect } from "react";
import { Hospital } from "@/types/hospital";
import { DiscoveryDoctor } from "@/types/discoveryDoctor";
import {
  getDoctorsByHospital,
  SPECIALTY_OPTIONS,
} from "@/services/domain/doctorDiscoveryService";
import { ShieldCheck, Star, Clock, X, Calendar, CheckCircle2 } from "lucide-react";

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
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Side Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white border-l border-[#E2E8F0] shadow-elevated transition-transform duration-300 animate-slide-left text-[#1E293B]">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAF9]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-[#E6F4F1] text-[#134E48] border border-[#D0EAE4] px-2.5 py-0.5 text-[11px] font-semibold">
                  On-Duty Specialists
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E293B] mt-1.5">
                {hospital.name}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                📍 {hospital.address} • {hospital.distanceKm ?? 0} km away
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[#64748B] hover:bg-white hover:text-[#1E293B] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Specialty Filter Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SPECIALTY_OPTIONS.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  selectedSpecialty === spec
                    ? "bg-[#1E5D57] text-white shadow-soft"
                    : "bg-white text-[#64748B] hover:bg-[#E6F4F1] hover:text-[#134E48] border border-[#E2E8F0]"
                }`}
              >
                {spec === "all" ? "All Specialties" : spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Profiles List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-xs text-[#64748B]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1E5D57] border-t-transparent"></div>
              <span>Finding on-duty doctors...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E2E8F0] rounded-2xl text-xs text-[#64748B] bg-[#F8FAF9]">
              No specialists matching this category currently scheduled.
            </div>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-5 space-y-3.5 hover:border-[#1E5D57] hover:shadow-card transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-[#E2E8F0] shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-semibold text-[#1E293B] truncate">
                        {doc.name}
                      </h3>
                      <span className="text-sm font-bold text-[#1E5D57] shrink-0">
                        ₹{doc.consultationFee}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="rounded-md bg-[#E6F4F1] text-[#134E48] px-2 py-0.5 text-xs font-semibold">
                        {doc.qualification}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F4] text-[#475569] px-2 py-0.5 text-[11px] font-medium">
                        <ShieldCheck className="w-3 h-3 text-[#1E5D57]" />
                        <span>ABDM Verified</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B] mt-2">
                      <span>{doc.experienceYears}+ Yrs Exp</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-[#B45309] font-medium">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span>{doc.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Shifts */}
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <span className="block text-[11px] font-semibold text-[#64748B] mb-1.5">
                    Available Consultations Today
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.availableSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-lg bg-[#F8FAF9] px-2.5 py-1 text-xs text-[#1E293B] font-medium border border-[#E2E8F0]"
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
                  className="w-full rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-4 py-2.5 text-xs font-semibold text-white shadow-soft transition-all min-tap-target"
                >
                  Book Consultation
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAF9] text-xs text-[#64748B] text-center">
          Verified medical roster. Consultation slots are reserved instantly.
        </div>
      </aside>

      {/* Booking Confirmation Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-elevated space-y-4 text-[#1E293B]">
            {!bookingConfirmed ? (
              <>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#1E293B]">
                      Confirm Consultation
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      With {bookingDoctor.name} ({bookingDoctor.specialty})
                    </p>
                  </div>
                  <button onClick={closeBookingModal} className="text-[#64748B] hover:text-[#1E293B] p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Facility:</span>
                      <span className="font-medium text-[#1E293B]">{hospital.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Consultation Fee:</span>
                      <span className="text-[#1E5D57] font-bold text-sm">₹{bookingDoctor.consultationFee}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[#1E293B] block mb-2">
                      Select Available Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {bookingDoctor.availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                            selectedSlot === slot
                              ? "border-[#1E5D57] bg-[#E6F4F1] text-[#134E48] ring-2 ring-[#1E5D57]"
                              : "border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#CBD5E1]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                  <button
                    onClick={closeBookingModal}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#1E293B]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !selectedSlot}
                    className="rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-5 py-2.5 text-xs font-semibold text-white shadow-soft disabled:opacity-50 transition-all min-tap-target"
                  >
                    {isSubmitting ? "Reserving..." : "Reserve Consultation"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F4F1] text-[#1E5D57]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
                    Consultation Reserved!
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
                    Your appointment with <strong>{bookingDoctor.name}</strong> at{" "}
                    <strong>{hospital.name}</strong> has been scheduled for <strong>{selectedSlot}</strong>.
                  </p>
                </div>

                <button
                  onClick={closeBookingModal}
                  className="w-full rounded-xl bg-[#1E5D57] hover:bg-[#134E48] px-4 py-3 text-xs font-semibold text-white shadow-soft transition-all min-tap-target"
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
