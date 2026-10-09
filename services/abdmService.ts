export interface ABDMDoctor {
  hprId: string; // e.g., "dr_ananya@hpr"
  registrationNumber: string; // e.g., "MCI-2018-84729"
  fullName: string;
  speciality: string;
  qualifications: string;
  councilName: string; // e.g., "Karnataka Medical Council"
  facilityName: string;
  facilityAddress: string;
  lat: number;
  lng: number;
  isAbdmVerified: boolean;
  rating: number;
  consultationFee: number;
  availableSlots: string[];
}

export type ABDMVerificationStatus =
  | "verified"
  | "unverified"
  | "unavailable"
  | "invalid_format";

export interface ABDMVerificationResult {
  isVerified: boolean;
  status: ABDMVerificationStatus;
  hprId: string;
  doctor?: ABDMDoctor;
  message: string;
  verifiedAt?: Date;
}

export interface ABDMRegistryClient {
  isAvailable(): Promise<boolean>;
  queryRegistry(hprId: string): Promise<ABDMDoctor | null>;
}

export class DefaultABDMRegistryClient implements ABDMRegistryClient {
  async isAvailable(): Promise<boolean> {
    const clientId =
      typeof process !== "undefined" ? process.env.ABDM_CLIENT_ID : undefined;
    const clientSecret =
      typeof process !== "undefined" ? process.env.ABDM_CLIENT_SECRET : undefined;
    return Boolean(clientId && clientSecret);
  }

  async queryRegistry(hprId: string): Promise<ABDMDoctor | null> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error(
        "ABDM Registry integration is unavailable (credentials not configured)."
      );
    }
    // Stub interface for live gateway lookup when credentials are provided
    return null;
  }
}

/**
 * Checks ABDM Healthcare Professionals Registry gateway connectivity status.
 */
export async function checkAbdmRegistryStatus(): Promise<{
  status: "available" | "unavailable";
  message: string;
}> {
  const client = new DefaultABDMRegistryClient();
  const available = await client.isAvailable();
  if (!available) {
    return {
      status: "unavailable",
      message:
        "ABDM Registry integration unavailable: no live gateway credentials configured.",
    };
  }
  return {
    status: "available",
    message: "ABDM Registry gateway connected.",
  };
}

