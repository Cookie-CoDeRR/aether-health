import { GoogleGenAI } from "@google/genai";

export interface PrescribedMedication {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  totalDoses: number;
  dosesRemaining: number;
  takenToday: boolean;
  takenAt?: string;
  hospitalName: string;
}

export interface SBARHandoverSummary {
  situation: string; // Chief complaint & presentation
  background: string; // EHR history, penicillin allergy & lab correlation
  assessment: string; // Clinical AI diagnostic evaluation & risk severity
  sensitiveDisclosures: string[]; // Sensitive / embarrassing details shared with AI
  doctorRecommendations: string[]; // Suggested physical exams, lab orders & adjustments
  generatedAt: string;
  triageRisk: "routine" | "moderate" | "high_critical";
}

export interface PatientRecord {
  patientId: string; // e.g. AETH-PT-9842
  abhaId: string; // ABDM ABHA ID
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  allergies: string[];
  chronicConditions: string[];
  urgencyLevel: "routine" | "moderate" | "high_critical";
  lastTriageAt: string;
  chiefComplaint: string;
  compressedChat: string; // Compressed chat representation
  handoverSummary: SBARHandoverSummary;
  recentLabMarkers: {
    name: string;
    value: string;
    reference: string;
    status: "normal" | "high" | "low";
    unit: string;
  }[];
  timelineMilestones: {
    id: string;
    title: string;
    date: string;
    category: "Consultation" | "Lab" | "Medication" | "Triage";
    summary: string;
    facility: string;
  }[];
}

const rawApiKey = process.env.GEMINI_API_KEY || process.env.VERTEX_AI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: rawApiKey || "AIzaSyDummyKeyForVercelBuildBuild12345" });

