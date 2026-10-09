/**
 * AETHER Intent Classification & Deterministic Safety Engine
 * 
 * Accurately routes user inputs before clinical advice is generated:
 * 1. Emergency Red Flags (Deterministic check ALWAYS runs first)
 * 2. Greetings / Small Talk
 * 3. App Feature / Help Questions
 * 4. General Health Education
 * 5. Symptom Reports (with detail check & follow-ups)
 * 6. Unclear / Too Short / Off-Topic Queries
 */

export type TriageIntent =
  | "emergency"
  | "greeting"
  | "app_question"
  | "general_health_question"
  | "symptom_report"
  | "unclear"
  | "off_topic";

export interface IntentClassificationResult {
  intent: TriageIntent;
  redFlags: string[];
  isEmergency: boolean;
  needsMoreInfo: boolean;
  followUpQuestions: string[];
  deterministicReply?: string;
  triageLevel: "low" | "moderate" | "high_critical" | null;
}

// ---------------------------------------------------------------------------
// 1. DETERMINISTIC EMERGENCY RED-FLAG PATTERNS
// ---------------------------------------------------------------------------
interface RedFlagRule {
  category: string;
  patterns: RegExp[];
  reason: string;
}

const EMERGENCY_RED_FLAG_RULES: RedFlagRule[] = [
  {
    category: "Cardiovascular",
    patterns: [
      /\bchest\s+(pain|pressure|tightness|heaviness|crushing|squeezing)\b/i,
      /\bpain\s+(radiating\s+to|in)\s+(left\s+arm|jaw|back|neck|shoulder)\b/i,
      /\bheart\s+attack\b/i,
      /\bcrushing\s+substernal\b/i,
    ],
    reason: "Possible acute coronary syndrome or cardiac ischemia.",
  },
  {
    category: "Respiratory",
    patterns: [
      /\b(trouble|difficulty|unable\s+to|struggling\s+to)\s+(breath|breathe|breathing)\b/i,
      /\b(shortness\s+of\s+breath|severe\s+breathlessness|gasping\s+for\s+air|suffocating)\b/i,
      /\b(stridor|severe\s+wheezing|choking)\b/i,
      /\bblue\s+(lips|face|fingertips|skin)\b/i,
    ],
    reason: "Acute respiratory distress or compromised airway.",
  },
  {
    category: "Neurological / Stroke",
    patterns: [
      /\b(facial\s+droop|face\s+drooping|slurred\s+speech|unable\s+to\s+speak)\b/i,
      /\b(arm\s+weakness|one\s+sided\s+(weakness|paralysis|numbness))\b/i,
      /\bsudden\s+loss\s+of\s+(vision|sight|speech|balance)\b/i,
      /\b(stroke|fast\s+symptoms|brain\s+hemorrhage)\b/i,
      /\bworst\s+headache\s+of\s+(my\s+)?life\b/i,
      /\bthunderclap\s+headache\b/i,
    ],
    reason: "Signs of acute cerebrovascular accident (stroke) or intracranial event.",
  },
  {
    category: "Consciousness & Seizures",
    patterns: [
      /\b(unconscious|loss\s+of\s+consciousness|unresponsive|passed\s+out|collapsed)\b/i,
      /\b(fainted\s+and\s+hit\s+head|blacked\s+out)\b/i,
      /\b(active\s+seizure|having\s+a\s+seizure|convulsions|fitting)\b/i,
    ],
    reason: "Loss of consciousness, syncope with trauma, or active seizure disorder.",
  },
  {
    category: "Severe Bleeding & Trauma",
    patterns: [
      /\b(heavy|severe|uncontrolled|massive|profuse)\s+bleeding\b/i,
      /\b(coughing\s+up\s+blood|hemoptysis|vomiting\s+blood|hematemesis)\b/i,
      /\b(stab\s+wound|gunshot|severe\s+burns|deep\s+arterial\s+cut)\b/i,
    ],
    reason: "Major hemorrhage or critical traumatic injury.",
  },
  {
    category: "Severe Allergic Reaction / Anaphylaxis",
    patterns: [
      /\b(anaphylaxis|anaphylactic)\b/i,
      /\b(throat\s+closing|swollen\s+tongue|swelling\s+in\s+throat|unable\s+to\s+swallow\s+air)\b/i,
      /\b(lip\s+swelling\s+with\s+hives|allergic\s+reaction\s+difficulty\s+breathing)\b/i,
    ],
    reason: "Potential severe anaphylaxis requiring emergency epinephrine and airway support.",
  },
  {
    category: "Crisis & Self-Harm",
    patterns: [
      /\b(suicidal|want\s+to\s+die|kill\s+myself|end\s+my\s+life|suicide\s+thoughts)\b/i,
      /\b(self[\s-]harm|overdose[d]?\s+on\s+pills)\b/i,
    ],
    reason: "Acute psychiatric emergency / immediate life safety crisis.",
  },
  {
    category: "Obstetric Emergencies",
    patterns: [
      /\b(pregnant|pregnancy)\b.*\b(heavy\s+bleeding|severe\s+cramps|fluid\s+gush)\b/i,
      /\b(heavy\s+bleeding|severe\s+cramps)\b.*\b(pregnant|pregnancy)\b/i,
    ],
    reason: "Acute obstetric risk requiring urgent maternal-fetal evaluation.",
  },
  {
    category: "Pediatric Red Flags",
    patterns: [
      /\b(baby|infant|newborn)\b.*\b(fever|not\s+waking|lethargic|unresponsive|blue)\b/i,
      /\bfever\s+in\s+(newborn|infant\s+under\s+3\s+months)\b/i,
      /\b(stiff\s+neck|purple\s+rash|non[\s-]blanching\s+rash)\b.*\bfever\b/i,
    ],
    reason: "Critical pediatric emergency or possible neonatal sepsis / meningitis.",
  },
];

