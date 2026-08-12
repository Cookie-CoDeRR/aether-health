export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  address: string;
  phoneNumber: string | null;
  photoUrl: string | null;
  available: boolean;
  hprId?: string;
  registrationNumber?: string;
  councilName?: string;
  qualifications?: string;
  isAbdmVerified?: boolean;
  consultationFee?: number;
  availableSlots?: string[];
  createdAt: Date;
}
