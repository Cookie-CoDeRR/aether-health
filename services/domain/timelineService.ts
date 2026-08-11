import { TimelineEntry, TimelineEntryType } from "@/types/timeline";
import { SymptomLog } from "@/types/symptomLog";
import { Report } from "@/types/report";
import { Appointment } from "@/types/appointment";

// Mock data sources representing prior activity
const MOCK_SYMPTOM_LOGS: SymptomLog[] = [
  {
    id: "symp_101",
    userId: "demo-user-123",
    symptoms: "Persistent headache and fever for 2 days",
    urgencyLevel: "moderate",
    aiResponse: "Fever and headache logged. Stay hydrated and monitor temperature.",
    specialties: "Pulmonology, General Internal Medicine",
    createdAt: new Date(Date.now() - 3600 * 1000 * 5), // 5 hours ago
  },
  {
    id: "symp_102",
    userId: "demo-user-123",
    symptoms: "Mild shoulder stiffness after exercise",
    urgencyLevel: "low",
    aiResponse: "Mild muscular discomfort.",
    specialties: "Orthopedics",
    createdAt: new Date(Date.now() - 3600 * 1000 * 72), // 3 days ago
  },
];

const MOCK_REPORTS: Report[] = [
  {
    id: "rep_201",
    userId: "demo-user-123",
    fileName: "Complete_Blood_Count_CBC_Aug2026.pdf",
    fileUrl: "/reports/cbc.pdf",
    fileType: "pdf",
    parseStatus: "ok",
    parsedMetrics: JSON.stringify([
      { name: "Hemoglobin", value: 13.5, referenceRange: "12.0 - 15.5" },
      { name: "WBC Count", value: 11.2, referenceRange: "4.5 - 11.0" },
    ]),
    plainSummary: "Overall metrics normal with slightly elevated WBC.",
    rawOcrText: "WBC 11.2 x10^3/uL",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24),
  },
  {
    id: "rep_202",
    userId: "demo-user-123",
    fileName: "Thyroid_Panel_Report.pdf",
    fileUrl: "/reports/tsh.pdf",
    fileType: "pdf",
    parseStatus: "low_confidence",
    parsedMetrics: JSON.stringify([{ name: "TSH", value: 2.1, referenceRange: "0.4 - 4.0" }]),
    plainSummary: "TSH levels within normal reference range.",
    rawOcrText: "TSH 2.1 mIU/L",
    createdAt: new Date(Date.now() - 3600 * 1000 * 120), // 5 days ago
    updatedAt: new Date(Date.now() - 3600 * 1000 * 120),
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "app_301",
    userId: "demo-user-123",
    doctorId: "doc_1",
    slotTime: new Date(Date.now() + 3600 * 1000 * 48), // 2 days in future
    status: "requested",
    mocked: true,
    notes: "Routine cardiac screening consultation",
    createdAt: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2),
  },
  {
    id: "app_302",
    userId: "demo-user-123",
    doctorId: "doc_4",
    slotTime: new Date(Date.now() - 3600 * 1000 * 48), // 2 days ago
    status: "completed",
    mocked: true,
    notes: "General wellness checkup",
    createdAt: new Date(Date.now() - 3600 * 1000 * 96), // 4 days ago
    updatedAt: new Date(Date.now() - 3600 * 1000 * 48),
  },
];

/**
 * Domain Service: Fetches and merges SymptomLog, Report, and Appointment records into a unified chronological feed.
 * Constraint: Sorted strictly by timestamp descending.
 */
export async function getHealthTimeline(userId: string): Promise<TimelineEntry[]> {
  await new Promise((res) => setTimeout(res, 100)); // async delay simulation

  const entries: TimelineEntry[] = [];

  // Map Symptom Logs
  MOCK_SYMPTOM_LOGS.forEach((log) => {
    entries.push({
      id: log.id,
      type: "symptom_log",
      timestamp: log.createdAt,
      title: "Symptom Triage Assessment",
      subtitle: log.symptoms,
      badgeText: `Urgency: ${log.urgencyLevel}`,
      badgeVariant: log.urgencyLevel === "high_critical" ? "amber" : log.urgencyLevel === "moderate" ? "slate" : "default",
      details: {
        aiSummary: log.aiResponse,
        suggestedSpecialties: log.specialties,
      },
      rawRecord: log,
    });
  });

  // Map Reports
  MOCK_REPORTS.forEach((rep) => {
    entries.push({
      id: rep.id,
      type: "report",
      timestamp: rep.createdAt,
      title: `Report Analysis: ${rep.fileName}`,
      subtitle: rep.plainSummary || "Health document analyzed via Gemini OCR",
      badgeText: `Parse Status: ${rep.parseStatus}`,
      badgeVariant: rep.parseStatus === "ok" ? "emerald" : rep.parseStatus === "low_confidence" ? "amber" : "rose",
      details: {
        fileType: rep.fileType,
      },
      rawRecord: rep,
    });
  });

  // Map Appointments
  MOCK_APPOINTMENTS.forEach((app) => {
    entries.push({
      id: app.id,
      type: "appointment",
      timestamp: app.createdAt,
      title: `Specialist Appointment (${app.status.toUpperCase()})`,
      subtitle: `Scheduled Slot: ${app.slotTime.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`,
      badgeText: `Status: ${app.status}`,
      badgeVariant: app.status === "completed" ? "emerald" : "default",
      details: {
        notes: app.notes,
        slotTime: app.slotTime,
      },
      rawRecord: app,
    });
  });

  // Sort strictly by timestamp descending
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
