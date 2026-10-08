import { Hospital, EmergencyCapability } from "@/types/hospital";
import { calculateDistanceKm } from "@/lib/geoUtils";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

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

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      return {
        hospitals: [],
        status: "unavailable",
        error: `Overpass API response error: ${response.statusText}`,
      };
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
    return {
      hospitals: [],
      status: "unavailable",
      error: error?.message || "Overpass query failed or timed out",
    };
  }
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
