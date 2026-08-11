"use client";

import { useState, useEffect } from "react";
import { searchMedicines, MedicineWithPrices } from "@/services/domain/medicineService";

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
  sourceDataset?: string;
}

const INITIAL_HOSPITAL_PRESCRIPTIONS: PrescribedMedication[] = [
  {
    id: "hosp_rx_1",
    brandName: "Amoxicillin Trihydrate",
    genericName: "Amoxicillin 500mg Capsule",
    dosage: "500 mg",
    frequency: "Twice daily after food (Morning & Evening)",
    totalDoses: 14,
    dosesRemaining: 10,
    takenToday: false,
    hospitalName: "Apollo Specialty Hospital EHR",
  },
  {
    id: "hosp_rx_2",
    brandName: "Metformin Hydrochloride",
    genericName: "Metformin 500mg Extended Release",
    dosage: "500 mg",
    frequency: "Once daily with dinner",
    totalDoses: 30,
    dosesRemaining: 24,
    takenToday: true,
    takenAt: "08:15 AM Today",
    hospitalName: "St. Johns Medical Center API",
  },
  {
    id: "hosp_rx_3",
    brandName: "Atorvastatin Calcium",
    genericName: "Atorvastatin 10mg Tablet",
    dosage: "10 mg",
    frequency: "Once daily at bedtime",
    totalDoses: 20,
    dosesRemaining: 16,
    takenToday: false,
    hospitalName: "City Emergency Health Network",
  },
];

