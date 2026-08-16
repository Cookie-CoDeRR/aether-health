"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Hospital } from "@/types/hospital";

interface HospitalMapCanvasProps {
  userLocation: { lat: number; lng: number };
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onExploreDoctors: (hospital: Hospital) => void;
}

// Stable Map center updater
function MapRecenter({
  center,
}: {
  center: { lat: number; lng: number };
}) {
  const map = useMap();
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!prevCenterRef.current) {
      prevCenterRef.current = center;
      map.setView([center.lat, center.lng], map.getZoom());
      return;
    }

    const dist = Math.hypot(
      center.lat - prevCenterRef.current.lat,
      center.lng - prevCenterRef.current.lng
    );

    // Only flyTo if center has meaningfully changed
    if (dist > 0.0005) {
      prevCenterRef.current = center;
      map.flyTo([center.lat, center.lng], map.getZoom(), {
        duration: 0.8,
        easeLinearity: 0.5,
      });
    }
  }, [center.lat, center.lng, map]);

  return null;
}

// Invalidate size on resize for seamless mobile rendering
function MapAutoResize() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [map]);
  return null;
}

// Map Click-to-Zoom Controller
function MapInteractionController({
  isInteractive,
  setIsInteractive,
}: {
  isInteractive: boolean;
  setIsInteractive: (val: boolean) => void;
}) {
  const map = useMapEvents({
    click() {
      setIsInteractive(true);
      map.scrollWheelZoom.enable();
    },
  });

  useEffect(() => {
    if (isInteractive) {
      map.scrollWheelZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
    }
  }, [isInteractive, map]);

  return null;
}

// Custom Leaflet DivIcon Generators matching strict Deep Forest Green aesthetic
function createUserIcon() {
  if (typeof window === "undefined" || !L || !L.divIcon) return undefined as any;
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full bg-[#064E3B] opacity-30 animate-ping"></span>
        <span class="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#064E3B] text-white shadow-lg border-2 border-white font-bold text-xs">
          📍
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function createHospitalIcon(isEmergency: boolean, isSelected: boolean) {
  if (typeof window === "undefined" || !L || !L.divIcon) return undefined as any;
  const bgClass = "bg-[#064E3B]";
  const borderClass = isSelected
    ? "border-3 border-white scale-125 shadow-2xl ring-4 ring-[#064E3B]/30"
    : "border-2 border-white";

  return L.divIcon({
    className: "custom-hospital-pin",
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full ${bgClass} ${borderClass} text-white shadow-md transition-all duration-200 cursor-pointer">
        <span class="text-xs font-bold">${isEmergency ? "🚨" : "🏥"}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

export default function HospitalMapCanvas({
  userLocation,
  hospitals,
  selectedHospital,
  onSelectHospital,
  onExploreDoctors,
}: HospitalMapCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [isMapZoomActive, setIsMapZoomActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full min-h-[420px] w-full rounded-3xl border border-[#064E3B]/20 bg-white flex items-center justify-center p-6 text-center text-xs text-[#064E3B] shadow-sm">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#064E3B] border-t-transparent"></div>
          <span>Loading Interactive Health Map...</span>
        </div>
      </div>
    );
  }

  const mapCenter = selectedHospital
    ? { lat: selectedHospital.lat, lng: selectedHospital.lng }
    : userLocation;

  return (
    <div
      onMouseLeave={() => setIsMapZoomActive(false)}
      className="relative h-full min-h-[420px] w-full rounded-3xl border border-[#064E3B]/20 bg-white overflow-hidden shadow-sm group"
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight: "420px", zIndex: 1 }}
      >
        <MapRecenter center={mapCenter} />
        <MapAutoResize />
        <MapInteractionController
          isInteractive={isMapZoomActive}
          setIsInteractive={setIsMapZoomActive}
        />

        {/* Soft pastel map tiles via CartoDB Voyager */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
          <Popup className="aether-map-popup">
            <div className="p-1.5 text-xs font-sans text-[#064E3B]">
              <strong className="block font-bold">Your Current Location</strong>
              <span className="text-[#064E3B]/70 text-[11px]">
                Search origin point
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Hospital Markers */}
        {hospitals.map((hosp) => {
          const isSelected = selectedHospital?.id === hosp.id;
          return (
            <Marker
              key={hosp.id}
              position={[hosp.lat, hosp.lng]}
              icon={createHospitalIcon(hosp.isEmergency, isSelected)}
              eventHandlers={{
                click: () => onSelectHospital(hosp),
              }}
            >
              <Popup className="aether-map-popup">
                <div className="p-2 space-y-2 min-w-[220px] text-xs font-sans text-[#064E3B]">
                  <div>
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1 bg-[#F9FBF9] border border-[#064E3B]/20 text-[#064E3B]">
                      {hosp.isEmergency ? "🚨 24/7 Emergency ICU" : "🏥 Clinic / Hospital"}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#064E3B] leading-tight">
                      {hosp.name}
                    </h4>
                    <p className="text-[11px] text-[#064E3B]/70 leading-snug mt-0.5">{hosp.address}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#064E3B] font-bold pt-1 border-t border-[#064E3B]/10">
                    <span>📍 {hosp.distanceKm ?? 0} km away</span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => onExploreDoctors(hosp)}
                      className="w-full rounded-xl bg-[#064E3B] hover:bg-[#043327] text-white py-2 px-3 text-xs font-bold transition-colors shadow-xs"
                    >
                      View On-Duty Doctors →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Interactive Zoom Status Indicator */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div className="rounded-full bg-white/95 border border-[#064E3B]/20 px-3 py-1 text-[10.5px] font-bold text-[#064E3B] shadow-sm backdrop-blur-xs flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isMapZoomActive ? "bg-[#064E3B] animate-pulse" : "bg-[#064E3B]/30"}`} />
          <span>{isMapZoomActive ? "Map zoom enabled" : "Click map to zoom"}</span>
        </div>
      </div>
    </div>
  );
}
