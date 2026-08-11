export type TimelineEntryType = "symptom_log" | "report" | "appointment";

export type BadgeVariant = "default" | "amber" | "emerald" | "slate" | "rose";

export interface TimelineEntry {
  id: string;
  type: TimelineEntryType;
  timestamp: Date;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  details?: Record<string, any>;
  rawRecord?: any;
}
