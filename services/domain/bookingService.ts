import { Doctor } from "@/types/doctor";
import { Appointment } from "@/types/appointment";
import doctorsData from "@/data/doctors.json";

export const MOCK_DOCTORS: Doctor[] = (doctorsData as any[]).map((d) => ({
  ...d,
  createdAt: new Date(),
}));

export interface CreateBookingInput {
  userId: string;
  doctorId: string;
  slotTime: Date;
  notes?: string;
}

/**
 * Asynchronously fetches full doctors list from dataset
 */
export async function getDoctorsList(): Promise<Doctor[]> {
  await new Promise((res) => setTimeout(res, 50));
  return MOCK_DOCTORS;
}

/**
 * Asynchronously creates an Appointment record (mocked: true internally)
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<Appointment> {
  await new Promise((res) => setTimeout(res, 150));

  const newAppointment: Appointment = {
    id: `app_${Date.now()}`,
    userId: input.userId,
    doctorId: input.doctorId,
    slotTime: input.slotTime,
    status: "requested",
    mocked: true,
    notes: input.notes || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newAppointment;
}
