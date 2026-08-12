"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useTransition, useCallback } from "react";

import nextDynamic from "next/dynamic";
import Link from "next/link";
import { Hospital } from "@/types/hospital";
import { fetchNearbyHospitals } from "@/services/overpassService";
import HospitalCard from "@/components/discovery/HospitalCard";
import DoctorListDrawer from "@/components/discovery/DoctorListDrawer";

// Dynamically import HospitalMapCanvas with SSR disabled for Leaflet
const HospitalMapCanvas = nextDynamic(
  () => import("@/components/discovery/HospitalMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[420px] w-full rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] flex items-center justify-center p-6 text-center text-xs font-mono text-[#7C8A93]">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8674A] border-t-transparent"></div>
          <span>Loading Interactive Map Canvas...</span>
        </div>
      </div>
    ),
  }
);

// Default center (Bangalore Central: 12.9716, 77.5946 or GPS position)
const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

export default function DiscoveryPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [locationStatus, setLocationStatus] = useState<"detecting" | "acquired" | "default" | "error">("default");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState<boolean>(false);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Drawer state for doctors
  const [drawerHospital, setDrawerHospital] = useState<Hospital | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [, startTransition] = useTransition();

  const loadHospitals = useCallback(async (lat: number, lng: number, radiusMeters: number) => {
    setIsLoadingHospitals(true);
    try {
      const fetched = await fetchNearbyHospitals(lat, lng, radiusMeters);
      startTransition(() => {
        setHospitals(fetched);
        if (fetched.length > 0 && !selectedHospital) {
          setSelectedHospital(fetched[0]);
        }
      });
    } catch (err) {
      console.error("Error fetching nearby hospitals:", err);
    } finally {
      setIsLoadingHospitals(false);
    }
  }, [selectedHospital]);

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
      },
      (err) => {
        console.warn("Geolocation access denied or failed. Using default location.", err);
        setLocationStatus("error");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Detect GPS location on mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // Fetch hospitals when location or radius changes
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

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header & Page Title */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[#E8674A] font-sans font-medium mb-1 flex items-center gap-2">
            <span>📍 OpenStreetMap & Overpass Engine</span>
            <span>•</span>
            <span>Zero-Cost Architecture</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Nearby Hospitals & Doctor Discovery
          </h1>
        </div>

        <button
          onClick={detectUserLocation}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-4 py-2 text-xs font-semibold text-[#F6F1E9] hover:bg-[#E8674A] hover:text-[#0A1620] transition-all shrink-0"
        >
          <span>🎯</span>
          <span>{locationStatus === "detecting" ? "Locating GPS..." : "Detect My GPS Location"}</span>
        </button>
      </div>

      {/* AI Context Triage Banner */}
      <div className="rounded-xl border border-[#E8674A]/30 bg-[#0F2130] p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8674A]/20 text-[#E8674A] text-lg font-bold border border-[#E8674A]/30">
            🤖
          </span>
          <div>
            <span className="inline-block font-mono text-[10px] uppercase tracking-wider text-[#E8674A] font-semibold">
              AI Symptom Context Banner
            </span>
            <p className="text-xs text-[#F6F1E9] font-sans leading-relaxed mt-0.5">
              Suggested facility routing based on your recent symptom triage session. Emergency ICU facilities are prioritized automatically.
            </p>
          </div>
        </div>

        <Link
          href="/triage"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3.5 py-2 text-xs font-mono text-[#F6F1E9] hover:border-[#E8674A] transition-all shrink-0"
        >
          <span>💬</span>
          <span>Run Symptom Read →</span>
        </Link>
      </div>

      {/* User Location Controls & Filter Toolbar */}
      <div className="grid gap-4 rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-4 sm:grid-cols-2 lg:grid-cols-4 items-center">
        {/* Location Status */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93] block mb-1">
            Current GPS Coordinates
          </label>
          <div className="flex items-center gap-2 font-mono text-xs text-[#F6F1E9] bg-[#132A38] px-3 py-2 rounded-lg border border-[rgba(246,241,233,0.09)]">
            <span className={`h-2 w-2 rounded-full ${locationStatus === "acquired" ? "bg-[#00F0FF] animate-pulse" : "bg-[#4F9D8C]"}`} />
            <span>
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Radius Slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93]">
              Search Radius
            </label>
            <span className="font-mono text-xs text-[#E8674A] font-bold">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
            className="w-full accent-[#E8674A] cursor-pointer"
          />
        </div>

        {/* Search Input */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#7C8A93] block mb-1">
            Search Facility Name
          </label>
          <input
            type="text"
            placeholder="Type hospital or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-3 py-2 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
          />
        </div>

        {/* Emergency Toggle */}
        <div className="flex items-center sm:justify-end gap-2 pt-2 sm:pt-4">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-mono text-[#F6F1E9]">
            <input
              type="checkbox"
              checked={filterEmergencyOnly}
              onChange={(e) => setFilterEmergencyOnly(e.target.checked)}
              className="accent-[#E8674A] rounded h-4 w-4"
            />
            <span>Show 24/7 ICU & Emergency Only</span>
          </label>
        </div>
      </div>

      {/* Main Split View: Map & Hospital Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Canvas (7 cols) */}
        <div className="lg:col-span-7 h-[500px] lg:h-[650px] sticky top-6">
          <HospitalMapCanvas
            userLocation={userLocation}
            hospitals={filteredHospitals}
            selectedHospital={selectedHospital}
            onSelectHospital={(hosp: Hospital) => setSelectedHospital(hosp)}
            onExploreDoctors={handleOpenDoctorDrawer}
          />
        </div>

        {/* Right Column: Hospital Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-4 max-h-[650px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between font-mono text-xs text-[#7C8A93] px-1">
            <span>
              {isLoadingHospitals
                ? "Querying Overpass API..."
                : `Found ${filteredHospitals.length} nearby facilities`}
            </span>
            {filterEmergencyOnly && (
              <span className="text-[#E8674A] font-semibold">Filtered by Emergency</span>
            )}
          </div>

          {isLoadingHospitals ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] animate-pulse p-4"
                />
              ))}
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-8 text-center text-xs text-[#7C8A93] space-y-2">
              <p>No medical facilities found within {radiusKm} km radius.</p>
              <button
                onClick={() => {
                  setRadiusKm(10);
                  setFilterEmergencyOnly(false);
                  setSearchQuery("");
                }}
                className="text-[#E8674A] hover:underline font-mono"
              >
                Expand Search Radius to 10 km →
              </button>
            </div>
          ) : (
            filteredHospitals.map((hosp) => (
              <HospitalCard
                key={hosp.id}
                hospital={hosp}
                isSelected={selectedHospital?.id === hosp.id}
                onSelect={(h) => setSelectedHospital(h)}
                onExploreDoctors={handleOpenDoctorDrawer}
              />
            ))
          )}
        </div>
      </div>

      {/* Doctor List Drawer */}
      <DoctorListDrawer
        hospital={drawerHospital}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