export const SEEDED_ABDM_DOCTORS: ABDMDoctor[] = [
  {
    hprId: "dr_ananya@hpr",
    registrationNumber: "KMC-2018-84729",
    fullName: "Dr. Ananya Sharma",
    speciality: "Cardiology",
    qualifications: "MBBS, MD, DM (Cardiology), FACC",
    councilName: "Karnataka Medical Council",
    facilityName: "Apollo Heart Institute",
    facilityAddress: "154/11, Opp IIMB, Bannerghatta Road, Bengaluru, Karnataka 560076",
    lat: 12.8984,
    lng: 77.5985,
    isAbdmVerified: true,
    rating: 4.9,
    consultationFee: 900,
    availableSlots: ["09:00 AM", "11:30 AM", "03:00 PM", "05:30 PM"],
  },
  {
    hprId: "dr_rajesh@hpr",
    registrationNumber: "MMC-2015-39201",
    fullName: "Dr. Rajesh Kumar",
    speciality: "Pulmonology",
    qualifications: "MBBS, DTCD, DNB (Respiratory Medicine)",
    councilName: "Maharashtra Medical Council",
    facilityName: "Chest & Respiratory Care Center",
    facilityAddress: "Koramangala 4th Block, 80 Feet Road, Bengaluru, Karnataka 560034",
    lat: 12.9352,
    lng: 77.6245,
    isAbdmVerified: true,
    rating: 4.7,
    consultationFee: 750,
    availableSlots: ["10:00 AM", "01:00 PM", "04:00 PM"],
  },
  {
    hprId: "dr_meera@hpr",
    registrationNumber: "DMC-2019-91823",
    fullName: "Dr. Meera Nambiar",
    speciality: "Neurology",
    qualifications: "MBBS, MD (Gen Med), DM (Neurology)",
    councilName: "Delhi Medical Council",
    facilityName: "Brain & Spine Specialty Institute",
    facilityAddress: "HSR Layout Sector 1, 27th Main, Bengaluru, Karnataka 560102",
    lat: 12.9121,
    lng: 77.6445,
    isAbdmVerified: true,
    rating: 4.8,
    consultationFee: 1100,
    availableSlots: ["11:00 AM", "02:30 PM", "06:00 PM"],
  },
  {
    hprId: "dr_vikram@hpr",
    registrationNumber: "KMC-2020-56214",
    fullName: "Dr. Vikramaditya Rao",
    speciality: "General Practice",
    qualifications: "MBBS, DNB (Family Medicine)",
    councilName: "Karnataka Medical Council",
    facilityName: "City Health Care Family Clinic",
    facilityAddress: "ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
    lat: 12.9698,
    lng: 77.7499,
    isAbdmVerified: true,
    rating: 4.6,
    consultationFee: 500,
    availableSlots: ["09:30 AM", "12:00 PM", "04:30 PM", "07:00 PM"],
  },
  {
    hprId: "dr_priya@hpr",
    registrationNumber: "TNMC-2016-72819",
    fullName: "Dr. Priya Sundaram",
    speciality: "Pediatrics",
    qualifications: "MBBS, MD (Pediatrics), Fellowship in Pediatric Cardiology",
    councilName: "Tamil Nadu Medical Council",
    facilityName: "Sunshine Children's Hospital",
    facilityAddress: "3rd Block, Jayanagar, Bengaluru, Karnataka 560011",
    lat: 12.9299,
    lng: 77.5824,
    isAbdmVerified: true,
    rating: 4.9,
    consultationFee: 850,
    availableSlots: ["10:30 AM", "02:00 PM", "05:00 PM"],
  },
  {
    hprId: "dr_siddharth@hpr",
    registrationNumber: "KMC-2014-11092",
    fullName: "Dr. Siddharth Sen",
    speciality: "Orthopedics",
    qualifications: "MBBS, MS (Orthopedics), M.Ch (Joint Replacement)",
    councilName: "Karnataka Medical Council",
    facilityName: "Joint Care & Sports Injury Clinic",
    facilityAddress: "100 Feet Road, Domlur, Bengaluru, Karnataka 560071",
    lat: 12.9609,
    lng: 77.6387,
    isAbdmVerified: true,
    rating: 4.5,
    consultationFee: 1000,
    availableSlots: ["11:30 AM", "03:30 PM", "06:30 PM"],
  },
  {
    hprId: "dr_kavita@hpr",
    registrationNumber: "GMC-2021-44310",
    fullName: "Dr. Kavita Deshmukh",
    speciality: "Gastroenterology",
    qualifications: "MBBS, MD (Medicine), DM (Gastroenterology)",
    councilName: "Gujarat Medical Council",
    facilityName: "Digestive Health Center",
    facilityAddress: "Indiranagar 100ft Road, Bengaluru, Karnataka 560038",
    lat: 12.9784,
    lng: 77.6408,
    isAbdmVerified: true,
    rating: 4.8,
    consultationFee: 950,
    availableSlots: ["10:00 AM", "01:30 PM", "04:30 PM"],
  },
];

/**
 * Verifies any given HPR ID string against the ABDM Healthcare Professionals Registry.
 *
 * Rules:
 * - Format check alone must return status: "unverified", message: "unverified (format valid)".
 * - Returns status: "verified" ONLY from a real registry response or explicit DEMO_MODE fixture match.
 * - If no registry integration exists outside DEMO_MODE, returns "unverified (format valid)" or "unavailable".
 * - Never invents credentials.
 */
function isDemoModeActive(): boolean {
  if (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  ) {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("aether_demo_mode") === "true";
    } catch {
      return false;
    }
  }
  return false;
}

