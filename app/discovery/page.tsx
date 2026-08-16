"use client";

import { useState, useEffect, useTransition, useCallback, Suspense } from "react";
import nextDynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Hospital } from "@/types/hospital";
import { Doctor } from "@/types/doctor";
import { fetchNearbyHospitals } from "@/services/overpassService";
import { getDoctorsList, createBooking } from "@/services/domain/bookingService";
import HospitalCard from "@/components/discovery/HospitalCard";
import DoctorListDrawer from "@/components/discovery/DoctorListDrawer";
import {
  MapPin,
  Search,
  Stethoscope,
  Building2,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Clock,
} from "lucide-react";

// Dynamically import HospitalMapCanvas with SSR disabled for Leaflet
const HospitalMapCanvas = nextDynamic(
  () => import("@/components/discovery/HospitalMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[420px] w-full rounded-3xl border border-[#064E3B]/20 bg-white flex items-center justify-center p-6 text-center text-xs text-[#064E3B] shadow-sm">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent"></div>
          <span>Loading Health Map...</span>
        </div>
      </div>
    ),
  }
);

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

function DiscoveryContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"hospitals" | "doctors">("hospitals");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [locationStatus, setLocationStatus] = useState<"detecting" | "acquired" | "default" | "error">("default");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState<boolean>(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Drawer state for hospital doctors
  const [drawerHospital, setDrawerHospital] = useState<Hospital | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Direct Doctor Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  const [, startTransition] = useTransition();

  // Handle URL query parameters (?tab=doctors or ?tab=hospitals or ?specialty=)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "doctors") {
      setActiveTab("doctors");
    } else {
      setActiveTab("hospitals");
    }

    const specialty = searchParams.get("specialty");
    if (specialty) {
      setSelectedSpecialty(specialty);
      setActiveTab("doctors");
    }
  }, [searchParams]);

  const handleTabChange = (newTab: "hospitals" | "doctors") => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    if (newTab === "hospitals") {
      url.searchParams.delete("specialty");
    }
    window.history.replaceState({}, "", url.toString());
  };

  // Load cached location on mount if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLat = localStorage.getItem("aether_saved_lat");
      const savedLng = localStorage.getItem("aether_saved_lng");
      if (savedLat && savedLng) {
        setUserLocation({
          lat: parseFloat(savedLat),
          lng: parseFloat(savedLng),
        });
        setLocationStatus("acquired");
      }
    }
  }, []);

  const loadHospitals = useCallback(async (lat: number, lng: number, radiusMeters: number) => {
    setIsLoadingHospitals(true);
    try {
      const fetched = await fetchNearbyHospitals(lat, lng, radiusMeters);
      startTransition(() => {
        setHospitals(fetched);
      });
    } catch (err) {
      console.error("Error fetching nearby hospitals:", err);
    } finally {
      setIsLoadingHospitals(false);
    }
  }, []);

  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationStatus("acquired");

        if (typeof window !== "undefined") {
          localStorage.setItem("aether_saved_lat", coords.lat.toString());
          localStorage.setItem("aether_saved_lng", coords.lng.toString());
        }
      },
      (err) => {
        setLocationStatus("error");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    detectUserLocation();
    getDoctorsList().then((data) => setDoctors(data));
  }, [detectUserLocation]);

  useEffect(() => {
    loadHospitals(userLocation.lat, userLocation.lng, radiusKm * 1000);
  }, [userLocation, radiusKm, loadHospitals]);

  const handleOpenDoctorDrawer = (hospital: Hospital) => {
    setDrawerHospital(hospital);
    setIsDrawerOpen(true);
  };

  const filteredHospitals = hospitals.filter((hosp) => {
    const matchesSearch =
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmergency = !filterEmergencyOnly || hosp.isEmergency;
    return matchesSearch && matchesEmergency;
  });

  const availableSpecialties = Array.from(new Set(doctors.map((d) => d.specialty))).sort();

  const filteredDoctors = doctors.filter((doc) => {
    const matchSpecialty =
      selectedSpecialty === "all" ||
      doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpecialty && matchQuery;
  });

  const handleDoctorBookingSubmit = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setIsSubmittingBooking(true);
    try {
      const slotDate = new Date();
      await createBooking({
        userId: "aether_usr_8f92a170b4c2",
        doctorId: selectedDoctor.id,
        slotTime: slotDate,
        notes: "Booked via Aether Patient Care",
      });
      setBookingConfirmed(true);
    } catch (err) {
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#064E3B] w-full pb-28">
      {/* Top Header & Patient Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#064E3B]/15 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 mb-1 flex items-center gap-2">
            <span>Verified Care Network</span>
            <span>•</span>
            <span>Emergency Routing & Specialist Roster</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B]">
            Find Care & Verified Doctors
          </h1>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-[#F9FBF9] border border-[#064E3B]/20 p-1.5 shadow-2xs">
          <button
            onClick={() => handleTabChange("hospitals")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "hospitals"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B] hover:bg-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospitals & Clinics</span>
          </button>

          <button
            onClick={() => handleTabChange("doctors")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "doctors"
                ? "bg-[#064E3B] text-white shadow-soft"
                : "text-[#064E3B]/70 hover:text-[#064E3B] hover:bg-white"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Verified Doctors</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-3xl border border-[#064E3B]/20 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064E3B]/60" />
            <input
              type="text"
              placeholder={activeTab === "hospitals" ? "Search hospital or clinic name..." : "Search doctor name or specialty..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] pl-10 pr-3.5 py-2.5 text-xs text-[#064E3B] placeholder-[#064E3B]/50 focus:bg-white focus:outline-none focus:border-[#064E3B]"
            />
          </div>

          {/* Specialty Filter (If in doctor mode) */}
          {activeTab === "doctors" ? (
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full rounded-2xl border border-[#064E3B]/20 bg-[#F9FBF9] px-3.5 py-2.5 text-xs text-[#064E3B] font-medium focus:bg-white focus:outline-none focus:border-[#064E3B]"
              >
                <option value="all">All Specialties ({doctors.length})</option>
                {availableSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Radius Slider for Hospitals */
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#064E3B]/70">Distance Radius</span>
                <span className="font-bold text-[#064E3B]">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full accent-[#064E3B] cursor-pointer"
              />
            </div>
          )}

          {/* Location Status indicator */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#064E3B]/15 bg-[#F9FBF9] px-3.5 py-2 text-xs">
            <MapPin className="w-4 h-4 text-[#064E3B] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block font-bold text-[11px] text-[#064E3B] truncate">
                {locationStatus === "detecting"
                  ? "Locating GPS..."
                  : locationStatus === "acquired"
                  ? "GPS Location Acquired"
                  : "Default Region"}
              </span>
              <span className="block text-[10px] text-[#064E3B]/60 truncate font-mono">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            </div>
            <button
              onClick={detectUserLocation}
              className="text-[10.5px] font-bold text-[#064E3B] hover:underline shrink-0"
            >
              Update
            </button>
          </div>

          {/* Emergency 24/7 Filter Toggle */}
          {activeTab === "hospitals" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-2.5 px-3 text-xs font-bold transition-all ${
                  filterEmergencyOnly
                    ? "bg-[#064E3B] text-white border-[#064E3B]"
                    : "border-[#064E3B]/20 bg-[#F9FBF9] text-[#064E3B] hover:bg-white"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>24/7 ICU & Emergency Only</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: HOSPITALS MAP & LIST DUAL VIEW */}
      {activeTab === "hospitals" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Mobile First / Desktop Right: Interactive Map Canvas */}
          <div className="lg:col-span-7 h-[290px] sm:h-[380px] lg:h-[640px] w-full lg:sticky lg:top-4 order-first lg:order-last">
            <HospitalMapCanvas
              userLocation={userLocation}
              hospitals={filteredHospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={(h) => setSelectedHospital(h)}
              onExploreDoctors={handleOpenDoctorDrawer}
            />
          </div>

          {/* Mobile Second / Desktop Left: Hospital Cards List */}
          <div className="lg:col-span-5 space-y-3 max-h-[520px] lg:max-h-[640px] overflow-y-auto no-scrollbar pr-0.5 order-last lg:order-first">
            <div className="flex items-center justify-between text-xs font-bold text-[#064E3B] px-1 sticky top-0 bg-white/90 backdrop-blur-xs py-1 z-10">
              <span>Nearby Facilities ({filteredHospitals.length})</span>
              <span className="text-[11px] text-[#064E3B]/70">Sorted by distance</span>
            </div>

            {isLoadingHospitals ? (
              <div className="rounded-3xl border border-[#064E3B]/20 bg-white p-8 text-center text-xs space-y-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent mx-auto"></div>
                <p className="font-bold text-[#064E3B]">Searching OpenStreetMap health registry...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#064E3B]/20 bg-white p-8 text-center text-xs space-y-2">
                <p className="font-bold text-sm text-[#064E3B]">No hospitals found in this radius.</p>
                <p className="text-[#064E3B]/70">Try increasing the radius slider to 10 km or 15 km.</p>
              </div>
            ) : (
              filteredHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  isSelected={selectedHospital?.id === hospital.id}
                  onSelect={(h) => setSelectedHospital(h)}
                  onExploreDoctors={handleOpenDoctorDrawer}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: VERIFIED DOCTORS ROSTER */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
            <span>Verified Practitioners ({filteredDoctors.length})</span>
            <span className="text-[11px] text-[#064E3B]/70">ABDM Registry Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-3xl border border-[#064E3B]/20 bg-white p-5 space-y-4 shadow-xs hover:border-[#064E3B] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.photoUrl || undefined}
                        alt={doc.name}
                        className="h-12 w-12 rounded-2xl object-cover border border-[#064E3B]/20"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#064E3B]">
                          {doc.name}
                        </h4>
                        <span className="text-[11px] font-bold text-[#064E3B]/70 block">
                          {doc.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#F9FBF9] border border-[#064E3B]/20 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#064E3B]">
                      <Star className="w-3 h-3 text-[#064E3B] fill-current" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#064E3B]/80 pt-1 border-t border-[#064E3B]/10">
                    <p className="font-medium truncate">{doc.qualifications || doc.specialty}</p>
                    <p className="text-[11px] text-[#064E3B]/60 truncate">{doc.address}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#064E3B] pt-1">
                    <span>Consultation: ₹{doc.consultationFee || 500}</span>
                    <span className="text-[11px] font-mono text-[#064E3B]/70">{doc.rating} ★ Verified</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSelectedSlot((doc.availableSlots && doc.availableSlots[0]) || "10:00 AM");
                  }}
                  className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-2.5 text-xs font-bold text-white shadow-xs transition-all min-tap-target"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hospital Doctors Drawer */}
      {drawerHospital && (
        <DoctorListDrawer
          isOpen={isDrawerOpen}
          hospital={drawerHospital}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Direct Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#064E3B]/40 p-4 backdrop-blur-xs animate-fade-in text-[#064E3B]">
          <div className="w-full max-w-md rounded-3xl border border-[#064E3B]/20 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-[#064E3B]/15 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.photoUrl || undefined}
                  alt={selectedDoctor.name}
                  className="h-11 w-11 rounded-2xl object-cover border border-[#064E3B]/20"
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#064E3B]">
                    {selectedDoctor.name}
                  </h3>
                  <span className="text-xs text-[#064E3B]/70 font-medium">
                    {selectedDoctor.specialty} • ₹{selectedDoctor.consultationFee}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedDoctor(null);
                  setBookingConfirmed(false);
                }}
                className="text-[#064E3B]/70 hover:text-[#064E3B] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-[#F9FBF9] border border-[#064E3B]/20 flex items-center justify-center mx-auto text-[#064E3B]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#064E3B]">
                  Consultation Confirmed!
                </h4>
                <p className="text-xs text-[#064E3B]/80">
                  Appointment confirmed with <strong>{selectedDoctor.name}</strong> for today at <strong>{selectedSlot}</strong>.
                </p>
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setBookingConfirmed(false);
                  }}
                  className="rounded-2xl bg-[#064E3B] text-white font-bold px-6 py-2.5 text-xs shadow-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#064E3B] block mb-2">
                    Select Available Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedDoctor.availableSlots || ["10:00 AM", "02:30 PM", "05:00 PM"]).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl py-2 font-bold text-center border transition-all ${
                          selectedSlot === slot
                            ? "bg-[#064E3B] text-white border-[#064E3B] shadow-2xs"
                            : "bg-[#F9FBF9] border-[#064E3B]/20 text-[#064E3B] hover:bg-white"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F9FBF9] border border-[#064E3B]/15 p-3 space-y-1">
                  <div className="font-bold text-[#064E3B]">Clinic Location:</div>
                  <p className="text-[#064E3B]/70">{selectedDoctor.address}</p>
                </div>

                <button
                  onClick={handleDoctorBookingSubmit}
                  disabled={isSubmittingBooking}
                  className="w-full rounded-2xl bg-[#064E3B] hover:bg-[#043327] py-3 text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all min-tap-target"
                >
                  {isSubmittingBooking ? "Confirming..." : "Confirm & Link ABDM Health Record →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#064E3B]">Loading Care Network...</div>}>
      <DiscoveryContent />
    </Suspense>
  );
}