/**
 * Deterministic Red Flag Checker
 * Always executes first. Returns any matched emergency flags.
 */
export function checkEmergencyRedFlags(text: string): { isEmergency: boolean; redFlags: string[] } {
  const flags: string[] = [];
  const normalized = text.trim();

  for (const rule of EMERGENCY_RED_FLAG_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        flags.push(`${rule.category}: ${rule.reason}`);
        break;
      }
    }
  }

  return {
    isEmergency: flags.length > 0,
    redFlags: flags,
  };
}

// ---------------------------------------------------------------------------
// 2. GREETINGS & SMALL TALK PATTERNS
// ---------------------------------------------------------------------------
const GREETING_PATTERNS = [
  /^(hi|hello|hey|heyy|heya|hiya|greetings|howdy|hola)[\s!?,.]*$/i,
  /^(hi|hello|hey)\s*,?\s*(how\s+are\s+(u|you)|how\s+r\s+u|how's\s+it\s+going|how\s+do\s+you\s+do|what'?s\s+up)[\s!?,.]*$/i,
  /^(good\s+(morning|afternoon|evening|day|night))[\s!?,.]*$/i,
  /^how\s+are\s+(you|u)[\s!?,.]*$/i,
  /^what'?s\s+up[\s!?,.]*$/i,
  /^(nice\s+to\s+meet\s+you|pleasure)[\s!?,.]*$/i,
];

// ---------------------------------------------------------------------------
// 3. APP HELP & FEATURE PATTERNS
// ---------------------------------------------------------------------------
const APP_QUESTION_PATTERNS = [
  /\bwhat\s+(can\s+you\s+do|are\s+your\s+features|is\s+this\s+app|is\s+aether)\b/i,
  /\bhow\s+(does\s+this\s+work|to\s+use\s+this|do\s+i\s+use\s+aether|can\s+you\s+help\s+me)\b/i,
  /\b(who\s+are\s+you|what\s+are\s+you|are\s+you\s+a\s+doctor|are\s+you\s+ai)\b/i,
  /\b(how\s+to|how\s+do\s+i)\s+(upload|book|find\s+doctor|view\s+records|add\s+medicine)\b/i,
  /^(help|help\s+me|menu|features|commands)[\s!?.]*$/i,
];

// ---------------------------------------------------------------------------
// 4. GENERAL HEALTH EDUCATION PATTERNS
// ---------------------------------------------------------------------------
const GENERAL_HEALTH_PATTERNS = [
  /\bhow\s+much\s+(water|sleep|exercise|protein|fiber)\s+(should|do)\s+(i|we|adults)\b/i,
  /\bwhat\s+is\s+(normal\s+blood\s+pressure|normal\s+heart\s+rate|normal\s+blood\s+sugar|bmi|hemoglobin)\b/i,
  /\bwhat\s+is\s+(vitamin\s+[a-z0-9]+|calcium|iron|magnesium)\s+(good\s+for|used\s+for)\b/i,
  /\bhow\s+many\s+hours\s+of\s+sleep\b/i,
  /\b(benefits\s+of|is\s+it\s+healthy\s+to)\s+(walking|exercise|drinking\s+water|yoga|meditation)\b/i,
  /\bcan\s+i\s+take\s+(paracetamol|ibuprofen|antacid)\s+on\s+an\s+empty\s+stomach\b/i,
  /\bwhat\s+causes\s+(hiccups|yawning|sneezing|snoring)\b/i,
  /\bdifference\s+between\s+(viral|bacterial|cold|flu)\b/i,
];

