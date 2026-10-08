import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

export type UserRole = "patient" | "doctor";

export interface DoctorCertificate {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  verified: boolean;
  fileUrl?: string;
}

export interface DoctorProfile {
  doctorId: string;
  name: string;
  salutation: string;
  email: string;
  registrationNumber: string; // e.g. NMC-IND-88492
  medicalCouncil: string; // e.g. National Medical Commission / Karnataka Medical Council
  hospitalAffiliation: string; // e.g. Apollo Specialty Hospital
  specialization: string; // e.g. Cardiology & Internal Medicine
  qualifications: string; // e.g. MBBS, MD (Medicine), DM (Cardio)
  college: string; // e.g. AIIMS New Delhi
  bio: string;
  avatarUrl?: string;
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 148
  experienceYears: number;
  clinicAddress: string;
  consultingHours: string;
  isVerified: boolean;
  verificationDate: string;
  certificates: DoctorCertificate[];
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGmailAuthenticated: boolean;
  role?: UserRole;
  doctorProfile?: DoctorProfile;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Verified Doctor Presets for instant clinical login and testing
export const VERIFIED_DOCTORS_REGISTRY: DoctorProfile[] = [
  {
    doctorId: "doc_anya_sharma",
    name: "Dr. Anya Sharma",
    salutation: "Dr.",
    email: "dr.anya.sharma@apollohospitals.com",
    registrationNumber: "NMC-IND-94821",
    medicalCouncil: "National Medical Commission (NMC)",
    hospitalAffiliation: "Apollo Specialty Hospital",
    specialization: "Cardiology & Internal Medicine",
    qualifications: "MBBS, MD (General Medicine), DM (Cardiology)",
    college: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    bio: "Senior Consultant Cardiologist specializing in preventive cardiology, hypertensive management, and clinical telemetry care.",
    avatarUrl: "/avatars/doctor-anya.jpg",
    rating: 4.9,
    reviewCount: 184,
    experienceYears: 12,
    clinicAddress: "Apollo Hospitals Cardiac Wing, Suite 402, Bangalore",
    consultingHours: "Mon-Sat: 09:00 AM - 04:00 PM",
    isVerified: true,
    verificationDate: "Valid through 2029",
    certificates: [
      {
        id: "cert-1",
        name: "National Medical Commission Registration Certificate",
        issuer: "NMC India",
        issuedDate: "2018",
        verified: true,
      },
      {
        id: "cert-2",
        name: "Doctor of Medicine (DM) Cardiology Fellowship",
        issuer: "AIIMS New Delhi",
        issuedDate: "2015",
        verified: true,
      },
    ],
  },
  {
    doctorId: "doc_vikram_malhotra",
    name: "Dr. Vikram Malhotra",
    salutation: "Dr.",
    email: "vikram.malhotra@fortishealthcare.com",
    registrationNumber: "MCI-DL-48190",
    medicalCouncil: "Delhi Medical Council (DMC)",
    hospitalAffiliation: "Fortis Healthcare & Research",
    specialization: "Emergency & Critical Care Medicine",
    qualifications: "MBBS, MD (Emergency Medicine), FEM",
    college: "Christian Medical College (CMC), Vellore",
    bio: "Chief of Emergency and Acute Care Triage with 9+ years managing high-critical cardiovascular emergencies and trauma care.",
    rating: 4.8,
    reviewCount: 136,
    experienceYears: 9,
    clinicAddress: "Fortis Hospital Emergency Center, Sector B, New Delhi",
    consultingHours: "24/7 Clinical Emergency On-Call",
    isVerified: true,
    verificationDate: "Valid through 2030",
    certificates: [
      {
        id: "cert-3",
        name: "Delhi Medical Council Verified License",
        issuer: "DMC",
        issuedDate: "2017",
        verified: true,
      },
    ],
  },
  {
    doctorId: "doc_priya_deshmukh",
    name: "Dr. Priya Deshmukh",
    salutation: "Dr.",
    email: "priya.deshmukh@aiims.edu",
    registrationNumber: "AIIMS-DL-11029",
    medicalCouncil: "Medical Council of India (MCI)",
    hospitalAffiliation: "AIIMS New Delhi",
    specialization: "Pulmonology & Respiratory Care",
    qualifications: "MBBS, MD (Pulmonary Medicine)",
    college: "King Edward Memorial (KEM) Hospital, Mumbai",
    bio: "Leading pulmonologist focused on bronchial asthma, post-viral respiratory inflammation, and sovereign EHR care pathways.",
    rating: 4.95,
    reviewCount: 210,
    experienceYears: 15,
    clinicAddress: "AIIMS Pulmonary OPD, Room 108, New Delhi",
    consultingHours: "Tue, Thu, Sat: 10:00 AM - 02:00 PM",
    isVerified: true,
    verificationDate: "Valid through 2028",
    certificates: [
      {
        id: "cert-4",
        name: "MCI Specialist Certification",
        issuer: "MCI",
        issuedDate: "2011",
        verified: true,
      },
    ],
  },
];

/**
 * Patient Telemetry Access PIN Management (ABDM Patient Consent Gate)
 */
export const DEFAULT_PATIENT_PIN = "4892";

export function getPatientConsentPin(): string {
  if (typeof window === "undefined") return DEFAULT_PATIENT_PIN;
  return localStorage.getItem("aether_patient_consent_pin") || DEFAULT_PATIENT_PIN;
}

export function setPatientConsentPin(newPin: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("aether_patient_consent_pin", newPin);
    window.dispatchEvent(new CustomEvent("aether-patient-pin-updated", { detail: { pin: newPin } }));
  }
}

