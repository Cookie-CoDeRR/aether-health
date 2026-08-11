export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  activeIngredient: string;
  drugClass: string;
  description: string | null;
  createdAt: Date;
}

export interface PriceEntry {
  id: string;
  medicineId: string;
  pharmacyName: string;
  price: number;
  currency: string;
  url?: string | null;
  updatedAt: Date;
}
