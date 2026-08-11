export interface Hospital {
  id: string;
  osmId: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
  type: "hospital" | "clinic" | "emergency" | "doctors";
  isEmergency: boolean;
  distanceKm?: number;
}
