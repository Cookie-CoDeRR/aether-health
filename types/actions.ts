export type ActionCategory =
  | "Triage & Diagnosis"
  | "Facility & Logistics"
  | "Prescription & Pharmacy"
  | "EHR & Data Sync";

export interface ActionParameter {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  detail: string;
  description: string;
  category: ActionCategory;
  metrics: string;
  icon: string;
  parameters?: ActionParameter[];
  href?: string;
}

export const ACTION_ITEMS: ActionItem[] = [
  {
    id: "action_1",
    title: "AI Symptom Triage Read",
    detail: "Gemini 1.5 Flash • Real-time Triage",
    description: "Evaluates patient symptoms against clinical safety middleware and categorizes urgency (low, moderate, high_critical).",
    category: "Triage & Diagnosis",
    metrics: "< 3s Latency",
    icon: "💬",
    href: "/triage",
    parameters: [
      { id: "symptoms", label: "Patient Symptoms Description", type: "text", placeholder: "e.g. Chest pain radiating to left arm", required: true },
    ],
  },
  {
    id: "action_2",
    title: "Nearby Emergency Hospital Route",
    detail: "Leaflet Map • OpenStreetMap Overpass",
    description: "Queries OpenStreetMap Overpass API for real 24/7 ICU emergency clinics within a configurable radius.",
    category: "Facility & Logistics",
    metrics: "5km Radius",
    icon: "🚑",
    href: "/discovery",
    parameters: [
      { id: "radius", label: "Search Radius (km)", type: "number", placeholder: "5", required: true },
    ],
  },
  {
    id: "action_3",
    title: "OpenFDA Medicine Price Compare",
    detail: "OpenFDA API • Active Ingredient Match",
    description: "Searches free OpenFDA drug label dataset and compares generic active ingredient prices across pharmacies.",
    category: "Prescription & Pharmacy",
    metrics: "42% Savings",
    icon: "💊",
    href: "/medicines",
    parameters: [
      { id: "medicine", label: "Medicine Brand or Generic Name", type: "text", placeholder: "e.g. Paracetamol, Metformin", required: true },
    ],
  },
  {
    id: "action_4",
    title: "Medical Report OCR Parse",
    detail: "Lab Metric Extraction • Flag Anomaly",
    description: "Extracts hemoglobin, WBC, glucose, and creatinine values from lab PDF/images with out-of-range alerts.",
    category: "EHR & Data Sync",
    metrics: "99.2% Accuracy",
    icon: "📄",
    href: "/reports",
  },
  {
    id: "action_5",
    title: "External Hospital EHR Webhook Sync",
    detail: "REST API Endpoint • JSON Sync",
    description: "Simulates receiving assigned patient prescriptions from external hospital systems (e.g. Apollo EHR API).",
    category: "EHR & Data Sync",
    metrics: "Real-time Push",
    icon: "🏥",
    parameters: [
      { id: "hospitalName", label: "Hospital Name", type: "text", placeholder: "Apollo Specialty Hospital", required: true },
      { id: "medicationName", label: "Prescribed Medication", type: "text", placeholder: "Amoxicillin 500mg", required: true },
    ],
  },
  {
    id: "action_6",
    title: "Doctor Roster & Slot Booking",
    detail: "Specialist Directory • Appointments",
    description: "Filters on-duty facility doctors by specialty (Cardiology, Neurology, Pediatrics) and books consultation slots.",
    category: "Facility & Logistics",
    metrics: "On-Duty Roster",
    icon: "👨‍⚕️",
    href: "/doctors",
  },
];
