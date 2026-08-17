"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { searchMedicines, MedicineWithPrices } from "@/services/domain/medicineService";
import {
  Pill,
  Search,
  Plus,
  Check,
  Building2,
  Clock,
  ShieldCheck,
  Tag,
  ArrowLeft,
  X,
} from "lucide-react";

interface PrescribedMedication {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  totalDoses: number;
  dosesRemaining: number;
  takenToday: boolean;
  takenAt?: string;
  hospitalName: string;
}

const INITIAL_PRESCRIPTIONS: PrescribedMedication[] = [
  {
    id: "hosp_rx_1",
    brandName: "Crocin 650",
    genericName: "Paracetamol 650mg Tablet",
    dosage: "650 mg",
    frequency: "Twice daily after meals",
    totalDoses: 14,
    dosesRemaining: 10,
    takenToday: true,
    takenAt: "08:15 AM",
    hospitalName: "Apollo Specialty Hospital",
  },
  {
    id: "hosp_rx_2",
    brandName: "Glycomet 500",
    genericName: "Metformin HCl 500mg",
    dosage: "500 mg",
    frequency: "Once daily with dinner",
    totalDoses: 30,
    dosesRemaining: 24,
    takenToday: false,
    hospitalName: "St. Johns Medical Center",
  },
  {
    id: "hosp_rx_3",
    brandName: "Lipivas 10",
    genericName: "Atorvastatin 10mg Tablet",
    dosage: "10 mg",
    frequency: "Once daily at bedtime",
    totalDoses: 20,
    dosesRemaining: 16,
    takenToday: false,
    hospitalName: "City Care Network",
  },
];

