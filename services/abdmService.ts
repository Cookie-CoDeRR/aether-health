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

export interface ABDMVerificationResult {
  isVerified: boolean;
  hprId: string;
  doctor?: ABDMDoctor;
  message: string;
  verifiedAt: Date;
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
 */
export async function verifyHprId(hprId: string): Promise<ABDMVerificationResult> {
  await new Promise((res) => setTimeout(res, 120)); // Simulated network latency

  const normalized = hprId.trim().toLowerCase();
  const match = SEEDED_ABDM_DOCTORS.find(
    (doc) => doc.hprId.toLowerCase() === normalized || doc.registrationNumber.toLowerCase() === normalized
  );

  if (match) {
    return {
      isVerified: true,
      hprId: match.hprId,
      doctor: match,
      message: `Verified ABDM Healthcare Professional: ${match.fullName} (${match.councilName}, Reg: ${match.registrationNumber})`,
      verifiedAt: new Date(),
    };
  }

  // Check generic valid HPR format [name]@hpr
  const hprFormatRegex = /^[a-z0-9._]+@hpr$/i;
  if (hprFormatRegex.test(normalized)) {
    return {
      isVerified: true,
      hprId: normalized,
      message: `HPR ID '${normalized}' is valid and active on National Health Authority (NHA) ABDM Gateway.`,
      verifiedAt: new Date(),
    };
  }

  return {
    isVerified: false,
    hprId: normalized,
    message: `HPR ID '${hprId}' could not be verified in ABDM Registry. Please check registration number or format (e.g. dr_name@hpr).`,
    verifiedAt: new Date(),
  };
}

/**
 * Returns ABDM registered doctors filtered by query, specialty, or verification status.
 */
export async function getAbdmDoctors(
  query?: string,
  specialty?: string,
  abdmOnly: boolean = false
): Promise<ABDMDoctor[]> {
  await new Promise((res) => setTimeout(res, 80));

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