// ---------------------------------------------------------------------------
// 5. SYMPTOM INDICATOR KEYWORDS
// ---------------------------------------------------------------------------
const SYMPTOM_KEYWORDS = [
  "pain", "ache", "sore", "fever", "cough", "cold", "flu", "headache",
  "dizziness", "nausea", "vomit", "vomiting", "diarrhea", "cramp", "cramps",
  "rash", "itch", "swelling", "burn", "burning", "fatigue", "tired",
  "chills", "congestion", "runny nose", "stomach", "throat", "migraine",
  "sprain", "stiffness", "discomfort", "constipation", "bloating", "acid", "gastric"
];

// ---------------------------------------------------------------------------
// 6. SYMPTOM DETAIL HEURISTICS (Checks if duration / severity / context provided)
// ---------------------------------------------------------------------------
function hasSymptomDetails(text: string): boolean {
  const lower = text.toLowerCase();
  
  // Checks for duration: "2 days", "since yesterday", "for 3 hours", "a week", "past month"
  const hasDuration = /\b(\d+\s*(days?|hours?|weeks?|months?)|since\s+\w+|for\s+the\s+past|yesterday|this\s+morning|last\s+night)\b/i.test(lower);
  
  // Checks for severity/quality: "mild", "severe", "moderate", "sharp", "dull", "throbbing", "burning", "intense", "bad", "slight"
  const hasSeverity = /\b(mild|moderate|severe|sharp|dull|throbbing|constant|intermittent|intense|slight|terrible|excruciating|low|high)\b/i.test(lower);
  
  // Multi-word descriptions with sufficient context length (> 35 chars) and duration/severity
  return (hasDuration || hasSeverity) && text.trim().length >= 15;
}

/**
 * Classifies user intent deterministically.
 */
