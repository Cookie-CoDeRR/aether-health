# AETHER — Intelligent Healthcare Navigation Ecosystem

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Google AI Studio](https://img.shields.io/badge/AI_Engine-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Supabase](https://img.shields.io/badge/Vector_Store-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Leaflet & OSM](https://img.shields.io/badge/Map_Engine-Leaflet_Overpass_QL-199900?style=for-the-badge&logo=openstreetmap)](https://overpass-api.de/)
[![ABDM Registry](https://img.shields.io/badge/Health_Registry-ABDM_HPR_Verified-0052CC?style=for-the-badge)](https://hpr.abdm.gov.in/)

**AETHER** is an enterprise-grade, zero-cost healthcare navigation platform engineered with the **Signal v3 Design System**. It unifies AI symptom triage, OpenStreetMap emergency hospital discovery, Ayushman Bharat Digital Mission (ABDM) doctor verification, lab report OCR metric parsing, and daily medication compliance tracking into a seamless clinical telemetry environment.

---

## 🏛️ System Architecture Overview

```
                          ┌─────────────────────────────────────────┐
                          │   AETHER Navigation Gateway (Client)    │
                          └────────────────────┬────────────────────┘
                                               │
      ┌───────────────────────┬────────────────┼───────────────────────┬───────────────────────┐
      ▼                       ▼                ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────────┐ ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Symptom      │    │ OSM Overpass     │ │ ABDM HPR     │    │ Lab Report OCR   │    │ Hospital EHR     │
│ AI Triage    │    │ Map Discovery    │ │ Registry     │    │ Extraction       │    │ Integration API  │
└──────┬───────┘    └────────┬─────────┘ └──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘
       │                     │                  │                     │                       │
       ▼                     ▼                  ▼                     ▼                       ▼
┌──────────────┐    ┌──────────────────┐ ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Gemini 1.5   │    │ OpenRouteService │ │ NHA Gateway  │    │ Vector Embeddings│    │ REST Webhooks    │
│ Flash Safety │    │ Google Maps Link │ │ HPR Handles  │    │ Supabase pgvector│    │ Secret API Key   │
└──────────────┘    └──────────────────┘ └──────────────┘    └──────────────────┘    └──────────────────┘
```

---

## ⚡ Core Feature Modules & Specifications

### 1. AI Symptom Triage (`/triage`)
- **Clinical Safety Middleware**: Evaluates incoming patient symptoms against safety guardrails and rate-limiting thresholds (20 req/min).
- **Urgency Tiering**: Categorizes cases into `low`, `moderate`, and `high_critical` urgency levels.
- **Baseline Health Preprompt Injection**: Automatically injects patient profile details (e.g., penicillin/amoxicillin allergies, asthma history) into Gemini 1.5 Flash prompts so AI guidance accounts for active conditions.
- **Today's Assigned Medications Card**: Displays daily assigned dosage progress, compliance checkboxes, time slots, and non-penicillin allergy safety checks.

### 2. Nearby Hospitals & Emergency Discovery (`/discovery`)
- **Zero-Cost Leaflet & Overpass QL**: Queries nearby hospitals and emergency clinics within a configurable radius (1 km – 20 km) using OpenStreetMap Overpass API without requiring commercial map API keys.
- **Direct Navigation Links**: Generates direct route URLs to Google Maps (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`).
- **24/7 ICU & Emergency Filter**: Instantly filters facilities offering round-the-clock emergency medical care.

### 3. ABDM Healthcare Professionals Registry (HPR) (`/doctors`)
- **Live ABDM Verification**: Interfaces with `services/abdmService.ts` to verify doctor HPR handles (e.g. `dr_ananya@hpr`).
- **State Medical Council Details**: Displays registration numbers, state council names (e.g. *Maharashtra Medical Council*), qualifications, and `🛡️ ABDM HPR VERIFIED` badges.
- **Dynamic Array Search & Filtering**: Recalculates search queries, minimum ratings, maximum distances, and specialties dynamically over the dataset array.

### 4. Lab Report OCR Metric Parsing (`/reports`)
- **Structured Metric Extraction**: Parses uploaded lab PDFs and images to extract hemoglobin, WBC, blood glucose, and creatinine values.
- **Out-of-Range Highlights**: Flags abnormal values in red or amber badges.
- **Clearance Certificates**: Provides 1-click clearance certificate issuance upon uploading clean report findings.

### 5. Unified Health History Timeline (`/timeline`)
- **Chronological Telemetry Feed**: Merges symptom logs, parsed lab reports, doctor appointments, and cured certificates into a single timeline sorted by timestamp descending.
- **Cured Condition Management**: Allows patients or certified doctors to mark prior conditions as cured, issuing clearance certificates and excluding resolved issues from future AI triage prompts.

### 6. Generic Medicine Lookup & Price Comparison (`/medicines`)
- **Active Ingredient Equivalents**: Matches brand-name medications with generic alternatives (e.g., Crocin 650 ➔ Paracetamol).
- **Multi-Pharmacy Price Index**: Compares retail prices across pharmacies in INR.

---

## 🏥 Hospital Software EHR Integration APIs

AETHER provides secure REST API endpoints designed to seamlessly sync patient data, doctor rosters, and medication schedules with pre-existing hospital software (Epic, Cerner, local EHR systems).

### Authentication
All hospital integration endpoints require a valid secret API key passed in the `x-hospital-api-key` HTTP header.

---

### Endpoints

#### 1. Bulk Patient Roster Synchronization
`POST /api/v1/hospital/sync-patients`

**Header:**
`x-hospital-api-key: aether_ehr_live_sec_9941a8`

**Request Body Example:**
```json
{
  "patients": [
    {
      "patientId": "EHR_PATIENT_88291",
      "fullName": "Alex Rivers",
      "age": 34,
      "gender": "Male",
      "medicalConditions": ["Seasonal Asthma", "Hypertension"],
      "knownAllergies": ["Penicillin", "Amoxicillin"],
      "assignedMedications": [
        {
          "name": "Albuterol Inhaler",
          "dosage": "90mcg",
          "frequency": "As needed for shortness of breath",
          "instructions": "2 puffs every 4-6 hours as needed"
        }
      ]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Successfully synchronized 1 patient record(s) from EHR system.",
  "syncedCount": 1,
  "patients": [
    {
      "patientId": "EHR_PATIENT_88291",
      "fullName": "Alex Rivers",
      "medicalConditions": ["Seasonal Asthma", "Hypertension"],
      "knownAllergies": ["Penicillin", "Amoxicillin"],
      "assignedMedicationsCount": 1,
      "updatedAt": "2026-08-12T11:25:00.000Z"
    }
  ],
  "timestamp": "2026-08-12T11:25:00.000Z"
}
```

---

#### 2. Doctor Roster & Slot Synchronization
`POST /api/v1/hospital/sync-doctors`

**Header:**
`x-hospital-api-key: aether_ehr_live_sec_9941a8`

**Request Body Example:**
```json
{
  "doctors": [
    {
      "hprId": "dr_ananya@hpr",
      "registrationNumber": "KMC-2018-84729",
      "fullName": "Dr. Ananya Deshmukh",
      "specialty": "Cardiology",
      "hospitalName": "Apollo Emergency Care",
      "consultationFee": 1000,
      "availableSlots": ["10:00 AM", "02:30 PM", "04:00 PM"]
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Successfully synchronized 1 doctor roster entry(ies).",
  "syncedCount": 1,
  "doctors": [
    {
      "hprId": "dr_ananya@hpr",
      "fullName": "Dr. Ananya Deshmukh",
      "specialty": "Cardiology",
      "hospitalName": "Apollo Emergency Care",
      "consultationFee": 1000,
      "isAbdmVerified": true,
      "availableSlotsCount": 3,
      "updatedAt": "2026-08-12T11:25:00.000Z"
    }
  ],
  "timestamp": "2026-08-12T11:25:00.000Z"
}
```

---

## 🔒 Vulnerability & Data Theft Security Layer

AETHER implements multi-layered security controls to protect Sensitive Personal Data or Information (SPDI) and Health Records:

1. **Zero-Trust Webhook Authentication**: EHR endpoints enforce `x-hospital-api-key` validation with zero unauthorized access bypass.
2. **Sliding-Window Rate Limiting**: Safety middleware enforces a strict 20 requests/minute limit per IP/user ID to prevent brute-force data extraction.
3. **Anti-SQL Injection Parameterization**: All database queries utilize Prisma ORM and Supabase parameterized prepared statements, preventing SQL injection vulnerabilities.
4. **Input Payload Sanitization & XSS Shield**: All patient names, medical history entries, and symptom prompts are sanitized and capped to prevent script injection attacks.
5. **Hardened HTTP Response Headers**:
   - `X-Content-Type-Options: nosniff` (Prevents MIME-type sniffing attacks)
   - `X-Frame-Options: DENY` (Prevents Clickjacking / iframe embedding)
   - `X-XSS-Protection: 1; mode=block` (Enforces browser XSS filtering)
   - `Cache-Control: no-store, max-age=0` (Prevents sensitive medical responses from being cached on shared computers)

---

## 🛠️ Local Installation & Setup

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL / Supabase Database

### Setup Instructions

```bash
# 1. Clone repository & install dependencies
git clone https://github.com/aether/aether-app.git
cd aether-app
npm install

# 2. Configure Environment Variables (.env.local)
cp .env.example .env.local

# 3. Generate Prisma ORM Database Schema
npx prisma generate

# 4. Run Automated Test Suite (9 Test Suites)
npx tsx scripts/test-safety-middleware.ts
npx tsx scripts/test-hospital-apis.ts
npx tsx scripts/test-supabase-integration.ts

# 5. Launch Development Server
npm run dev
```

Visit `http://localhost:3000` to interact with AETHER.

---

## 🚀 Future Development Roadmap & Scope

1. **FHIR R4 Interoperability Gateway**: Native HL7/FHIR R4 data model mapping to support instant REST syncing with international hospital networks.
2. **Offline Rural PWA Sync**: Service worker caching & IndexedDB vector storage allowing field healthcare workers in remote areas to perform offline triage.
3. **Real-time Ambulance Telemetry Dispatch**: WebSocket-enabled live ambulance GPS tracking connecting emergency dispatch centers with nearby hospitals.
4. **Multi-Modal AI Clinical Imaging**: Extending report parsing to analyze X-ray, MRI, and CT scan imagery via Gemini 1.5 Pro vision capabilities.

---

## 📜 Educational Purpose Disclaimer

*AETHER is engineered strictly for educational, research, and technical capability demonstration purposes. It is not a certified medical device and does not replace licensed medical professionals. In emergencies, immediately contact official emergency services (911 / 112 / 108).*
