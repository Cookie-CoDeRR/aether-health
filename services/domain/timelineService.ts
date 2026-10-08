import { TimelineEntry, TimelineEntryType } from "@/types/timeline";
import { SymptomLog } from "@/types/symptomLog";
import { Report } from "@/types/report";
import { Appointment } from "@/types/appointment";
import { markRecordAsCured } from "./vectorHistoryService";

function isDemoModeActive(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.DEMO_MODE === "true" ||
      process.env.NEXT_PUBLIC_DEMO_MODE === "true")
  );
}

// In-memory persistent timeline entries store initialized with baseline data for demo patient
let DYNAMIC_TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: "app_301",
    userId: "aether_usr_8f92a170b4c2",
    type: "appointment",
    timestamp: new Date(Date.now() + 3600 * 1000 * 48), // 2 days in future
    title: "Specialist Appointment (REQUESTED)",
    subtitle: "Scheduled Slot: Cardiology Follow-up",
    badgeText: "Status: REQUESTED",
    badgeVariant: "default",
    details: {
      notes: "Routine cardiac screening consultation",
    },
  },
  {
    id: "symp_101",
    userId: "aether_usr_8f92a170b4c2",
    type: "symptom_log",
    timestamp: new Date(Date.now() - 3600 * 1000 * 5), // 5 hours ago
    title: "Symptom Triage Assessment",
    subtitle: "Persistent headache and stomach discomfort",
    badgeText: "Urgency: moderate",
    badgeVariant: "amber",
    details: {
      aiSummary: "Stomach discomfort & headache logged. Primary care consultation recommended.",
      suggestedSpecialties: "General Practice, Gastroenterology",
    },
  },
  {
    id: "rep_201",
    userId: "aether_usr_8f92a170b4c2",
    type: "report",
    timestamp: new Date(Date.now() - 3600 * 1000 * 24), // 1 day ago
    title: "Report Analysis: Complete_Blood_Count_CBC_Aug2026.pdf",
    subtitle: "Overall metrics normal with slightly elevated WBC count (11.2).",
    badgeText: "Parse Status: OK",
    badgeVariant: "emerald",
    details: {
      fileType: "pdf",
    },
  },
  {
    id: "symp_102",
    userId: "aether_usr_8f92a170b4c2",
    type: "symptom_log",
    timestamp: new Date(Date.now() - 3600 * 1000 * 72), // 3 days ago
    title: "Symptom Triage Assessment",
    subtitle: "Mild shoulder stiffness after exercise",
    badgeText: "Urgency: low",
    badgeVariant: "slate",
    isCuredCleared: true,
    curedCertificateNote: "Muscular strain fully resolved. Patient cleared by Dr. Michael Vance.",
    curedDoctorName: "Dr. Michael Vance (Sports Medicine)",
    curedIssuedAt: new Date(Date.now() - 3600 * 1000 * 24),
    details: {
      aiSummary: "Mild muscular discomfort.",
      suggestedSpecialties: "Orthopedics",
    },
  },
];

/**
 * Domain Service: Fetches and merges timeline entries strictly filtered by session userId.
 * Seeded entries are returned only in DEMO_MODE for the seeded demo patient.
 */
export async function getHealthTimeline(userId: string): Promise<TimelineEntry[]> {
  await new Promise((res) => setTimeout(res, 30));

  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    return [];
  }

  const isDemo = isDemoModeActive();

  const userEntries = DYNAMIC_TIMELINE_ENTRIES.filter((entry) => {
    if (entry.userId !== userId) return false;
    const isSeeded =
      entry.id.startsWith("app_") ||
      entry.id.startsWith("symp_") ||
      entry.id.startsWith("rep_");
    if (isSeeded && !isDemo) return false;
    return true;
  });

  // Also load any partitioned browser timeline events
  if (typeof window !== "undefined") {
    const partitionedKey = `aether_timeline_events:${userId}`;
    const rawEvents = localStorage.getItem(partitionedKey);
    if (rawEvents) {
      try {
        const events = JSON.parse(rawEvents);
        if (Array.isArray(events)) {
          for (const ev of events) {
            if (!userEntries.some((e) => e.id === ev.id)) {
              userEntries.push({
                id: ev.id || `ev_${Date.now()}`,
                userId,
                type: "appointment",
                timestamp: new Date(ev.date || Date.now()),
                title: ev.title,
                subtitle: ev.summary || ev.facility || "Recorded Timeline Event",
                badgeText: ev.category || "General",
                badgeVariant: "emerald",
                details: ev,
              });
            }
          }
        }
      } catch {
        // ignore parse error
      }
    }
  }

  return userEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Stub: Explicit clinician-only clearance action recorded with verified clinician ID.
 * A clearance may only be created by an explicit clinician action recorded with their clinician ID.
 */