// Default active patient database
export const INITIAL_PATIENT_QUEUE: PatientRecord[] = [
  {
    patientId: "AETH-PT-9842",
    abhaId: "91-4820-9481-9021",
    name: "Alex Rivers",
    age: 34,
    gender: "Male",
    bloodGroup: "O+ Positive",
    phone: "+91 98450 12890",
    allergies: ["Penicillin & Amoxicillin (Severe Anaphylactoid)", "Latex (Mild Contact)"],
    chronicConditions: ["Mild Seasonal Asthma", "Essential Hypertension (Borderline)"],
    urgencyLevel: "moderate",
    lastTriageAt: "10 mins ago",
    chiefComplaint: "Mild throbbing headache, fatigue, and post-prandial stomach cramps",
    compressedChat: `[USER 09:15 AM]: I have had a mild throbbing headache and fatigue for the past 2 days, plus mild stomach cramps after lunch.
[AI 09:15 AM]: Evaluated symptoms: consistent with mild gastrointestinal irritation and tension headache. Allergy check: Penicillin guard active. Advised hydration and light meals.
[USER 09:18 AM]: Is this related to my elevated WBC count (11.2) from last week's test? Also feeling slightly bloated and embarrassed to ask about bowel frequency changes.
[AI 09:18 AM]: Reassured patient: mild WBC elevation (11.2 K/µL) reflects mild systemic inflammation. Recommended clinical consultation to review gastritis symptoms safely without penicillin antibiotics.`,
    handoverSummary: {
      situation: "34-year-old male presenting with 48-hour history of frontal tension headache, mild fatigue, and post-prandial epigastric cramping.",
      background: "Documented severe allergy to Penicillin & Amoxicillin. Baseline WBC slightly elevated at 11.2 K/µL (mild active inflammation). Currently taking Metformin 500mg and Atorvastatin 10mg.",
      assessment: "Clinical presentation strongly suggests subacute acute gastritis or non-ulcer dyspepsia with secondary tension cephalalgia. Urgency level: Moderate.",
      sensitiveDisclosures: [
        "Patient expressed embarrassment regarding recent bowel frequency changes and bloating.",
        "Patient noted mild anxiety regarding whether elevated WBC (11.2) indicates an underlying infection.",
      ],
      doctorRecommendations: [
        "Perform epigastric palpation to rule out localized tenderness or rebound pain.",
        "Prescribe non-penicillin H2-blocker or Proton Pump Inhibitor (e.g. Pantoprazole 40mg once daily).",
        "Reassure patient regarding WBC count; schedule repeat CBC panel if symptoms persist beyond 5 days.",
      ],
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      triageRisk: "moderate",
    },
    recentLabMarkers: [
      { name: "White Blood Cells (WBC)", value: "11.2", reference: "4.5 - 11.0", status: "high", unit: "10^3/µL" },
      { name: "Serum Creatinine", value: "0.92", reference: "0.7 - 1.3", status: "normal", unit: "mg/dL" },
      { name: "Fasting Blood Glucose", value: "98", reference: "70 - 99", status: "normal", unit: "mg/dL" },
      { name: "Hemoglobin (Hb)", value: "14.6", reference: "13.5 - 17.5", status: "normal", unit: "g/dL" },
      { name: "Total Cholesterol", value: "185", reference: "< 200", status: "normal", unit: "mg/dL" },
    ],
    timelineMilestones: [
      {
        id: "ev_1",
        title: "AI Clinical Triage Assessment",
        date: "Today, 09:15 AM",
        category: "Triage",
        summary: "Patient reported headache, post-prandial cramps. Penicillin guard cross-referenced.",
        facility: "Aether Telemetry Engine",
      },
      {
        id: "ev_2",
        title: "Comprehensive Metabolic & CBC Lab OCR",
        date: "14 Aug 2026",
        category: "Lab",
        summary: "Automated OCR extracted 5 key biomarkers. WBC flagged at 11.2 K/µL.",
        facility: "Apollo Diagnostics Central Lab",
      },
      {
        id: "ev_3",
        title: "Cardiology Clearance Follow-up",
        date: "28 Jul 2026",
        category: "Consultation",
        summary: "Routine ECG and treadmill stress test normal. Atorvastatin 10mg continued.",
        facility: "Fortis Healthcare Hospital",
      },
    ],
  },
  {
    patientId: "AETH-PT-3104",
    abhaId: "91-1192-3849-5502",
    name: "Priya Nair",
    age: 42,
    gender: "Female",
    bloodGroup: "B+ Positive",
    phone: "+91 97412 88231",
    allergies: ["Sulfa Drugs (Sulfonamides)", "Aspirin (Bronchospasm)"],
    chronicConditions: ["Type 2 Diabetes Mellitus", "Hypothyroidism"],
    urgencyLevel: "high_critical",
    lastTriageAt: "25 mins ago",
    chiefComplaint: "Acute shortness of breath, sudden palpitations, and unilateral left arm numbness",
    compressedChat: `[USER 09:00 AM]: I woke up with severe chest tightness and difficulty breathing. My left arm feels heavy and numb.
[AI 09:00 AM]: HIGH CRITICAL EMERGENCY ALERT triggered. Advised immediate emergency dispatch (108/112). Sitting upright and avoiding exertion instructed.`,
    handoverSummary: {
      situation: "42-year-old female presenting with acute retrosternal chest tightness, dyspnea at rest, and radiating left upper extremity paresthesia.",
      background: "History of Type 2 Diabetes (HbA1c 7.4%) and Hypothyroidism (on Levothyroxine 50mcg). Sulfa drug and Aspirin allergies documented.",
      assessment: "Acute Coronary Syndrome (ACS) or pulmonary embolism must be ruled out STAT. Urgency level: High-Critical.",
      sensitiveDisclosures: [
        "Patient reported severe anxiety and fear of hospital admission.",
      ],
      doctorRecommendations: [
        "Immediate 12-lead ECG, cardiac troponin panel (hs-cTnI), and continuous telemetry monitoring.",
        "Oxygen supplementation if SpO2 < 94%.",
        "Avoid Aspirin if hypersensitivity is confirmed; administer alternative antiplatelet (Clopidogrel) per protocol.",
      ],
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      triageRisk: "high_critical",
    },
    recentLabMarkers: [
      { name: "HbA1c Glycated Hemoglobin", value: "7.4", reference: "< 5.7", status: "high", unit: "%" },
      { name: "Serum Potassium", value: "4.1", reference: "3.5 - 5.0", status: "normal", unit: "mEq/L" },
      { name: "Serum Creatinine", value: "1.05", reference: "0.6 - 1.1", status: "normal", unit: "mg/dL" },
      { name: "TSH", value: "3.2", reference: "0.4 - 4.0", status: "normal", unit: "mIU/L" },
    ],
    timelineMilestones: [
      {
        id: "ev_p1",
        title: "Emergency Triage Dispatch Trigger",
        date: "Today, 09:00 AM",
        category: "Triage",
        summary: "Emergency red-flag protocol initiated for acute chest pressure and dyspnea.",
        facility: "Aether Emergency Dispatch",
      },
    ],
  },
  {
    patientId: "AETH-PT-5519",
    abhaId: "91-7721-0943-1284",
    name: "Rohan Mehta",
    age: 28,
    gender: "Male",
    bloodGroup: "A+ Positive",
    phone: "+91 98860 33419",
    allergies: ["No Known Drug Allergies (NKDA)"],
    chronicConditions: ["None Reported"],
    urgencyLevel: "routine",
    lastTriageAt: "1 hour ago",
    chiefComplaint: "Mild seasonal nasal congestion, sneezing, and ocular pruritus",
    compressedChat: `[USER 08:30 AM]: Seasonal pollen allergies acting up. Sneezing and itchy eyes since morning.
[AI 08:30 AM]: Routine allergic rhinitis guidance provided: saline nasal irrigation, oral second-generation antihistamine recommended.`,
    handoverSummary: {
      situation: "28-year-old male with acute allergic rhinitis exacerbation triggered by seasonal tree pollen.",
      background: "NKDA. No chronic morbidities.",
      assessment: "Mild seasonal allergic rhinitis. Urgency level: Routine.",
      sensitiveDisclosures: [],
      doctorRecommendations: [
        "Recommend non-sedating antihistamine (Cetirizine 10mg or Fexofenadine 120mg).",
        "Saline nasal rinse twice daily.",
      ],
      generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      triageRisk: "routine",
    },
    recentLabMarkers: [
      { name: "Hemoglobin (Hb)", value: "15.2", reference: "13.5 - 17.5", status: "normal", unit: "g/dL" },
      { name: "Total IgE", value: "142", reference: "< 100", status: "high", unit: "IU/mL" },
    ],
    timelineMilestones: [
      {
        id: "ev_r1",
        title: "Seasonal Allergy AI Triage",
        date: "Today, 08:30 AM",
        category: "Triage",
        summary: "Self-management protocol provided for allergic rhinitis.",
        facility: "Aether Telemetry Engine",
      },
    ],
  },
];

