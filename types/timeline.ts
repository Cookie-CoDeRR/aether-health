export type TimelineEntryType = "symptom_log" | "report" | "appointment" | "cured_certificate";

export type BadgeVariant = "default" | "amber" | "emerald" | "slate" | "rose";

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  timestamp: Date;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  isCuredCleared?: boolean;
  curedCertificateNote?: string;
  curedDoctorName?: string;
  curedIssuedAt?: Date;
  details?: Record<string, any>;
  rawRecord?: any;
}