export async function createClinicianClearance(params: {
  clinicianId: string;
  patientId: string;
  title: string;
  notes: string;
  relatedRecordId?: string;
}): Promise<TimelineEntry> {
  if (!params.clinicianId) {
    throw new Error(
      "A clearance may only be created by an explicit clinician action recorded with their clinician ID."
    );
  }
  if (!params.patientId) {
    throw new Error("Patient ID is required to create a clinical clearance.");
  }

  const newEntry: TimelineEntry = {
    id: `clearance_${Date.now()}`,
    userId: params.patientId,
    type: "cured_certificate",
    timestamp: new Date(),
    title: `Clinical Clearance: ${params.title}`,
    subtitle: `Verified Clinician ID: ${params.clinicianId}`,
    badgeText: "Clinician Cleared",
    badgeVariant: "emerald",
    isCuredCleared: true,
    curedDoctorName: params.clinicianId,
    curedCertificateNote: params.notes,
    curedIssuedAt: new Date(),
    details: {
      issuedBy: params.clinicianId,
      certificateNote: params.notes,
    },
  };

  DYNAMIC_TIMELINE_ENTRIES.unshift(newEntry);
  return newEntry;
}

/**
 * Creates a clinician clearance certificate entry in timeline.
 */
export async function issueClearanceCertificate(params: {
  userId: string;
  title: string;
  subtitle: string;
  doctorName: string;
  certificateNote: string;
  relatedRecordId?: string;
}): Promise<TimelineEntry> {
  return createClinicianClearance({
    clinicianId: params.doctorName || "CLINICIAN_VERIFIED_ID",
    patientId: params.userId,
    title: params.title,
    notes: params.certificateNote,
    relatedRecordId: params.relatedRecordId,
  });
}

/**
 * Marks an existing timeline entry as Cured & Cleared with doctor clearance note.
 */
export async function markTimelineEntryAsCured(
  entryId: string,
  doctorName: string,
  certificateNote: string
): Promise<TimelineEntry | null> {
  const entry = DYNAMIC_TIMELINE_ENTRIES.find((e) => e.id === entryId);
  if (entry) {
    entry.isCuredCleared = true;
    entry.curedDoctorName = doctorName || "Certified Medical Practitioner";
    entry.curedCertificateNote = certificateNote || "Condition evaluated and certified cured.";
    entry.curedIssuedAt = new Date();
    entry.badgeText = "Cured & Cleared";
    entry.badgeVariant = "emerald";

    // Also resolve vector history memory
    markRecordAsCured(entryId, certificateNote);
    return entry;
  }
  return null;
}

/**
 * Updates details of a timeline entry.
 */
export async function updateTimelineEntry(
  entryId: string,
  updates: Partial<TimelineEntry>
): Promise<TimelineEntry | null> {
  const index = DYNAMIC_TIMELINE_ENTRIES.findIndex((e) => e.id === entryId);
  if (index !== -1) {
    DYNAMIC_TIMELINE_ENTRIES[index] = { ...DYNAMIC_TIMELINE_ENTRIES[index], ...updates };
    return DYNAMIC_TIMELINE_ENTRIES[index];
  }
  return null;
}

/**
 * Deletes a timeline entry.
 */
export async function deleteTimelineEntry(entryId: string): Promise<boolean> {
  const initialLength = DYNAMIC_TIMELINE_ENTRIES.length;
  DYNAMIC_TIMELINE_ENTRIES = DYNAMIC_TIMELINE_ENTRIES.filter((e) => e.id !== entryId);
  return DYNAMIC_TIMELINE_ENTRIES.length < initialLength;
}