export function verifyPatientConsentPin(inputPin: string): boolean {
  const actualPin = getPatientConsentPin();
  return inputPin.trim() === actualPin.trim();
}

export function isDemoModeActive(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  );
}

export const isDemoMode =
  typeof process !== "undefined" &&
  (process.env.DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true");

/**
 * Retrieves list of verified doctor presets. Fixtures stay only behind explicit DEMO_MODE.
 */
export function getVerifiedDoctors(): DoctorProfile[] {
  if (!isDemoModeActive()) {
    return [];
  }
  return VERIFIED_DOCTORS_REGISTRY;
}

/**
 * Initiates Gmail / Google OAuth popup login flow via Firebase Auth for Patients.
 * A failed check is a failed sign-in — never creates fallback "Google Verified" patient.
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "AETHER Patient",
      photoURL: user.photoURL,
      isGmailAuthenticated: true,
      role: "patient",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("aether_auth_active", "true");
      localStorage.setItem("aether_user_role", "patient");
      localStorage.setItem("aether_user_profile", JSON.stringify(profile));
      localStorage.setItem("aether_user_name", profile.displayName || "Patient");
    }

    return profile;
  } catch (error: any) {
    console.warn("Firebase Google Sign-In Error:", error);
    // Real identity: A failed check is a failed sign-in. Do not return fake fallback profile.
    throw new Error(
      error.message || "Failed to sign in with Google. Authentication failed."
    );
  }
}

export interface ServerVerificationResult {
  success: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

/**
 * Verifies doctor Firebase ID token against server / Firebase verification service.
 * Does not add secrets to repo; uses process.env or server route.
 */
export async function verifyDoctorServerIdentity(
  idToken: string
): Promise<ServerVerificationResult> {
  if (!idToken || typeof idToken !== "string" || idToken.trim().length === 0) {
    return {
      success: false,
      error: "Missing or invalid Firebase ID token.",
    };
  }

  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/auth/verify-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: data.error || `Server verification returned status ${response.status}`,
        };
      }
      const data = await response.json();
      return {
        success: true,
        uid: data.uid,
        email: data.email,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to reach server verification endpoint.",
      };
    }
  }

  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Server Firebase configuration missing (API key not set).",
    };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData?.error?.message || "Invalid or expired Firebase ID token.",
      };
    }
    const data = await res.json();
    const user = data.users?.[0];
    if (!user) {
      return {
        success: false,
        error: "User identity not found in token.",
      };
    }
    return {
      success: true,
      uid: user.localId,
      email: user.email,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Server verification error.",
    };
  }
}

/**
 * Authenticates a Doctor.
 * Outside explicit DEMO_MODE, doctor sign-in must fail unless a server-verified identity exists.
 * Typed doctor credentials alone never yield isVerified=true.
 */