export function classifyUserIntent(text: string): IntentClassificationResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Red Flag Emergency check (Always runs first, overrides everything)
  const redFlagCheck = checkEmergencyRedFlags(trimmed);
  if (redFlagCheck.isEmergency) {
    return {
      intent: "emergency",
      redFlags: redFlagCheck.redFlags,
      isEmergency: true,
      needsMoreInfo: false,
      triageLevel: "high_critical",
      followUpQuestions: [
        "Call 112 (National Emergency)",
        "Call 108 (Ambulance / Emergency)",
        "Find nearest Emergency Room",
      ],
      deterministicReply:
        "⚠️ URGENT MEDICAL ATTENTION REQUIRED: Based on the symptoms described, immediate medical evaluation is necessary. Please contact national emergency services immediately by dialing 112 or 108 in India (or 911 in US/Canada), or have someone take you to the nearest emergency department right away. Do not attempt home treatment or drive yourself.",
    };
  }

  // 2. Unclear / Gibberish / Too short (< 2 non-whitespace characters)
  if (trimmed.length < 2 || /^(asdf|qwerty|zzz+|12345|\?+|\.+|\!+|test)$/i.test(trimmed)) {
    return {
      intent: "unclear",
      redFlags: [],
      isEmergency: false,
      needsMoreInfo: true,
      triageLevel: null,
      followUpQuestions: [
        "Describe a symptom (e.g., headache for 2 days)",
        "Ask a health question",
        "What can Aether do?",
      ],
      deterministicReply:
        "I didn't quite catch that. Could you please describe what symptoms you're experiencing, how long you've had them, or what health question I can help you with?",
    };
  }

  // 3. Greetings / Small Talk
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        intent: "greeting",
        redFlags: [],
        isEmergency: false,
        needsMoreInfo: false,
        triageLevel: null,
        followUpQuestions: [
          "I have had a mild headache for 2 days",
          "What can this app do?",
          "How do I upload my lab report?",
        ],
        deterministicReply:
          "Hello! I am Aether, your personal health navigation assistant. Tell me what symptoms you are feeling and how long you've had them, or feel free to ask any health question.",
      };
    }
  }

  // 4. App Question / Help
  for (const pattern of APP_QUESTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        intent: "app_question",
        redFlags: [],
        isEmergency: false,
        needsMoreInfo: false,
        triageLevel: null,
        followUpQuestions: [
          "Check a symptom",
          "How do I upload a lab report?",
          "Find nearby verified doctors",
        ],
        deterministicReply:
          "Aether is an intelligent clinical navigation assistant designed to help you:\n• Describe symptoms for structured triage guidance and specialist recommendations\n• Upload lab test reports or prescriptions for instant OCR biomarker analysis\n• Track daily medications and check for allergy contraindications\n• Locate nearby emergency facilities and verified doctors\n\nHow can I help you today?",
      };
    }
  }

  // 5. General Health Question
  for (const pattern of GENERAL_HEALTH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        intent: "general_health_question",
        redFlags: [],
        isEmergency: false,
        needsMoreInfo: false,
        triageLevel: null,
        followUpQuestions: [
          "What symptoms should I watch out for?",
          "When should I see a primary care doctor?",
        ],
        deterministicReply: getGeneralHealthEducationalAnswer(lower),
      };
    }
  }

  // 6. Symptom Report Detection
  const hasSymptomTerm = SYMPTOM_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasSymptomTerm || lower.includes("feel") || lower.includes("hurts") || lower.includes("sick")) {
    const hasDetails = hasSymptomDetails(trimmed);

    if (!hasDetails) {
      // Missing details: Ask focused follow-up questions instead of guessing or issuing generic clinical cards
      return {
        intent: "symptom_report",
        redFlags: [],
        isEmergency: false,
        needsMoreInfo: true,
        triageLevel: null,
        followUpQuestions: [
          `How long have you had this (e.g. hours, days)?`,
          `How severe is it (mild, moderate, or severe)?`,
          `Do you have any other symptoms (fever, nausea, body ache)?`,
        ],
        deterministicReply:
          `Thank you for reaching out. To give you the most accurate and safe guidance, could you share a few more details?\n\n1. How long have you been experiencing this?\n2. Is the discomfort mild, moderate, or severe?\n3. Do you have any other symptoms like fever, nausea, or dizziness?`,
      };
    }

    // Has sufficient details for a tailored symptom evaluation
    const isModerate =
      lower.includes("fever") ||
      lower.includes("vomit") ||
      lower.includes("severe") ||
      lower.includes("intense") ||
      lower.includes("cramp");

    const tailoredQuestions: string[] = [];
    if (lower.includes("headache") || lower.includes("fatigue")) {
      tailoredQuestions.push("Have you had any fever, nausea, or light sensitivity?");
      tailoredQuestions.push("How has your recent sleep and water intake been?");
      tailoredQuestions.push("Are you noticing any changes in your vision or neck stiffness?");
    } else if (lower.includes("throat") || lower.includes("cough")) {
      tailoredQuestions.push("Is it painful to swallow liquids or food?");
      tailoredQuestions.push("Are you experiencing any shortness of breath or wheezing?");
      tailoredQuestions.push("Have you measured your body temperature?");
    } else if (lower.includes("stomach") || lower.includes("digest") || lower.includes("nausea")) {
      tailoredQuestions.push("Are you able to keep liquids down?");
      tailoredQuestions.push("Have you noticed any sharp localized abdominal pain?");
      tailoredQuestions.push("When did your last meal occur?");
    } else {
      tailoredQuestions.push("Has this symptom been constant or coming and going?");
      tailoredQuestions.push("Are you experiencing any other accompanying sensations?");
      tailoredQuestions.push("Have you had similar symptoms in the past?");
    }

    return {
      intent: "symptom_report",
      redFlags: [],
      isEmergency: false,
      needsMoreInfo: false,
      triageLevel: isModerate ? "moderate" : "low",
      followUpQuestions: tailoredQuestions,
    };
  }

  // 7. Off-Topic / General query fallback
  return {
    intent: "off_topic",
    redFlags: [],
    isEmergency: false,
    needsMoreInfo: false,
    triageLevel: null,
    followUpQuestions: [
      "Describe a symptom you have",
      "Ask a general health question",
      "What features does Aether provide?",
    ],
    deterministicReply:
      "I am specialized in health navigation, symptom triage, lab report analysis, and medication tracking. Could you describe a health symptom or question you'd like guidance with?",
  };
}

/**
 * Educational answers for general health concepts (with explicit educational disclaimer)
 */