export default function MedicinesPage() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<MedicineWithPrices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>(
    INITIAL_HOSPITAL_PRESCRIPTIONS
  );

  // Manual Medication Add Modal state
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
            takenAt: nextTaken ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today" : undefined,
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
      hospitalName: newHospitalName || "Self-Prescribed / Personal Entry",
    };

    setPrescriptions((prev) => [newMed, ...prev]);
    setIsAddModalOpen(false);

    // Reset form
    setNewBrandName("");
    setNewGenericName("");
    setNewDosage("");
    setNewFrequency("");
    setNewTotalDoses(30);
    setNewHospitalName("");
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 lg:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[rgba(246,241,233,0.09)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-[#E8674A] font-mono font-semibold mb-1 flex items-center gap-2">
            <span>💊 OpenFDA API & Hospital Sync</span>
            <span>•</span>
            <span>Live Telemetry</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-[0.01em] text-[#F6F1E9]">
            Active Medications & OpenFDA Lookup
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#E8674A] px-4.5 py-2.5 text-xs font-semibold text-[#0A1620] hover:brightness-110 transition-all shadow-md shrink-0"
        >
          <span>➕ Add Prescription Manually</span>
        </button>
      </div>

      {/* External Hospital Prescriptions & Medication Tracker Checklist */}
      <div className="rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-0.5 font-mono text-[10px] font-bold uppercase">
                Active Prescription Tracker
              </span>
            </div>
            <h2 className="font-serif text-xl font-medium text-[#F6F1E9] mt-1">
              Daily Medication Cross-Off & Inventory Tracker
            </h2>
            <p className="text-xs text-[#7C8A93] mt-0.5">
              Click the checkbox to cross off completed daily doses and automatically update remaining pill counts.
            </p>
          </div>

          <span className="font-mono text-xs text-[#4F9D8C] bg-[#4F9D8C]/10 px-3 py-1.5 rounded-lg border border-[#4F9D8C]/20 self-start sm:self-center font-bold">
            {prescriptions.filter((p) => p.takenToday).length} / {prescriptions.length} Doses Taken Today
          </span>
        </div>

        {/* Prescription Task List */}
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
                    ? "border-[#4F9D8C]/30 bg-[#132A38]/40"
                    : "border-[rgba(246,241,233,0.09)] bg-[#132A38]"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDoseTaken(med.id)}
                      className={`h-6 w-6 rounded-md border flex items-center justify-center transition-all ${
                        med.takenToday
                          ? "bg-[#4F9D8C] border-[#4F9D8C] text-[#0A1620]"
                          : "border-[rgba(246,241,233,0.3)] bg-[#0F2130] hover:border-[#E8674A]"
                      }`}
                    >
                      {med.takenToday && <span className="font-bold text-xs">✓</span>}
                    </button>

                    <div>
                      <h3
                        className={`font-serif text-base font-medium transition-all ${
                          med.takenToday
                            ? "line-through text-[#7C8A93]"
                            : "text-[#F6F1E9]"
                        }`}
                      >
                        {med.brandName} ({med.dosage})
                      </h3>
                      <span className="text-xs font-mono text-[#E8674A]">
                        {med.genericName}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#B9C4CC] font-sans pl-9">
                    📌 {med.frequency}
                  </p>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-[#7C8A93] pl-9">
                    <span>🏥 {med.hospitalName}</span>
                    {med.takenToday && (
                      <span className="text-[#4F9D8C] font-semibold">
                        ✓ Taken at {med.takenAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remaining Doses Indicator */}
                <div className="sm:text-right shrink-0 font-mono space-y-1 pl-9 sm:pl-0 border-t sm:border-t-0 border-[rgba(246,241,233,0.09)] pt-2 sm:pt-0">
                  <div className="flex sm:flex-col justify-between sm:items-end gap-1">
                    <span className="text-[10px] text-[#7C8A93] uppercase">Remaining Inventory</span>
                    <span className="text-sm font-bold text-[#F6F1E9]">
                      {med.dosesRemaining} / {med.totalDoses} pills
                    </span>
                  </div>

                  <div className="h-2 w-36 bg-[#0F2130] rounded-full overflow-hidden border border-[rgba(246,241,233,0.09)]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        percentRemaining < 30 ? "bg-[#E8674A]" : "bg-[#4F9D8C]"
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

      {/* Search Bar for OpenFDA Comparative Pricing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-[#F6F1E9]">
            Search Free OpenFDA Public Drug Dataset & Generic Price Comparison
          </h2>
          <span className="font-mono text-[10px] uppercase text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/20">
            OpenFDA API Connected
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search OpenFDA by brand name, generic name, active ingredient (e.g. Ibuprofen, Amoxicillin, Metformin)..."
            className="w-full rounded-xl border border-[rgba(246,241,233,0.16)] bg-[#132A38] px-4 py-3 pl-11 text-sm text-[#F6F1E9] placeholder-[#7C8A93] focus:outline-none focus:border-[#E8674A]"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-3.5 text-[#7C8A93]"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Medicine Cards List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8674A] border-t-transparent" />
        </div>
      ) : medicines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(246,241,233,0.16)] p-12 text-center text-xs font-mono text-[#7C8A93]">
          No medicines found matching &quot;{query}&quot;. Try searching for a generic ingredient like Paracetamol, Ibuprofen, or Metformin.
        </div>
      ) : (
        <div className="space-y-4">
          {medicines.map((med) => {
            const minPrice = Math.min(...med.prices.map((p) => p.price));

            return (
              <div
                key={med.id}
                className="rounded-xl border border-[rgba(246,241,233,0.09)] bg-[#132A38] p-5 space-y-4 hover:border-[#E8674A]/40 transition-colors"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(246,241,233,0.09)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-medium text-[#F6F1E9]">{med.brandName}</h2>
                      {med.sourceDataset && (
                        <span className="font-mono text-[9px] uppercase font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/20">
                          {med.sourceDataset}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-[#7C8A93]">Generic equivalent:</span>
                      <span className="font-semibold text-[#E8674A]">{med.genericName}</span>
                    </div>
                  </div>
                  <span className="self-start sm:self-center rounded bg-[#4F9D8C] px-2.5 py-1 font-mono text-xs font-semibold text-white">
                    {med.drugClass}
                  </span>
                </div>

                {/* Details */}
                <div className="grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7C8A93]">Active Ingredient</span>
                    <p className="font-mono text-[#F6F1E9] pt-0.5">{med.activeIngredient}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#7C8A93]">Labeling Summary & Purpose</span>
                    <p className="text-[#B9C4CC] pt-0.5 leading-relaxed font-sans">{med.description || "N/A"}</p>
                  </div>
                </div>

                {/* Comparative Price Display */}
                <div className="rounded-lg border border-[rgba(246,241,233,0.09)] bg-[#0F2130] p-3 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#7C8A93]">
                      Comparative Pharmacy Prices
                    </span>
                    <span className="text-[#4F9D8C] font-bold text-[11px]">
                      Lowest: ₹{minPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                    {med.prices.map((price) => (
                      <div
                        key={price.id}
                        className={`rounded-lg border p-2 text-center text-xs ${
                          price.price === minPrice
                            ? "border-[#4F9D8C] bg-[#4F9D8C]/20 text-[#F6F1E9] font-bold"
                            : "border-[rgba(246,241,233,0.09)] bg-[#132A38] text-[#B9C4CC]"
                        }`}
                      >
                        <p className="text-[11px] text-[#7C8A93] truncate">{price.pharmacyName}</p>
                        <p className="text-sm pt-0.5">₹{price.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[rgba(246,241,233,0.16)] bg-[#0F2130] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(246,241,233,0.09)] pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-[#F6F1E9]">
                  Add Prescription Manually
                </h3>
                <p className="text-xs text-[#7C8A93]">Enter medication details for daily tracking</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#7C8A93] hover:text-[#F6F1E9]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lipitor, Augmentin, Metformin"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                  Generic Active Ingredient
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atorvastatin 20mg"
                  value={newGenericName}
                  onChange={(e) => setNewGenericName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20 mg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                    Total Doses (Pills)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTotalDoses}
                    onChange={(e) => setNewTotalDoses(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                  Frequency / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Once daily after dinner"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-[#7C8A93] mb-1">
                  Prescribed By / Facility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Personal Prescription / Dr. Sharma"
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  className="w-full rounded-lg border border-[rgba(246,241,233,0.16)] bg-[#132A38] p-2.5 text-xs text-[#F6F1E9] focus:outline-none focus:border-[#E8674A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(246,241,233,0.09)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs text-[#7C8A93] hover:text-[#F6F1E9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#E8674A] px-5 py-2 text-xs font-semibold text-[#0A1620] hover:brightness-108 transition-all"
                >
                  Save & Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
