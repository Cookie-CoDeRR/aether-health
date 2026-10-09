import { Hospital, EmergencyCapability } from "@/types/hospital";
import { calculateDistanceKm } from "@/lib/geoUtils";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface OverpassQueryResult {
  hospitals: Hospital[];
  status: "ok" | "empty" | "unavailable";
  error?: string;
}

/**
 * Queries OpenStreetMap Overpass API for real hospitals and clinics.
 * On failure or empty result, returns an empty list without inventing fake hospitals.
 */
export async function fetchNearbyHospitals(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<Hospital[]> {
  const result = await fetchNearbyHospitalsWithStatus(lat, lng, radiusMeters);
  
  // If 0 hospitals found in small radius, auto-retry with expanded 12km radius
  if (result.hospitals.length === 0 && radiusMeters < 12000) {
    const expandedResult = await fetchNearbyHospitalsWithStatus(lat, lng, 12000);
    return expandedResult.hospitals;
  }
  
  return result.hospitals;
}

/**
 * Queries OpenStreetMap Overpass API and returns both mapped hospitals and exact query status.
 */
export async function fetchNearbyHospitalsWithStatus(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<OverpassQueryResult> {
  const overpassQuery = `[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${lat},${lng});
  way["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${lat},${lng});
  relation["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${lat},${lng});
);
out center body;`;

  let lastError: string | undefined;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        lastError = `Overpass endpoint ${endpoint} status: ${response.statusText}`;
        continue;
      }

      const data: OverpassResponse = await response.json();
      const parsedHospitals = mapOverpassElementsToHospitals(data.elements || [], lat, lng);

      if (parsedHospitals.length === 0) {
        return {
          hospitals: [],
          status: "empty",
        };
      }

      const sorted = parsedHospitals.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      return {
        hospitals: sorted,
        status: "ok",
      };
    } catch (error: any) {
      lastError = error?.message || "Overpass query failed or timed out";
    }
  }

  return {
    hospitals: [],
    status: "unavailable",
    error: lastError || "All Overpass API mirrors failed to respond",
  };
}

export function mapOverpassElementsToHospitals(
  elements: OverpassElement[],
  userLat: number,
  userLng: number
): Hospital[] {
  const hospitals: Hospital[] = [];

  elements.forEach((elem) => {
    const tags = elem.tags || {};
    const itemLat = elem.lat ?? elem.center?.lat;
    const itemLng = elem.lon ?? elem.center?.lon;

    if (!itemLat || !itemLng) return;

    const name =
      tags.name ||
      tags["name:en"] ||
      tags.operator ||
      (tags.amenity === "hospital"
        ? "Hospital"
        : tags.amenity === "clinic"
        ? "Clinic"
        : "Medical Center");

    const address = buildAddressString(tags);
    const amenity = (tags.amenity as Hospital["type"]) || "hospital";

    // Emergency capability is strictly determined by source OSM tagging
    let emergencyCapability: EmergencyCapability = "unconfirmed";
    let isEmergency = false;

    if (tags.emergency === "yes") {
      emergencyCapability = "confirmed";
      isEmergency = true;
    } else if (tags.emergency === "no") {
      emergencyCapability = "unavailable";
      isEmergency = false;
    } else {
      emergencyCapability = "unconfirmed";
      isEmergency = false;
    }

    const distanceKm = calculateDistanceKm(userLat, userLng, itemLat, itemLng);

    // Only use phone number if present in OpenStreetMap source tags. Never use placeholder phones.
    const phone = tags.phone || tags["contact:phone"] || undefined;

    hospitals.push({
      id: `osm_${elem.type}_${elem.id}`,
      osmId: `${elem.type}/${elem.id}`,
      name,
      lat: itemLat,
      lng: itemLng,
      address,
      phone,
      type: amenity,
      isEmergency,
      emergencyCapability,
      distanceKm,
    });
  });

  return hospitals;
}

function buildAddressString(tags: Record<string, string>): string {
  const parts: string[] = [];

  if (tags["addr:housenumber"]) parts.push(`#${tags["addr:housenumber"]}`);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:suburb"] || tags["addr:district"]) parts.push(tags["addr:suburb"] || tags["addr:district"]);
  if (tags["addr:city"] || tags["addr:town"]) parts.push(tags["addr:city"] || tags["addr:town"]);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return tags["addr:full"] || "";
}