export default function MedicinesPage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<MedicineWithPrices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>(
    INITIAL_PRESCRIPTIONS
  );

  // Manual Add Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newGenericName, setNewGenericName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newFrequency, setNewFrequency] = useState("");
  const [newTotalDoses, setNewTotalDoses] = useState<number>(30);
  const [newHospitalName, setNewHospitalName] = useState("");

  useEffect(() => {
    setIsLoading(true);
    searchMedicines(query).then((data) => {
      setMedicines(data);
      setIsLoading(false);
    });
  }, [query]);

  const toggleDoseTaken = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextTaken = !item.takenToday;
          const nextRemaining = nextTaken
            ? Math.max(0, item.dosesRemaining - 1)
            : item.dosesRemaining + 1;
          return {
            ...item,
            takenToday: nextTaken,
            dosesRemaining: nextRemaining,
            takenAt: nextTaken
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;

    const newMed: PrescribedMedication = {
      id: `manual_rx_${Date.now()}`,
      brandName: newBrandName,
      genericName: newGenericName || newBrandName,
      dosage: newDosage || "1 Dose",
      frequency: newFrequency || "Daily as directed",
      totalDoses: newTotalDoses || 30,
      dosesRemaining: newTotalDoses || 30,
      takenToday: false,
      hospitalName: newHospitalName || "Personal Entry",
    };

    setPrescriptions((prev) => [newMed, ...prev]);
    setIsAddModalOpen(false);

    setNewBrandName("");
    setNewGenericName("");
    setNewDosage("");
    setNewFrequency("");
    setNewTotalDoses(30);
    setNewHospitalName("");
  };

  const takenCount = prescriptions.filter((p) => p.takenToday).length;

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto text-[#064E3B] dark:text-[#ECFDF5] w-full pb-44 sm:pb-52 transition-colors">
      {/* Header */}
      <div className="border-b border-[#064E3B]/15 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B]/70 dark:text-[#10B981] mb-1 flex items-center gap-2">
            <span>Prescription Care</span>
            <span>•</span>
            <span className="text-[#064E3B]/60 dark:text-white/50">Dosage Schedule & Pharmacy Price Comparison</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B] dark:text-[#ECFDF5]">
            Prescriptions & Medicines
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-4.5 py-2.5 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all shrink-0 min-tap-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prescription</span>
        </button>
      </div>

      {/* Active Prescription Tracker Card */}
      <div className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#064E3B]/15 dark:border-white/10 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
              Daily Medication Dosing Tracker
            </h2>
            <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 mt-0.5">
              Cross off completed daily doses to update your remaining inventory automatically.
            </p>
          </div>

          <span className="text-xs font-bold text-[#064E3B] dark:text-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] px-3 py-1.5 rounded-full border border-[#064E3B]/20 dark:border-white/15 self-start sm:self-center">
            {takenCount} of {prescriptions.length} Completed Today
          </span>
        </div>

        {/* Prescription List */}
        <div className="space-y-3">
          {prescriptions.map((med) => {
            const percentRemaining = Math.round(
              (med.dosesRemaining / med.totalDoses) * 100
            );

            return (
              <div
                key={med.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  med.takenToday
                    ? "border-[#064E3B]/20 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E]/60 opacity-80"
                    : "border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0F241E] hover:border-[#064E3B] dark:hover:border-[#10B981]"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDoseTaken(med.id)}
                      aria-label={`Mark ${med.brandName} as ${med.takenToday ? "not taken" : "taken"}`}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all min-tap-target shrink-0 ${
                        med.takenToday
                          ? "bg-[#064E3B] dark:bg-[#10B981] border-[#064E3B] dark:border-[#10B981] text-white dark:text-[#042F24]"
                          : "border-[#064E3B]/20 dark:border-white/20 bg-[#F9FBF9] dark:bg-[#132D26] text-[#064E3B]/40 dark:text-white/40 hover:border-[#064E3B] dark:hover:border-[#10B981]"
                      }`}
                    >
                      <Check className={`w-5 h-5 ${med.takenToday ? "opacity-100" : "opacity-40"}`} />
                    </button>

                    <div>
                      <h3
                        className={`font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5] ${
                          med.takenToday ? "line-through text-[#064E3B]/50 dark:text-white/40" : ""
                        }`}
                      >
                        {med.brandName} ({med.dosage})
                      </h3>
                      <span className="text-xs text-[#064E3B] dark:text-[#10B981] font-bold">
                        {med.genericName}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 pl-12">
                    📌 {med.frequency}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#064E3B]/50 dark:text-white/40 pl-12">
                    <span>🏥 {med.hospitalName}</span>
                    {med.takenToday && med.takenAt && (
                      <span className="text-[#064E3B] dark:text-[#10B981] font-bold">
                        ✓ Taken at {med.takenAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remaining Inventory Pill Tracker */}
                <div className="sm:text-right shrink-0 space-y-1 pl-12 sm:pl-0 border-t sm:border-t-0 border-[#064E3B]/15 dark:border-white/10 pt-2 sm:pt-0">
                  <div className="flex sm:flex-col justify-between sm:items-end gap-1 text-xs">
                    <span className="text-[#064E3B]/70 dark:text-white/50">Remaining</span>
                    <span className="font-bold text-sm text-[#064E3B] dark:text-[#ECFDF5]">
                      {med.dosesRemaining} / {med.totalDoses} pills
                    </span>
                  </div>

                  <div className="h-2 w-32 bg-[#F9FBF9] dark:bg-[#132D26] rounded-full overflow-hidden border border-[#064E3B]/15 dark:border-white/10">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        percentRemaining < 30 ? "bg-rose-500" : "bg-[#064E3B] dark:bg-[#10B981]"
                      }`}
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar for Generic Pricing Comparison */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
          Generic Medicine & Pharmacy Price Comparison
        </h2>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064E3B]/50 dark:text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand name or active ingredient (e.g. Paracetamol, Metformin, Atorvastatin)..."
            className="w-full rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] pl-10 pr-4 py-3 text-sm text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981] shadow-xs"
          />
        </div>
      </div>

      {/* Medicine Cards List */}
      {isLoading ? (
        <div className="flex justify-center py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#064E3B] dark:border-[#10B981] border-t-transparent" />
        </div>
      ) : medicines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-10 text-center text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70 shadow-xs">
          No medicines found matching &quot;{query}&quot;. Try searching for Paracetamol, Ibuprofen, or Metformin.
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map((med) => {
            const minPrice = Math.min(...med.prices.map((p) => p.price));

            return (
              <div
                key={med.id}
                className="rounded-2xl border border-[#064E3B]/20 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-5 space-y-4 shadow-sm hover:border-[#064E3B] dark:hover:border-[#10B981] transition-all"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                        {med.brandName}
                      </h3>
                      <span className="rounded-full bg-[#F9FBF9] dark:bg-[#0F241E] border border-[#064E3B]/20 dark:border-white/15 text-[#064E3B] dark:text-[#10B981] px-2.5 py-0.5 text-xs font-bold">
                        {med.drugClass}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-[#064E3B]/70 dark:text-white/50">Active Generic:</span>
                      <span className="font-bold text-[#064E3B] dark:text-[#10B981]">{med.genericName}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#064E3B] dark:text-[#10B981] bg-[#F9FBF9] dark:bg-[#132D26] px-3 py-1 rounded-full border border-[#064E3B]/20 dark:border-white/15 self-start sm:self-center">
                    From ₹{minPrice.toFixed(2)}
                  </span>
                </div>

                {/* Details */}
                <div className="grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="font-bold text-[#064E3B]/70 dark:text-white/50 block mb-0.5">Active Ingredient</span>
                    <p className="text-[#064E3B] dark:text-[#ECFDF5] font-semibold">{med.activeIngredient}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#064E3B]/70 dark:text-white/50 block mb-0.5">Medical Purpose</span>
                    <p className="text-[#064E3B]/80 dark:text-[#A7F3D0]/80 leading-relaxed">{med.description || "Prescription medication"}</p>
                  </div>
                </div>

                {/* Comparative Price Display */}
                <div className="rounded-xl border border-[#064E3B]/15 dark:border-white/10 bg-[#F9FBF9] dark:bg-[#0F241E] p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70">
                      Compare Pharmacy Rates
                    </span>
                    <span className="text-[#064E3B] dark:text-[#10B981] font-bold text-xs">
                      Lowest: ₹{minPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                    {med.prices.map((price) => (
                      <div
                        key={price.id}
                        className={`rounded-xl border p-2.5 text-center text-xs ${
                          price.price === minPrice
                            ? "border-[#064E3B] dark:border-[#10B981] bg-white dark:bg-[#132D26] text-[#064E3B] dark:text-[#10B981] font-bold ring-1 ring-[#064E3B] dark:ring-[#10B981]"
                            : "border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] text-[#064E3B]/80 dark:text-[#ECFDF5]/80"
                        }`}
                      >
                        <p className="text-[11px] text-[#064E3B]/60 dark:text-white/50 truncate">{price.pharmacyName}</p>
                        <p className="text-sm font-bold pt-0.5">₹{price.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Prescription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#064E3B]/20 dark:border-white/15 bg-white dark:bg-[#0B1D17] p-6 shadow-2xl space-y-4 text-[#064E3B] dark:text-[#ECFDF5]">
            <div className="flex items-center justify-between border-b border-[#064E3B]/15 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Add Prescription
                </h3>
                <p className="text-xs text-[#064E3B]/70 dark:text-[#A7F3D0]/70">Track daily doses and refill inventory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crocin, Glycomet, Lipitor"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Generic Ingredient
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 650mg, Metformin 500mg"
                  value={newGenericName}
                  onChange={(e) => setNewGenericName(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] placeholder-[#064E3B]/40 dark:placeholder-white/40 focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                    Total Pills
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTotalDoses}
                    onChange={(e) => setNewTotalDoses(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Twice daily after food"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="font-bold text-[#064E3B] dark:text-[#ECFDF5] block mb-1">
                  Clinic / Prescribed By
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Hospital / Dr. Sharma"
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  className="w-full rounded-xl border border-[#064E3B]/20 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:bg-white dark:focus:bg-[#132D26] focus:outline-none focus:border-[#064E3B] dark:focus:border-[#10B981]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#064E3B]/15 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-[#064E3B]/70 dark:text-[#A7F3D0]/70 hover:text-[#064E3B] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] px-5 py-2 text-xs font-bold text-white dark:text-[#042F24] shadow-soft transition-all min-tap-target"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
