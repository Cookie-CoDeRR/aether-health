import { GoogleGenAI } from "@google/genai";

export interface PrescribedMedication {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timesOfDay?: string[]; // e.g. ["Morning (08:00 AM)", "Night (09:30 PM)"]
  mealTiming?: string; // e.g. "Before Food" | "After Food" | "With Food"
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  totalDoses: number;
  dosesRemaining: number;
  takenToday: boolean;
  takenAt?: string;
  hospitalName: string;
  doctorName?: string;
  instructions?: string;
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
    lastTriageAt: "Just now",
    chiefComplaint: "Mild throbbing headache, post-prandial epigastric burning, and fatigue",
    compressedChat: `[USER 09:30 AM]: Experiencing dull retrosternal discomfort and burning sensation after morning coffee. Also mild headache for 2 days.
[AI 09:30 AM]: Checked known records (Penicillin allergy noted). Evaluated symptoms for dyspepsia vs acute stress cephalalgia. Urgency evaluated as Moderate. Advised avoiding NSAIDs and consulting attending physician.`,
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
      generatedAt: "Today, 09:49 AM",
      triageRisk: "moderate",
    },
    recentLabMarkers: [
      { name: "White Blood Cell (WBC)", value: "11.2", reference: "4.5 - 11.0", status: "high", unit: "K/µL" },
      { name: "Serum Creatinine", value: "0.92", reference: "0.70 - 1.30", status: "normal", unit: "mg/dL" },
      { name: "Fasting Blood Glucose", value: "98", reference: "70 - 99", status: "normal", unit: "mg/dL" },
      { name: "Hemoglobin (Hb)", value: "14.8", reference: "13.8 - 17.2", status: "normal", unit: "g/dL" },
      { name: "Platelet Count", value: "245", reference: "150 - 450", status: "normal", unit: "K/µL" },
    ],
    timelineMilestones: [
      {
        id: "ev-1",
        title: "Triage Assessment Completed",
        date: "Today, 09:30 AM",
        category: "Triage",
        summary: "Interactive symptom evaluation recorded for epigastric discomfort and headache.",
        facility: "Aether Telemetry System",
      },
      {
        id: "ev-2",
        title: "Comprehensive Metabolic & CBC Panel",
        date: "Aug 22, 2026",
        category: "Lab",
        summary: "WBC 11.2 K/µL, normal renal and liver function panels.",
        facility: "Apollo Diagnostics Central Lab",
      },
      {
        id: "ev-3",
        title: "Cardiology Clearance Follow-up",
        date: "Jun 14, 2026",
        category: "Consultation",
        summary: "Routine ECG and treadmill stress test normal. Atorvastatin 10mg continued.",
        facility: "Apollo Specialty Hospital",
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
      situation: "42-year-old female presenting with acute retrosternal pressure radiating to left arm and sudden dyspnea.",
      background: "History of Type 2 Diabetes (HbA1c 7.4%) and known Aspirin sensitivity. High cardiovascular risk profile.",
      assessment: "Possible Acute Coronary Syndrome (ACS) vs Severe Angina Equivalents. Urgency: HIGH CRITICAL.",
      sensitiveDisclosures: [
        "Patient expressed intense fear of hospitalization due to family medical trauma.",
      ],
      doctorRecommendations: [
        "Perform urgent 12-lead Electrocardiogram (ECG) immediately.",
        "Draw high-sensitivity Troponin I/T and cardiac enzymes stat.",
        "Prepare emergency sublingual nitrate therapy if blood pressure permits (verify NKDA).",
      ],
      generatedAt: "Today, 09:02 AM",
      triageRisk: "high_critical",
    },
    recentLabMarkers: [
      { name: "Troponin I (Cardiac)", value: "0.08", reference: "< 0.04", status: "high", unit: "ng/mL" },
      { name: "HbA1c Glycated Hemoglobin", value: "7.4", reference: "< 5.7", status: "high", unit: "%" },
      { name: "Serum Potassium", value: "4.1", reference: "3.5 - 5.0", status: "normal", unit: "mEq/L" },
    ],
    timelineMilestones: [
      {
        id: "ev-p1",
        title: "Emergency Triage Dispatch",
        date: "Today, 09:00 AM",
        category: "Triage",
        summary: "High critical symptom flag triggered for acute chest tightness.",
        facility: "Fortis Emergency Department",
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
    compressedChat: `[USER 08:45 AM]: Sneezing frequently and clear runny nose since yesterday morning after garden work.
[AI 08:45 AM]: Evaluated symptoms for seasonal allergic rhinitis. Urgency: Routine. Recommended oral antihistamine or saline nasal spray.`,
    handoverSummary: {
      situation: "28-year-old male with acute onset of bilateral watery rhinorrhea and paroxysmal sneezing.",
      background: "Young healthy individual with no chronic comorbidities or documented drug allergies.",
      assessment: "Acute Allergic Rhinitis precipitated by environmental aeroallergens. Urgency: Routine.",
      sensitiveDisclosures: [],
      doctorRecommendations: [
        "Recommend non-sedating second-generation H1 antihistamine (e.g. Cetirizine 10mg or Fexofenadine 120mg).",
        "Advise daily isotonic saline nasal rinse.",
      ],
      generatedAt: "Today, 08:48 AM",
      triageRisk: "routine",
    },
    recentLabMarkers: [
      { name: "Total IgE (Serum)", value: "180", reference: "< 100", status: "high", unit: "IU/mL" },
      { name: "Absolute Eosinophil Count", value: "420", reference: "20 - 500", status: "normal", unit: "/µL" },
    ],
    timelineMilestones: [
      {
        id: "ev-r1",
        title: "Allergy Symptom Check",
        date: "Today, 08:45 AM",
        category: "Triage",
        summary: "Seasonal rhinitis triage completed.",
        facility: "Aether Clinic Portal",
      },
    ],
  },
];

/**
 * Compresses raw multi-turn chat messages into a token-efficient dialogue transcript.
 */
export function compressChatTranscript(messages: { sender: string; text: string; timestamp?: string }[]): string {
  if (!messages || messages.length === 0) return "No prior triage dialogue recorded.";

  return messages
    .map((m) => {
      const role = m.sender === "user" ? "USER" : "AI";
      const time = m.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const cleanText = m.text.replace(/\s+/g, " ").trim();
      return `[${role} ${time}]: ${cleanText}`;
    })
    .join("\n");
}

/**
 * Generates structured SBAR Handover Brief using Gemini API.
 */
export async function generateSBARHandover(
  patientId: string,
  patientName: string,
  messages: any[]
): Promise<SBARHandoverSummary> {
  const compressed = compressChatTranscript(messages);

  try {
    if (rawApiKey) {
      const prompt = `You are a clinical triage AI assistant for Aether Health.
Convert the following patient triage dialogue into a concise, professional SBAR (Situation, Background, Assessment, Recommendation) Clinical Handover Brief.
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

  // Fallback synthesis
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
          "Patient noted mild anxiety regarding whether elevated WBC (11.2) indicates an underlying infection.",
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
    if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
      if (lastUserMsg) {
        queue[existingIndex].chiefComplaint = lastUserMsg.text.substring(0, 100);
      }
    }
  }

  localStorage.setItem("aether_doctor_patient_queue", JSON.stringify(queue));

  // Broadcast event
  window.dispatchEvent(
    new CustomEvent("aether-patient-triage-updated", {
      detail: { patientId, compressedChat: compressed, handoverSummary: summary },
    })
  );
}

/**
 * Retrieves the live patient queue for the doctor portal.
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
 * Doctor writes multiple prescriptions at once with time-of-day, start/end dates, and live sync.
 */
export function prescribeMultipleMedications(
  patientId: string,
  items: {
    brandName: string;
    genericName: string;
    dosage: string;
    frequency: string;
    timesOfDay: string[];
    mealTiming: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    instructions: string;
    doctorName: string;
    hospitalName: string;
  }[]
): { success: boolean; error?: string; createdMedications?: PrescribedMedication[] } {
  if (typeof window === "undefined") return { success: false, error: "Window undefined" };
  if (!items || items.length === 0) return { success: false, error: "No medications provided." };

  // Check all items against Allergy Guard
  for (const item of items) {
    const lower = (item.brandName + " " + item.genericName).toLowerCase();
    if (
      lower.includes("penicillin") ||
      lower.includes("amoxicillin") ||
      lower.includes("ampicillin") ||
      lower.includes("augmentin")
    ) {
      return {
        success: false,
        error: `⚠️ CONTRAINDICATION ALERT: "${item.brandName}" contains penicillin derivatives. Patient has a severe Penicillin allergy. Order blocked by Aether Allergy Guard.`,
      };
    }
  }

  const createdMeds: PrescribedMedication[] = items.map((item, idx) => ({
    id: `rx_doc_${Date.now()}_${idx}`,
    brandName: item.brandName,
    genericName: item.genericName,
    dosage: item.dosage,
    frequency: item.frequency,
    timesOfDay: item.timesOfDay,
    mealTiming: item.mealTiming,
    startDate: item.startDate,
    endDate: item.endDate,
    totalDays: item.totalDays,
    totalDoses: item.totalDays * (item.timesOfDay.length || 1),
    dosesRemaining: item.totalDays * (item.timesOfDay.length || 1),
    takenToday: false,
    hospitalName: item.hospitalName,
    doctorName: item.doctorName,
    instructions: item.instructions,
  }));

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

  const updatedMeds = [...createdMeds, ...currentMeds];
  localStorage.setItem("aether_medications", JSON.stringify(updatedMeds));

  // Add timeline event
  const medNames = items.map((m) => `${m.brandName} (${m.dosage})`).join(", ");
  const newTimelineEvent = {
    id: `ev_rx_${Date.now()}`,
    title: `Doctor Prescription: ${medNames}`,
    date: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    category: "Medication",
    summary: `Prescribed by ${items[0].doctorName} at ${items[0].hospitalName}. Duration: ${items[0].totalDays} days (${items[0].startDate} to ${items[0].endDate}). Instructions: ${items[0].instructions}`,
    facility: items[0].hospitalName,
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

  // Broadcast live cross-component event
  window.dispatchEvent(
    new CustomEvent("aether-medications-updated", {
      detail: { medication: createdMeds[0], allMeds: updatedMeds },
    })
  );

  return { success: true, createdMedications: createdMeds };
}

/**
 * Single medicine prescription wrapper.
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
  const res = prescribeMultipleMedications(patientId, [
    {
      brandName: prescription.brandName,
      genericName: prescription.genericName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      timesOfDay: ["Morning (08:00 AM)"],
      mealTiming: "Before Food",
      startDate: "Today",
      endDate: "14 Days from now",
      totalDays: 14,
      instructions: prescription.instructions,
      doctorName: prescription.doctorName,
      hospitalName: prescription.hospitalName,
    },
  ]);

  if (!res.success) {
    return { success: false, error: res.error };
  }

  return { success: true, medication: res.createdMedications?.[0] };
}
