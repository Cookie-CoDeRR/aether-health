import { TimelineEntry, TimelineEntryType } from "@/types/timeline";
import { SymptomLog } from "@/types/symptomLog";
import { Report } from "@/types/report";
import { Appointment } from "@/types/appointment";
import { markRecordAsCured } from "./vectorHistoryService";

// In-memory persistent timeline entries store initialized with baseline data
let DYNAMIC_TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    id: "app_301",
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
 * Domain Service: Fetches and merges timeline entries sorted strictly by timestamp descending.
 */
export async function getHealthTimeline(userId: string): Promise<TimelineEntry[]> {
  await new Promise((res) => setTimeout(res, 50));
  return [...DYNAMIC_TIMELINE_ENTRIES].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Issues a new Certified Doctor Clearance Certificate entry into the timeline.
 */
export async function issueClearanceCertificate(params: {
  userId: string;
  title: string;
  subtitle: string;
  doctorName: string;
  certificateNote: string;
  relatedRecordId?: string;
}): Promise<TimelineEntry> {
  const newEntry: TimelineEntry = {
    id: `cert_${Date.now()}`,
    type: "cured_certificate",
    timestamp: new Date(),
    title: `📜 Clearance Certificate: ${params.title}`,
    subtitle: params.subtitle,
    badgeText: "Cured & Cleared",
    badgeVariant: "emerald",
    isCuredCleared: true,
    curedDoctorName: params.doctorName,
    curedCertificateNote: params.certificateNote,
    curedIssuedAt: new Date(),
    details: {
      issuedBy: params.doctorName,
      certificateNote: params.certificateNote,
    },
  };

  DYNAMIC_TIMELINE_ENTRIES.unshift(newEntry);

  // Sync with AI vector memory if related record exists
  if (params.relatedRecordId) {
    markRecordAsCured(params.relatedRecordId, params.certificateNote);
  } else {
    // Resolve matching vector baseline records
    markRecordAsCured("vec_mem_2", params.certificateNote);
  }

  return newEntry;
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
