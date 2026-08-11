export type UrgencyLevel = 'low' | 'moderate' | 'high_critical';

export interface SymptomLog {
  id: string;
  userId: string;
  symptoms: string;
  urgencyLevel: UrgencyLevel;
  aiResponse: string | null;
  specialties: string | null;
  createdAt: Date;
}