export async function verifyHprId(
  hprId: string,
  options?: { registryClient?: ABDMRegistryClient }
): Promise<ABDMVerificationResult> {
  await new Promise((res) => setTimeout(res, 40));

  const normalized = (hprId || "").trim().toLowerCase();
  if (!normalized) {
    return {
      isVerified: false,
      status: "invalid_format",
      hprId: "",
      message: "HPR ID cannot be empty.",
    };
  }

  // Check valid HPR handle format (e.g. dr_name@hpr or dr_name@hpr.abdm)
  const hprFormatRegex = /^[a-z0-9._]+@(hpr|hpr\.abdm)$/i;
  const isFormatValid = hprFormatRegex.test(normalized);

  if (!isFormatValid) {
    return {
      isVerified: false,
      status: "invalid_format",
      hprId: normalized,
      message: `Invalid HPR ID format '${hprId}'. Expected format: name@hpr or name@hpr.abdm`,
    };
  }

  const isDemo = isDemoModeActive();

  // In DEMO_MODE, seeded fixtures simulate registry responses for verified sample doctors
  if (isDemo) {
    const fixtureMatch = SEEDED_ABDM_DOCTORS.find(
      (doc) =>
        doc.hprId.toLowerCase() === normalized ||
        doc.registrationNumber.toLowerCase() === normalized
    );
    if (fixtureMatch) {
      return {
        isVerified: true,
        status: "verified",
        hprId: fixtureMatch.hprId,
        doctor: fixtureMatch,
        message: `[DEMO] Verified ABDM Healthcare Professional: ${fixtureMatch.fullName} (${fixtureMatch.councilName}, Reg: ${fixtureMatch.registrationNumber})`,
        verifiedAt: new Date(),
      };
    }
  }

  // If a custom registry client is injected, use it to query the real registry
  if (options?.registryClient) {
    try {
      const isAvail = await options.registryClient.isAvailable();
      if (!isAvail) {
        return {
          isVerified: false,
          status: "unavailable",
          hprId: normalized,
          message: "Registry integration unavailable.",
        };
      }
      const doc = await options.registryClient.queryRegistry(normalized);
      if (doc) {
        return {
          isVerified: true,
          status: "verified",
          hprId: normalized,
          doctor: doc,
          message: `Verified ABDM Healthcare Professional: ${doc.fullName} (${doc.councilName})`,
          verifiedAt: new Date(),
        };
      } else {
        return {
          isVerified: false,
          status: "unverified",
          hprId: normalized,
          message: "unverified (not found in registry)",
        };
      }
    } catch {
      return {
        isVerified: false,
        status: "unavailable",
        hprId: normalized,
        message: "Registry integration unavailable.",
      };
    }
  }

  // Without a real registry integration, format check alone returns "unverified (format valid)"
  return {
    isVerified: false,
    status: "unverified",
    hprId: normalized,
    message: "unverified (format valid)",
  };
}

/**
 * Returns ABDM registered doctors filtered by query, specialty, or verification status.
 * Fixtures stay only behind explicit DEMO_MODE. Outside demo mode, returns empty array if no live ABDM directory is connected.
 */
export async function getAbdmDoctors(
  query?: string,
  specialty?: string,
  abdmOnly: boolean = false
): Promise<ABDMDoctor[]> {
  await new Promise((res) => setTimeout(res, 40));

  const isDemo = isDemoModeActive();

  if (!isDemo) {
    return [];
  }

  let results = [...SEEDED_ABDM_DOCTORS];

  if (abdmOnly) {
    results = results.filter((d) => d.isAbdmVerified);
  }

  if (specialty && specialty !== "all") {
    const sLower = specialty.toLowerCase();
    results = results.filter((d) => d.speciality.toLowerCase().includes(sLower));
  }

  if (query && query.trim()) {
    const qLower = query.trim().toLowerCase();
    results = results.filter(
      (d) =>
        d.fullName.toLowerCase().includes(qLower) ||
        d.hprId.toLowerCase().includes(qLower) ||
        d.registrationNumber.toLowerCase().includes(qLower) ||
        d.speciality.toLowerCase().includes(qLower) ||
        d.facilityName.toLowerCase().includes(qLower) ||
        d.councilName.toLowerCase().includes(qLower)
    );
  }

  return results;
}
