export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  slotTime: Date;
  status: AppointmentStatus;
  mocked: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
