"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getDoctorsList, createBooking } from "@/services/domain/bookingService";
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

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    getDoctorsList().then((data) => setDoctors(data));
  }, []);

  useEffect(() => {
    const querySpec = searchParams.get("specialty");
    if (querySpec) setSelectedSpecialty(querySpec);
  }, [searchParams]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchSpecialty =
      selectedSpecialty === "all" ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchRating = doc.rating >= minRating;
    const matchDistance = doc.distance <= maxDistance;
    const matchQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSpecialty && matchRating && matchDistance && matchQuery;
  });

  const handleBookingSubmit = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const slotDate = new Date();
      slotDate.setHours(parseInt(selectedSlot.split(":")[0]), 0, 0, 0);

      const appointment = await createBooking({
        userId: "demo-user-123",
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
    <div className="space-y-6 animate-fade-in p-6 lg:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-4">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-sans font-medium mb-1">
          Specialist Routing & Directory
        </div>
        <h1 className="font-serif text-2xl font-medium tracking-[0.01em] text-[#F6F1E9]">
          Doctor Discovery & Booking
        </h1>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="grid gap-3 rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">Search</label>
          <input
            type="text"
            placeholder="Doctor name or location..."
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
            <option value="all">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Neurology">Neurology</option>
            <option value="General Practice">General Practice</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Orthopedics">Orthopedics</option>
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
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[#7C8A93]">
        <span>Showing {filteredDoctors.length} available specialists</span>
        {(selectedSpecialty !== "all" || minRating > 0 || maxDistance < 20 || searchQuery) && (
          <button
            onClick={() => {
              setSelectedSpecialty("all");
              setMinRating(0);
              setMaxDistance(20);
              setSearchQuery("");
            }}
            className="text-[#E8674A] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col justify-between rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-4 space-y-4 hover:border-[#E8674A]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={doc.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"}
                  alt={doc.name}
                  className="h-12 w-12 rounded-lg object-cover border border-[rgba(246,241,233,0.16)]"
                />
                <div>
                  <h3 className="font-serif text-base font-medium text-[#F6F1E9]">{doc.name}</h3>
                  <span className="inline-block rounded bg-[#4F9D8C] text-white px-2 py-0.5 font-mono text-[10px] font-semibold mt-0.5">
                    {doc.specialty}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono text-[#7C8A93]">
                <div className="flex items-center gap-1">
                  <span className="text-[#4F9D8C]">⭐ {doc.rating}</span>
                  <span>•</span>
                  <span>📍 {doc.distance} km away</span>
                </div>
                <p className="line-clamp-2 leading-relaxed text-[11px] font-sans text-[#B9C4CC]">{doc.address}</p>
                {doc.phoneNumber && <p className="text-[11px]">📞 {doc.phoneNumber}</p>}
              </div>
            </div>

            <button
              onClick={() => setSelectedDoctor(doc)}
              className="w-full rounded-xl bg-[#E8674A] px-4 py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all"
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
                  </div>
                  <button onClick={closeModal} className="text-[#7C8A93] hover:text-[#F6F1E9]">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#F6F1E9]">Select Time Slot</label>
                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                      {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"].map((slot) => (
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
                    className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 disabled:opacity-50 transition-colors"
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
