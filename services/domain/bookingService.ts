import { Doctor } from "@/types/doctor";
import { Appointment } from "@/types/appointment";

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_1",
    name: "Dr. Ananya Sharma",
    specialty: "Cardiology",
    rating: 4.9,
    distance: 2.4,
    address: "Apollo Heart Center, MG Road, Indiranagar",
    phoneNumber: "+91 98765 43210",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
  {
    id: "doc_2",
    name: "Dr. Rajesh Kumar",
    specialty: "Pulmonology",
    rating: 4.7,
    distance: 4.1,
    address: "Chest & Breathing Clinic, Koramangala 4th Block",
    phoneNumber: "+91 98765 12345",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
  {
    id: "doc_3",
    name: "Dr. Meera Nambiar",
    specialty: "Neurology",
    rating: 4.8,
    distance: 5.8,
    address: "Brain & Spine Institute, HSR Layout Sector 1",
    phoneNumber: "+91 98123 45678",
    photoUrl: "https://images.unsplash.com/photo-1594824813566-78a9c396860f?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
  {
    id: "doc_4",
    name: "Dr. Vikramaditya Rao",
    specialty: "General Practice",
    rating: 4.6,
    distance: 1.2,
    address: "City Health Care Family Clinic, Whitefield",
    phoneNumber: "+91 97654 32109",
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
  {
    id: "doc_5",
    name: "Dr. Priya Sundaram",
    specialty: "Pediatrics",
    rating: 4.9,
    distance: 3.5,
    address: "Sunshine Children's Hospital, Jayanagar",
    phoneNumber: "+91 99887 76655",
    photoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
  {
    id: "doc_6",
    name: "Dr. Siddharth Sen",
    specialty: "Orthopedics",
    rating: 4.5,
    distance: 8.2,
    address: "Joint Care & Sports Injury Clinic, Domlur",
    phoneNumber: "+91 91234 56789",
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80",
    available: true,
    createdAt: new Date(),
  },
];

export interface CreateBookingInput {
  userId: string;
  doctorId: string;
  slotTime: Date;
  notes?: string;
}

/**
 * Asynchronously fetches doctors list (mocked internally)
 */
export async function getDoctorsList(): Promise<Doctor[]> {
  // Simulate short async API delay
  await new Promise((res) => setTimeout(res, 100));
  return MOCK_DOCTORS;
}

/**
 * Asynchronously creates an Appointment record (mocked: true internally)
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<Appointment> {
  await new Promise((res) => setTimeout(res, 200));

  const newAppointment: Appointment = {
    id: `app_${Date.now()}`,
    userId: input.userId,
    doctorId: input.doctorId,
    slotTime: input.slotTime,
    status: "requested",
    mocked: true, // Internal flag — not exposed in user UI copy
    notes: input.notes || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newAppointment;
}
