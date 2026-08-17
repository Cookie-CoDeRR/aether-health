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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Side Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white dark:bg-[#0B1D17] border-l border-[#064E3B]/20 dark:border-white/10 shadow-2xl transition-transform duration-300 animate-slide-left text-[#064E3B] dark:text-[#ECFDF5]">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-[#F9FBF9] dark:bg-[#132D26] text-[#064E3B] dark:text-[#10B981] border border-[#064E3B]/20 dark:border-white/15 px-2.5 py-0.5 text-[11px] font-bold">
                  On-Duty Specialists
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#064E3B] dark:text-[#ECFDF5] mt-1.5">
                {hospital.name}
              </h2>
              <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-1">
                📍 {hospital.address} • {hospital.distanceKm ?? 0} km away
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[#064E3B]/70 dark:text-white/70 hover:bg-white dark:hover:bg-white/10 hover:text-[#064E3B] dark:hover:text-white transition-colors"
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
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all min-tap-target ${
                  selectedSpecialty === spec
                    ? "bg-[#064E3B] dark:bg-[#10B981] text-white dark:text-[#042F24] shadow-soft"
                    : "bg-white dark:bg-[#0B1D17] text-[#064E3B]/70 dark:text-white/70 hover:bg-[#064E3B]/5 dark:hover:bg-white/5 border border-[#064E3B]/20 dark:border-white/10"
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
            <div className="flex flex-col items-center justify-center h-48 space-y-3 text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] dark:border-[#10B981] border-t-transparent"></div>
              <span>Finding on-duty doctors...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#064E3B]/20 dark:border-white/15 rounded-2xl text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 bg-[#F9FBF9] dark:bg-[#0F241E]">
              No specialists matching this category currently scheduled.
            </div>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0F241E] p-5 space-y-3.5 hover:border-[#064E3B] dark:hover:border-[#10B981] hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-[#064E3B]/20 dark:border-white/15 shrink-0 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] truncate">
                        {doc.name}
                      </h3>
                      <span className="text-sm font-bold text-[#064E3B] dark:text-[#10B981] shrink-0">
                        ₹{doc.consultationFee}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="rounded-md bg-[#F9FBF9] dark:bg-[#132D26] text-[#064E3B] dark:text-[#10B981] px-2 py-0.5 text-xs font-bold border border-[#064E3B]/15 dark:border-white/10">
                        {doc.qualification}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#F9FBF9] dark:bg-[#132D26] text-[#064E3B]/80 dark:text-[#ECFDF5]/80 px-2 py-0.5 text-[11px] font-medium border border-[#064E3B]/15 dark:border-white/10">
                        <ShieldCheck className="w-3 h-3 text-[#064E3B] dark:text-[#10B981]" />
                        <span>ABDM Verified</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#064E3B]/70 dark:text-white/60 mt-2">
                      <span>{doc.experienceYears}+ Yrs Exp</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Available Shifts */}
                <div className="pt-2 border-t border-[#064E3B]/15 dark:border-white/10">
                  <span className="block text-[11px] font-bold text-[#064E3B]/70 dark:text-white/60 mb-1.5">
                    Available Consultations Today
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.availableSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-lg bg-[#F9FBF9] dark:bg-[#132D26] px-2.5 py-1 text-xs text-[#064E3B] dark:text-[#ECFDF5] font-bold border border-[#064E3B]/15 dark:border-white/10"
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
                  className="w-full rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
                >
                  Book Consultation
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] text-xs text-[#064E3B]/70 dark:text-white/60 text-center">
          Verified medical roster. Consultation slots are reserved instantly.
        </div>
      </aside>

      {/* Booking Confirmation Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in text-[#064E3B] dark:text-[#ECFDF5]">
          <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4">
            {!bookingConfirmed ? (
              <>
                <div className="flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                      Confirm Consultation
                    </h3>
                    <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                      With {bookingDoctor.name} ({bookingDoctor.specialty})
                    </p>
                  </div>
                  <button onClick={closeBookingModal} className="text-[#064E3B]/70 dark:text-white/70 hover:text-[#064E3B] dark:hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="rounded-xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#064E3B]/70 dark:text-white/60">Facility:</span>
                      <span className="font-bold text-[#064E3B] dark:text-[#ECFDF5]">{hospital.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#064E3B]/70 dark:text-white/60">Consultation Fee:</span>
                      <span className="text-[#064E3B] dark:text-[#10B981] font-bold text-sm">₹{bookingDoctor.consultationFee}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-2">
                      Select Available Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {bookingDoctor.availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all min-tap-target ${
                            selectedSlot === slot
                              ? "border-[#064E3B] dark:border-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] text-[#064E3B] dark:text-[#10B981] ring-2 ring-[#064E3B] dark:ring-[#10B981]"
                              : "border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0F241E] text-[#064E3B] dark:text-[#ECFDF5] hover:border-[#064E3B] dark:hover:border-[#10B981]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#064E3B]/15 dark:border-white/10">
                  <button
                    onClick={closeBookingModal}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !selectedSlot}
                    className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft disabled:opacity-50 transition-all min-tap-target"
                  >
                    {isSubmitting ? "Reserving..." : "Reserve Consultation"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9FBF9] dark:bg-[#0F241E] text-[#064E3B] dark:text-[#10B981] border border-[#064E3B]/20 dark:border-white/15">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                    Consultation Reserved!
                  </h3>
                  <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 leading-relaxed max-w-xs mx-auto">
                    Your appointment with <strong>{bookingDoctor.name}</strong> at{" "}
                    <strong>{hospital.name}</strong> has been scheduled for <strong>{selectedSlot}</strong>.
                  </p>
                </div>

                <button
                  onClick={closeBookingModal}
                  className="w-full rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4 py-3 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
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
