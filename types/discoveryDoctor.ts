export interface DiscoveryDoctor {
  id: string;
  hospitalName: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  availableSlots: string[];
  rating?: number;
  photoUrl?: string;
}
