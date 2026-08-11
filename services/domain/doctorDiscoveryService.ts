import { DiscoveryDoctor } from "@/types/discoveryDoctor";
import { SEED_DOCTORS } from "@/scripts/seed-discovery-db";

const DEFAULT_DOCTOR_PROFILES: DiscoveryDoctor[] = SEED_DOCTORS.map((doc, i) => ({
  id: `discovery_doc_${i + 1}`,
  hospitalName: doc.hospitalName,
  name: doc.name,
  specialty: doc.specialty,
  qualification: doc.qualification,
  experienceYears: doc.experienceYears,
  consultationFee: doc.consultationFee,
  availableSlots: doc.availableSlots,
  rating: 4.6 + (i % 4) * 0.1,
  photoUrl: [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594824813566-78a9c396860f?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
  ][i % 6],
}));

/**
 * Fetches on-duty doctors affiliated with a specified hospital place name/ID.
 * Filters by specialty if provided.
 */
export async function getDoctorsByHospital(
  hospitalName: string,
  specialtyFilter: string = "all"
): Promise<DiscoveryDoctor[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const normalizedHosp = hospitalName.toLowerCase();
  
  // Exact or fuzzy match on hospital name
  let matched = DEFAULT_DOCTOR_PROFILES.filter(
    (doc) =>
      doc.hospitalName.toLowerCase().includes(normalizedHosp) ||
      normalizedHosp.includes(doc.hospitalName.toLowerCase())
  );

  // If no exact match for OSM dynamic hospital name, return sample doctors assigned to this facility name
  if (matched.length === 0) {
    matched = DEFAULT_DOCTOR_PROFILES.map((doc, idx) => ({
      ...doc,
      id: `dynamic_doc_${idx}_${hospitalName.substring(0, 5)}`,
      hospitalName: hospitalName,
    }));
  }

  if (specialtyFilter !== "all") {
    matched = matched.filter(
      (doc) => doc.specialty.toLowerCase() === specialtyFilter.toLowerCase()
    );
  }

  return matched;
}

export const SPECIALTY_OPTIONS = [
  "all",
  "Cardiology",
  "Neurology",
  "General Physician",
  "Pediatrics",
  "Orthopedics",
];
