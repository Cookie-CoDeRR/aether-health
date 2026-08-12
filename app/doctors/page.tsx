"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDoctorsList, createBooking } from "@/services/domain/bookingService";
import { verifyHprId, ABDMVerificationResult } from "@/services/abdmService";
import { Doctor } from "@/types/doctor";
import { Appointment } from "@/types/appointment";

function DoctorsContent() {
  const searchParams = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "all";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [abdmOnlyFilter, setAbdmOnlyFilter] = useState<boolean>(false);

  // ABDM HPR Verification State
  const [hprInput, setHprInput] = useState<string>("");
  const [isVerifyingHpr, setIsVerifyingHpr] = useState<boolean>(false);
  const [hprVerificationResult, setHprVerificationResult] = useState<ABDMVerificationResult | null>(null);

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Dynamically load doctor records from dataset
    getDoctorsList().then((data) => setDoctors(data));
  }, []);

  useEffect(() => {
    const querySpec = searchParams.get("specialty");
    if (querySpec) setSelectedSpecialty(querySpec);
  }, [searchParams]);

  // Derive unique specialties dynamically from the full doctor dataset
  const availableSpecialties = useMemo(() => {
    const specs = Array.from(new Set(doctors.map((d) => d.specialty)));
    return specs.sort();
  }, [doctors]);

  const handleVerifyHpr = async () => {
    if (!hprInput.trim()) return;
    setIsVerifyingHpr(true);
    try {
      const res = await verifyHprId(hprInput);
      setHprVerificationResult(res);
    } catch (err) {
      setHprVerificationResult({
        isVerified: false,
        hprId: hprInput,
        message: "Network error checking ABDM gateway. Please try again.",
        verifiedAt: new Date(),
      });
    } finally {
      setIsVerifyingHpr(false);
    }
  };

  // Dynamically recalculate and map over the full doctor dataset array
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSpecialty =
        selectedSpecialty === "all" ||
        doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
      const matchRating = doc.rating >= minRating;
      const matchDistance = doc.distance <= maxDistance;
      const matchAbdm = !abdmOnlyFilter || Boolean(doc.isAbdmVerified);
      const matchQuery =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.hprId && doc.hprId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSpecialty && matchRating && matchDistance && matchAbdm && matchQuery;
    });
  }, [doctors, selectedSpecialty, minRating, maxDistance, abdmOnlyFilter, searchQuery]);

  const handleBookingSubmit = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const slotDate = new Date();
      const parts = selectedSlot.split(":");
      slotDate.setHours(parseInt(parts[0]), 0, 0, 0);

      const appointment = await createBooking({
        userId: "aether_usr_8f92a170b4c2",
        doctorId: selectedDoctor.id,
        slotTime: slotDate,
        notes: bookingNotes,
      });

      setConfirmedAppointment(appointment);
    } catch (err) {
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedDoctor(null);
    setSelectedSlot("");
    setBookingNotes("");
    setConfirmedAppointment(null);
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto text-[#F6F1E9]">
      {/* Header */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-sans font-medium mb-1 flex items-center gap-2">
            <span>Specialist Routing & Directory</span>
            <span>•</span>
            <span className="text-[#4F9D8C] font-mono font-bold">ABDM HPR Gateway Integrated</span>
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Doctor Discovery & ABDM Verification
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-lg bg-[#4F9D8C]/15 border border-[#4F9D8C]/40 text-[#4F9D8C] px-3 py-1.5 font-bold flex items-center gap-1.5">
            <span>🛡️ ABDM HPR Compliant</span>
          </span>
        </div>
      </div>

      {/* ABDM HPR ID Verification Search Banner */}
      <div className="rounded-2xl border border-[#4F9D8C]/30 bg-[#0F2130] p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-base font-medium text-[#F6F1E9] flex items-center gap-2">
              <span>🛡️ ABDM Healthcare Professionals Registry (HPR) Lookup</span>
            </h3>
            <p className="text-xs text-[#B9C4CC]">
              Verify any doctor&apos;s National Health Authority (NHA) ABDM registration number or HPR handle in real-time.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase text-[#4F9D8C] bg-[#4F9D8C]/10 border border-[#4F9D8C]/30 px-2 py-0.5 rounded">
            Official ABDM HPR Gateway
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter Doctor HPR ID (e.g. dr_ananya@hpr) or Registration No (e.g. KMC-2018-84729)..."
            value={hprInput}
            onChange={(e) => setHprInput(e.target.value)}
            className="flex-1 rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2.5 text-xs text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#4F9D8C]"
          />
          <button
            onClick={handleVerifyHpr}
            disabled={isVerifyingHpr || !hprInput.trim()}
            className="rounded-xl bg-[#4F9D8C] hover:bg-[#4F9D8C]/90 text-white font-mono px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
          >
            {isVerifyingHpr ? "Verifying HPR..." : "Verify HPR ID"}
          </button>
        </div>

        {/* Verification Result Card */}
        {hprVerificationResult && (
          <div
            className={`rounded-xl border p-3 text-xs space-y-1.5 transition-all ${
              hprVerificationResult.isVerified
                ? "border-[#4F9D8C]/50 bg-[#4F9D8C]/10 text-[#F6F1E9]"
                : "border-[#D14343]/50 bg-[#D14343]/10 text-[#F6F1E9]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                {hprVerificationResult.isVerified ? "✓ ABDM VERIFIED HEALTHCARE PROFESSIONAL" : "⚠️ UNVERIFIED HPR ID"}
              </span>
              <span className="font-mono text-[10px] text-[#7C8A93]">
                {hprVerificationResult.verifiedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-xs text-[#B9C4CC] leading-relaxed">{hprVerificationResult.message}</p>
            {hprVerificationResult.doctor && (
              <div className="pt-1 font-mono text-[11px] text-[#4F9D8C] space-y-0.5">
                <div>Council: {hprVerificationResult.doctor.councilName}</div>
                <div>Qualifications: {hprVerificationResult.doctor.qualifications}</div>
                <div>Facility: {hprVerificationResult.doctor.facilityName}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Controls Toolbar */}
      <div className="grid gap-3 rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">Search</label>
          <input
            type="text"
            placeholder="Doctor name, HPR ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
          />
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">Specialty</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
          >
            <option value="all">All Specialties ({doctors.length})</option>
            {availableSpecialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
          >
            <option value="0">Any Rating</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.8">4.8+ ⭐</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">Max Distance ({maxDistance} km)</label>
          <input
            type="range"
            min="1"
            max="20"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            className="mt-2 w-full accent-[#E8674A]"
          />
        </div>

        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs font-mono text-[#4F9D8C] font-bold">
            <input
              type="checkbox"
              checked={abdmOnlyFilter}
              onChange={(e) => setAbdmOnlyFilter(e.target.checked)}
              className="accent-[#4F9D8C] h-4 w-4"
            />
            <span>🛡️ ABDM HPR Verified Only</span>
          </label>
        </div>
      </div>

      {/* Dynamic Count Subtitle Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#7C8A93]">
        <span>Showing {filteredDoctors.length} available specialists ({doctors.length} total in ABDM registry)</span>
        {(selectedSpecialty !== "all" || minRating > 0 || maxDistance < 20 || searchQuery || abdmOnlyFilter) && (
          <button
            onClick={() => {
              setSelectedSpecialty("all");
              setMinRating(0);
              setMaxDistance(20);
              setSearchQuery("");
              setAbdmOnlyFilter(false);
            }}
            className="text-[#E8674A] hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Doctor Cards Grid — Dynamically Mapped Over Filtered Full Array */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col justify-between rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-4 hover:border-[#E8674A]/40 transition-all shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={doc.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                  alt={doc.name}
                  className="h-12 w-12 rounded-lg object-cover border border-[rgba(246,241,233,0.16)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-base font-medium text-[#F6F1E9] truncate">{doc.name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="inline-block rounded bg-[#E8674A] text-[#0A1620] px-2 py-0.5 font-mono text-[10px] font-bold">
                      {doc.specialty}
                    </span>
                    {doc.isAbdmVerified && (
                      <span className="inline-block rounded bg-[#4F9D8C]/20 border border-[#4F9D8C] text-[#4F9D8C] px-1.5 py-0.5 font-mono text-[9px] font-bold">
                        🛡️ ABDM HPR Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ABDM Registry Details */}
              <div className="rounded-lg bg-[#0F2130] p-2.5 space-y-1 font-mono text-[11px]">
                {doc.hprId && (
                  <div className="flex justify-between text-[#4F9D8C]">
                    <span>HPR Handle:</span>
                    <span className="font-bold">{doc.hprId}</span>
                  </div>
                )}
                {doc.registrationNumber && (
                  <div className="flex justify-between text-[#B9C4CC]">
                    <span>Reg No:</span>
                    <span>{doc.registrationNumber}</span>
                  </div>
                )}
                {doc.councilName && (
                  <div className="text-[10px] text-[#7C8A93] truncate">
                    Council: {doc.councilName}
                  </div>
                )}
                {doc.qualifications && (
                  <div className="text-[10px] text-[#7C8A93] font-sans italic truncate">
                    {doc.qualifications}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs font-mono text-[#7C8A93]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#4F9D8C]">⭐ {doc.rating}</span>
                    <span>•</span>
                    <span>📍 {doc.distance} km</span>
                  </div>
                  {doc.consultationFee && (
                    <span className="text-[#F6F1E9] font-bold">₹{doc.consultationFee} Fee</span>
                  )}
                </div>
                <p className="line-clamp-2 leading-relaxed text-[11px] font-sans text-[#B9C4CC]">{doc.address}</p>
                {doc.phoneNumber && <p className="text-[11px]">📞 {doc.phoneNumber}</p>}
              </div>
            </div>

            <button
              onClick={() => setSelectedDoctor(doc)}
              className="w-full rounded-xl bg-[#E8674A] px-4 py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="rounded-xl border border-dashed border-[rgba(246,241,233,0.16)] p-12 text-center text-xs text-[#7C8A93]">
          No doctors found matching your filter criteria.
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            {!confirmedAppointment ? (
              <>
                <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">Book Appointment</h3>
                    <p className="text-xs text-[#7C8A93]">With {selectedDoctor.name} ({selectedDoctor.specialty})</p>
                    {selectedDoctor.isAbdmVerified && (
                      <p className="text-[10px] font-mono text-[#4F9D8C] pt-0.5">🛡️ ABDM HPR Verified: {selectedDoctor.hprId}</p>
                    )}
                  </div>
                  <button onClick={closeModal} className="text-[#7C8A93] hover:text-[#F6F1E9]">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#F6F1E9]">Select Available Time Slot</label>
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                      {(selectedDoctor.availableSlots || ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"]).map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg border px-3 py-2 text-center transition-colors ${
                            selectedSlot === slot
                              ? "border-[#E8674A] bg-[#E8674A]/20 text-[#E8674A] font-bold"
                              : "border-[rgba(246,241,233,0.16)] bg-[#132A38] text-[#F6F1E9] hover:bg-[#F6F1E9]/5"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-[#F6F1E9]">Notes for Specialist (Optional)</label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Briefly describe your symptoms or visit reason..."
                      className="mt-1 w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(246,241,233,0.09)]">
                  <button
                    onClick={closeModal}
                    className="rounded-lg px-4 py-2 text-xs text-[#7C8A93] hover:text-[#F6F1E9]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!selectedSlot || isSubmitting}
                    className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4F9D8C] text-white">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">Appointment Requested!</h3>
                  <p className="text-xs text-[#B9C4CC]">
                    Your appointment with <strong>{selectedDoctor.name}</strong> has been booked for <strong>{selectedSlot}</strong>.
                  </p>
                  {selectedDoctor.hprId && (
                    <p className="text-[11px] font-mono text-[#4F9D8C]">ABDM HPR Record: {selectedDoctor.hprId}</p>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="w-full rounded-xl bg-[#E8674A] px-4 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#7C8A93]">Loading doctor search...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