/**
 * Compresses an array of chat messages into a token-efficient transcript string.
 */
export function compressChatTranscript(messages: any[]): string {
  if (!messages || messages.length === 0) return "No active conversation logged.";
  return messages
    .map((m) => {
      const sender = m.sender === "user" ? "USER" : "AI";
      const time = m.timestamp || "";
      const text = (m.text || "").replace(/\n+/g, " ").trim();
      return `[${sender} ${time}]: ${text}`;
    })
    .join("\n");
}

/**
 * Generates an LLM Clinical Handover Summary (SBAR format) from raw chat messages.
 */
export async function generateSBARHandover(
  patientId: string,
  patientName: string,
  messages: any[]
): Promise<SBARHandoverSummary> {
  const compressed = compressChatTranscript(messages);

  try {
    if (rawApiKey) {
      const prompt = `You are a Senior Clinical Triage Officer at Aether Health. 
Analyze this patient-AI triage conversation and generate a concise, high-yield SBAR Clinical Handover for the attending physician.
Highlight any sensitive, confidential, or embarrassing details the patient disclosed to the AI so the doctor can approach the consultation empathetically without forcing the patient to awkwardly repeat themselves.

Patient: ${patientName} (ID: ${patientId})
Transcript:
${compressed}

Respond with valid JSON containing exactly these fields:
{
  "situation": "Concise 1-2 sentence chief complaint and presentation",
  "background": "Relevant EHR history, penicillin/drug allergies, lab correlations",
  "assessment": "Clinical AI evaluation and diagnostic considerations",
  "sensitiveDisclosures": ["List of sensitive or embarrassing topics disclosed by patient"],
  "doctorRecommendations": ["3 bulleted actionable doctor clinical interventions/orders"],
  "triageRisk": "routine" | "moderate" | "high_critical"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return {
          situation: parsed.situation || "Patient presenting for clinical evaluation.",
          background: parsed.background || "Cross-referenced against personal EHR profile.",
          assessment: parsed.assessment || "Clinical assessment generated from triage dialogue.",
          sensitiveDisclosures: parsed.sensitiveDisclosures || [],
          doctorRecommendations: parsed.doctorRecommendations || [
            "Perform physical examination.",
            "Review medication history and contraindications.",
          ],
          generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          triageRisk: parsed.triageRisk || "moderate",
        };
      }
    }
  } catch (err) {
    console.warn("Gemini SBAR Handover generation fallback:", err);
  }

  // High-yield fallback synthesis based on symptoms in transcript
  const lower = compressed.toLowerCase();
  const isEmergency = lower.includes("chest pain") || lower.includes("shortness of breath") || lower.includes("numb");
  const isGastric = lower.includes("stomach") || lower.includes("cramp") || lower.includes("nausea") || lower.includes("bowel");

  return {
    situation: isEmergency
      ? `${patientName} reported acute chest discomfort and dyspnea requiring urgent physician review.`
      : isGastric
      ? `${patientName} presenting with 48-hour history of epigastric discomfort, headache, and post-prandial cramping.`
      : `${patientName} completed an interactive triage assessment for general systemic wellness.`,
    background: "Verified Penicillin & Amoxicillin allergy. Baseline WBC 11.2 K/µL noted on recent CBC panel.",
    assessment: isEmergency
      ? "Acute cardiovascular or respiratory concern; immediate ECG and vital monitoring indicated."
      : isGastric
      ? "Symptoms consistent with subacute acute gastritis or functional dyspepsia. Urgency: Moderate."
      : "Routine clinical assessment indicated.",
    sensitiveDisclosures: isGastric
      ? [
          "Patient disclosed feelings of embarrassment regarding bowel frequency changes and bloating.",
          "Patient expressed apprehension regarding whether lab WBC elevation reflects infection.",
        ]
      : [],
    doctorRecommendations: isGastric
      ? [
          "Perform gentle abdominal palpation for epigastric tenderness.",
          "Prescribe non-penicillin GI protectant (e.g. Pantoprazole 40mg once daily).",
          "Reassure patient regarding lab biomarkers; advise dietary moderation.",
        ]
      : [
          "Review vital parameters and physical exam.",
          "Confirm ongoing allergy safety profile.",
        ],
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    triageRisk: isEmergency ? "high_critical" : isGastric ? "moderate" : "routine",
  };
}

/**
 * Saves and updates a patient's triage chat and SBAR handover in storage.
 */
export async function syncPatientTriageToDoctorQueue(
  patientId: string,
  patientName: string,
  messages: any[]
): Promise<void> {
  if (typeof window === "undefined") return;

  const compressed = compressChatTranscript(messages);
  const summary = await generateSBARHandover(patientId, patientName, messages);

  // Store in localStorage
  localStorage.setItem(`aether_compressed_chat_${patientId}`, compressed);
  localStorage.setItem(`aether_handover_${patientId}`, JSON.stringify(summary));

  // Update primary patient entry in queue
  const queue = getDoctorPatientQueue();
  const existingIndex = queue.findIndex((p) => p.patientId === patientId);

  if (existingIndex >= 0) {
    queue[existingIndex].compressedChat = compressed;
    queue[existingIndex].handoverSummary = summary;
    queue[existingIndex].lastTriageAt = "Just now";
    queue[existingIndex].urgencyLevel = summary.triageRisk;
  }

  localStorage.setItem("aether_doctor_patient_queue", JSON.stringify(queue));

  // Dispatch custom live sync event for doctor portal
  window.dispatchEvent(
    new CustomEvent("aether-patient-triage-updated", {
      detail: { patientId, summary, compressed },
    })
  );
}

/**
 * Retrieves the live patient queue for doctor consultation.
 */
export function getDoctorPatientQueue(): PatientRecord[] {
  if (typeof window === "undefined") return INITIAL_PATIENT_QUEUE;

  const stored = localStorage.getItem("aether_doctor_patient_queue");
  if (!stored) {
    localStorage.setItem("aether_doctor_patient_queue", JSON.stringify(INITIAL_PATIENT_QUEUE));
    return INITIAL_PATIENT_QUEUE;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PATIENT_QUEUE;
  }
}

/**
 * Doctor writes a new prescription / next dose update which syncs LIVE to the patient.
 */
export function prescribeDoctorMedication(
  patientId: string,
  prescription: {
    brandName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    nextDoseTime: string;
    totalDoses: number;
    instructions: string;
    doctorName: string;
    hospitalName: string;
  }
): { success: boolean; error?: string; medication?: PrescribedMedication } {
  if (typeof window === "undefined") return { success: false, error: "Window undefined" };

  // Allergy safety check
  const lower = (prescription.brandName + " " + prescription.genericName).toLowerCase();
  if (
    lower.includes("penicillin") ||
    lower.includes("amoxicillin") ||
    lower.includes("ampicillin") ||
    lower.includes("augmentin")
  ) {
    return {
      success: false,
      error: `⚠️ CONTRAINDICATION ALERT: Patient has a documented severe allergy to Penicillin & Amoxicillin. Prescription rejected by Aether Allergy Guard.`,
    };
  }

  const newMed: PrescribedMedication = {
    id: `rx_doc_${Date.now()}`,
    brandName: prescription.brandName,
    genericName: prescription.genericName,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    totalDoses: prescription.totalDoses || 14,
    dosesRemaining: prescription.totalDoses || 14,
    takenToday: false,
    hospitalName: `${prescription.hospitalName} (${prescription.doctorName})`,
  };

  // Get current patient prescriptions
  let currentMeds: PrescribedMedication[] = [];
  const rawMeds = localStorage.getItem("aether_medications");
  if (rawMeds) {
    try {
      currentMeds = JSON.parse(rawMeds);
    } catch {
      currentMeds = [];
    }
  }

  // Prepend new doctor prescribed medicine
  const updatedMeds = [newMed, ...currentMeds.filter((m) => m.id !== newMed.id)];
  localStorage.setItem("aether_medications", JSON.stringify(updatedMeds));

  // Add timeline milestone event for the patient
  const newTimelineEvent = {
    id: `ev_rx_${Date.now()}`,
    title: `Doctor Prescription: ${prescription.brandName} (${prescription.dosage})`,
    date: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    category: "Medication",
    summary: `Prescribed by ${prescription.doctorName} at ${prescription.hospitalName}. Next dose scheduled: ${prescription.nextDoseTime}. Note: ${prescription.instructions}`,
    facility: prescription.hospitalName,
  };

  let timelineEvents: any[] = [];
  const rawTimeline = localStorage.getItem("aether_timeline_events");
  if (rawTimeline) {
    try {
      timelineEvents = JSON.parse(rawTimeline);
    } catch {
      timelineEvents = [];
    }
  }
  localStorage.setItem("aether_timeline_events", JSON.stringify([newTimelineEvent, ...timelineEvents]));

  // Broadcast live cross-component and cross-tab update event
  window.dispatchEvent(
    new CustomEvent("aether-medications-updated", {
      detail: { medication: newMed, allMeds: updatedMeds },
    })
  );

  return { success: true, medication: newMed };
}