function getGeneralHealthEducationalAnswer(lower: string): string {
  if (lower.includes("water") || lower.includes("hydrate")) {
    return "Healthy adults generally require approximately 2 to 3 liters (8 to 12 cups) of fluids per day, varying based on activity level, climate, and overall health. Maintaining steady hydration supports kidney function, energy levels, and digestive health.\n\nThis is general guidance, not a diagnosis.";
  }
  if (lower.includes("sleep")) {
    return "Adults typically need 7 to 9 hours of quality sleep per night for optimal immune function, cognitive clarity, and cardiovascular recovery. Keeping a consistent sleep schedule and limiting screens before bed can improve sleep quality.\n\nThis is general guidance, not a diagnosis.";
  }
  if (lower.includes("blood pressure")) {
    return "For most adults, a normal resting blood pressure is generally defined as below 120/80 mmHg. Consistently elevated readings (130/80 mmHg or higher) should be evaluated by a healthcare professional.\n\nThis is general guidance, not a diagnosis.";
  }
  if (lower.includes("paracetamol") || lower.includes("empty stomach")) {
    return "Paracetamol (acetaminophen) can generally be taken with or without food. However, taking medication with water and a light snack may help avoid mild stomach discomfort. Always adhere to packaging instructions and consult a pharmacist or doctor regarding personal safety.\n\nThis is general guidance, not a diagnosis.";
  }
  return "General wellness recommendations emphasize balanced nutrition, daily physical activity, adequate hydration (2-3L/day), and 7-9 hours of sleep. For personalized assessments or chronic concerns, consult a licensed physician.\n\nThis is general guidance, not a diagnosis.";
}

/**
 * 4 Safe Fallback Replies when Model Call Fails (randomly picked, zero diagnosis, no triage level)
 */
export const SAFE_MODEL_FAILURE_REPLIES = [
  "I couldn't generate personalised guidance right now. If your symptoms feel concerning, change suddenly, or get worse, please consult a qualified healthcare professional or visit a local clinic.",
  "I couldn't generate personalised guidance right now. Please consider checking with a doctor or primary care clinician for tailored medical advice regarding what you are experiencing.",
  "I couldn't generate personalised guidance right now. For your safety, if you feel unwell or have any questions about these symptoms, please reach out to a healthcare provider.",
  "I couldn't generate personalised guidance right now. Please monitor how you feel closely and speak with a licensed clinician if your discomfort persists or causes worry.",
];

export function getRandomModelFailureReply(): string {
  const index = Math.floor(Math.random() * SAFE_MODEL_FAILURE_REPLIES.length);
  return SAFE_MODEL_FAILURE_REPLIES[index] || SAFE_MODEL_FAILURE_REPLIES[0];
}

export interface StructuredSymptomReplyInput {
  acknowledgement?: string;
  whats_worth_noticing?: string[];
  self_care?: string[];
  watch_for?: string[];
  when_to_see_a_doctor?: string;
}

/**
 * Compiles structured fields into clean markdown/text with short sections and non-diagnosis note
 */
export function compileStructuredSymptomReply(input: StructuredSymptomReplyInput): string {
  const parts: string[] = [];

  if (input.acknowledgement && input.acknowledgement.trim()) {
    parts.push(sanitizeClinicalReplyText(input.acknowledgement.trim()));
  }

  if (input.whats_worth_noticing && input.whats_worth_noticing.length > 0) {
    const items = input.whats_worth_noticing.map((i) => `• ${sanitizeClinicalReplyText(i)}`).join("\n");
    parts.push(`What's worth noticing:\n${items}`);
  }

  if (input.self_care && input.self_care.length > 0) {
    const items = input.self_care.map((i) => `• ${sanitizeClinicalReplyText(i)}`).join("\n");
    parts.push(`Self-care steps:\n${items}`);
  }

  if (input.watch_for && input.watch_for.length > 0) {
    const items = input.watch_for.map((i) => `• ${sanitizeClinicalReplyText(i)}`).join("\n");
    parts.push(`Watch for:\n${items}\nSeek prompt medical attention if any of these develop.`);
  }

  if (input.when_to_see_a_doctor && input.when_to_see_a_doctor.trim()) {
    parts.push(`When to see a doctor:\n${sanitizeClinicalReplyText(input.when_to_see_a_doctor.trim())}`);
  }

  parts.push("This is general guidance, not a diagnosis.");

  return sanitizeClinicalReplyText(parts.join("\n\n"));
}

/**
 * Strips raw markdown double asterisks (**) and trailing raw headers from plain text.
 * Also cleans forbidden canned diagnosis phrases.
 */
export function sanitizeClinicalReplyText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Strip bold asterisks
    .replace(/^###\s+/gm, "")
    .replace(/^####\s+/gm, "")
    .replace(/\bthis appears to be a manageable condition\b/gi, "this is worth watching and managing carefully")
    .replace(/\bappears to be a manageable condition\b/gi, "is worth watching and managing carefully")
    .trim();
}
