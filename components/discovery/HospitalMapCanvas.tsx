"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Hospital } from "@/types/hospital";

interface HospitalMapCanvasProps {
  userLocation: { lat: number; lng: number };
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onExploreDoctors: (hospital: Hospital) => void;
}

// Map center updates helper
function MapRecenter({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1 });
  }, [center.lat, center.lng, map]);
  return null;
}

// Custom Leaflet DivIcon Generators matching dark monitor aesthetic
function createUserIcon() {
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-40 animate-ping"></span>
        <span class="relative flex items-center justify-center w-5 h-5 rounded-full bg-[#00F0FF] text-[#0A1620] shadow-lg border-2 border-[#0A1620] font-bold text-[10px]">
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
  const bgClass = isEmergency ? "bg-[#E8674A]" : "bg-[#4F9D8C]";
  const borderClass = isSelected ? "border-2 border-white scale-125 shadow-xl z-50" : "border border-[#0A1620]";

  return L.divIcon({
    className: "custom-hospital-pin",
    html: `
      <div class="flex items-center justify-center w-7 h-7 rounded-full ${bgClass} ${borderClass} text-white shadow-md transition-all duration-200 cursor-pointer">
        <span class="text-xs font-bold">${isEmergency ? "🚑" : "🏥"}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full min-h-[420px] w-full rounded-2xl border border-[rgba(246,241,233,0.09)] bg-[#0F2130] flex items-center justify-center p-6 text-center text-xs font-mono text-[#7C8A93]">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E8674A] border-t-transparent"></div>
          <span>Initializing Leaflet Map Canvas...</span>
        </div>
      </div>
    );
  }

  const mapCenter = selectedHospital
    ? { lat: selectedHospital.lat, lng: selectedHospital.lng }
    : userLocation;

  return (
    <div className="relative h-full min-h-[420px] w-full rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] overflow-hidden shadow-2xl">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "420px", zIndex: 1 }}
      >
        <MapRecenter center={mapCenter} />

        {/* Dark map tiles via CartoDB / OSM */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User GPS Location Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
          <Popup className="aether-map-popup">
            <div className="p-1 text-xs font-sans">
              <strong className="block text-[#0A1620] font-semibold">Your Location</strong>
              <span className="text-gray-600 text-[11px] font-mono">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
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
                <div className="p-2 space-y-2 min-w-[200px] text-xs font-sans">
                  <div>
                    <span className="inline-block rounded bg-[#E8674A] text-[#0A1620] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase mb-1">
                      {hosp.isEmergency ? "24/7 ICU & Emergency" : hosp.type}
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#0A1620] leading-tight">
                      {hosp.name}
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-snug mt-0.5">{hosp.address}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-700 pt-1 border-t border-gray-200">
                    <span>📍 {hosp.distanceKm ?? 0} km away</span>
                  </div>

                  <div className="pt-1 flex gap-1.5">
                    <button
                      onClick={() => onExploreDoctors(hosp)}
                      className="w-full rounded-lg bg-[#0F2130] text-[#F6F1E9] py-1.5 px-2 font-mono text-[11px] font-medium hover:bg-[#132A38] transition-colors"
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
    </div>
  );
}