export async function signInAsDoctor(details: {
  name: string;
  email: string;
  registrationNumber: string;
  hospitalAffiliation: string;
  specialization: string;
  qualifications?: string;
  college?: string;
  bio?: string;
  idToken?: string;
}): Promise<UserProfile> {
  const currentDemo =
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true");

  // Outside DEMO_MODE: Doctor sign-in must fail unless a server-verified identity exists
  if (!currentDemo) {
    if (!details.idToken) {
      throw new Error(
        "Doctor sign-in failed: Server-verified identity (Firebase verifyIdToken) is required outside DEMO_MODE."
      );
    }
    const verification = await verifyDoctorServerIdentity(details.idToken);
    if (!verification.success) {
      throw new Error(
        `Doctor sign-in failed: ${verification.error || "Server identity verification failed."}`
      );
    }
  }

  // In DEMO_MODE: Check if credentials match a predefined verified fixture preset
  const isPreset = currentDemo
    ? VERIFIED_DOCTORS_REGISTRY.find(
        (d) =>
          d.registrationNumber.toLowerCase() ===
            details.registrationNumber.toLowerCase() ||
          d.email.toLowerCase() === details.email.toLowerCase()
      )
    : undefined;

  // A typed doctor name / new details NEVER yield isVerified: true automatically.
  const docProfile: DoctorProfile = isPreset
    ? { ...isPreset, ...details, isVerified: true }
    : {
        doctorId: `doc_${Date.now()}`,
        name: details.name.startsWith("Dr.") ? details.name : `Dr. ${details.name}`,
        salutation: "Dr.",
        email: details.email,
        registrationNumber: details.registrationNumber.toUpperCase(),
        medicalCouncil: "National Medical Commission (Unverified)",
        hospitalAffiliation:
          details.hospitalAffiliation || "Hospital Affiliation Pending",
        specialization: details.specialization || "General Practice",
        qualifications: details.qualifications || "MBBS",
        college: details.college || "Medical College",
        bio: details.bio || "Clinician on Aether Telemetry Platform.",
        rating: 0,
        reviewCount: 0,
        experienceYears: 0,
        clinicAddress: "Consultation Suite",
        consultingHours: "By Appointment",
        isVerified: false, // Typed doctor name NEVER yields verified
        verificationDate: "Pending Verification",
        certificates: [
          {
            id: `cert-${Date.now()}`,
            name: `Registration Certificate (${details.registrationNumber})`,
            issuer: "Medical Council",
            issuedDate: "Pending",
            verified: false,
          },
        ],
      };

  const userProfile: UserProfile = {
    uid: `doctor_${docProfile.doctorId}`,
    email: docProfile.email,
    displayName: docProfile.name,
    photoURL: docProfile.avatarUrl || null,
    isGmailAuthenticated: false,
    role: "doctor",
    doctorProfile: docProfile,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("aether_auth_active", "true");
    localStorage.setItem("aether_user_role", "doctor");
    localStorage.setItem("aether_user_profile", JSON.stringify(userProfile));
    localStorage.setItem("aether_doctor_profile", JSON.stringify(docProfile));
    localStorage.setItem("aether_user_name", docProfile.name);
    localStorage.setItem("aether_user_email", docProfile.email);
  }

  return userProfile;
}

/**
 * Returns active user role ("patient" | "doctor").
 */
export function getActiveUserRole(): UserRole {
  if (typeof window === "undefined") return "patient";
  return (localStorage.getItem("aether_user_role") as UserRole) || "patient";
}

/**
 * Retrieves the currently signed in doctor's profile.
 * Outside DEMO_MODE, returns null if no session profile exists.
 */
export function getActiveDoctorProfile(): DoctorProfile | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("aether_doctor_profile");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore parse error
      }
    }
  }
  return isDemoModeActive() ? VERIFIED_DOCTORS_REGISTRY[0] : null;
}

/**
 * Updates doctor's profile with college, certificates, photos, bio.
 */
export function updateDoctorProfile(
  updated: Partial<DoctorProfile>
): DoctorProfile | null {
  const current = getActiveDoctorProfile();
  if (!current) {
    if (!isDemoModeActive()) return null;
  }
  const base = current || VERIFIED_DOCTORS_REGISTRY[0];
  const merged: DoctorProfile = { ...base, ...updated };
  if (typeof window !== "undefined") {
    localStorage.setItem("aether_doctor_profile", JSON.stringify(merged));
    localStorage.setItem("aether_user_name", merged.name);
    window.dispatchEvent(
      new CustomEvent("aether-doctor-profile-updated", {
        detail: { profile: merged },
      })
    );
  }
  return merged;
}

/**
 * Signs out current user from Firebase Auth and local session.
 */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    if (typeof window !== "undefined") {
      localStorage.removeItem("aether_auth_active");
      localStorage.removeItem("aether_user_role");
      localStorage.removeItem("aether_doctor_profile");
      localStorage.removeItem("aether_user_profile");
      localStorage.removeItem("aether_user_name");
      localStorage.removeItem("aether_user_email");
    }
  } catch (error: any) {
    console.error("Firebase Sign-Out Error:", error);
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function subscribeToAuthState(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "AETHER Patient",
        photoURL: user.photoURL,
        isGmailAuthenticated: true,
        role: (typeof window !== "undefined" && (localStorage.getItem("aether_user_role") as UserRole)) || "patient",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("aether_auth_active", "true");
        localStorage.setItem("aether_user_profile", JSON.stringify(profile));
      }
      callback(profile);
    } else {
      callback(null);
    }
  });
}
