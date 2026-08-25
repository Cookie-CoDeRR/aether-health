"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ShieldCheck,
  Building2,
  User,
  Upload,
  FileText,
  CheckCircle2,
  Award,
  Star,
  Clock,
  MapPin,
  GraduationCap,
  Save,
  ChevronLeft,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getActiveDoctorProfile,
  updateDoctorProfile,
  DoctorProfile,
  DoctorCertificate,
  VERIFIED_DOCTORS_REGISTRY,
} from "@/services/authService";

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile>(VERIFIED_DOCTORS_REGISTRY[0]);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospitalAffiliation, setHospitalAffiliation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [college, setCollege] = useState("");
  const [bio, setBio] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [consultingHours, setConsultingHours] = useState("");
  const [certificates, setCertificates] = useState<DoctorCertificate[]>([]);

  // Certificate Upload State
  const [newCertName, setNewCertName] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("National Medical Commission");
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const doc = getActiveDoctorProfile();
    if (doc) {
      setProfile(doc);
      setName(doc.name);
      setEmail(doc.email);
      setRegistrationNumber(doc.registrationNumber);
      setHospitalAffiliation(doc.hospitalAffiliation);
      setSpecialization(doc.specialization);
      setQualifications(doc.qualifications);
      setCollege(doc.college || "All India Institute of Medical Sciences (AIIMS), New Delhi");
      setBio(doc.bio || "");
      setClinicAddress(doc.clinicAddress || "Apollo Hospitals Cardiac Wing, Bangalore");
      setConsultingHours(doc.consultingHours || "Mon-Sat: 09:00 AM - 04:00 PM");
      setCertificates(doc.certificates || []);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateDoctorProfile({
      name,
      email,
      registrationNumber,
      hospitalAffiliation,
      specialization,
      qualifications,
      college,
      bio,
      clinicAddress,
      consultingHours,
      certificates,
    });
    setProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim()) return;

    const newCert: DoctorCertificate = {
      id: `cert-${Date.now()}`,
      name: newCertName.trim(),
      issuer: newCertIssuer,
      issuedDate: new Date().getFullYear().toString(),
      verified: true,
    };

    const updated = [...certificates, newCert];
    setCertificates(updated);
    setNewCertName("");
    updateDoctorProfile({ certificates: updated });
  };

  const handleRemoveCertificate = (id: string) => {
    const updated = certificates.filter((c) => c.id !== id);
    setCertificates(updated);
    updateDoctorProfile({ certificates: updated });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#F9FBF9] dark:bg-[#081511] text-[#064E3B] dark:text-[#ECFDF5] font-sans antialiased p-4 sm:p-6 lg:p-8 pb-32 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-4">
          <Link
            href="/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] hover:text-emerald-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Clinical Queue</span>
          </Link>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NMC Verified Practitioner</span>
          </span>
        </div>

        {/* Doctor Header Banner Card */}
        <div className="rounded-3xl border border-emerald-600/25 dark:border-[#10B981]/20 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 dark:from-[#0B1D17] dark:via-[#0F241E] dark:to-[#0B1D17] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#064E3B] dark:bg-[#10B981] font-serif text-2xl font-bold text-white dark:text-[#042F24] shadow-soft shrink-0">
              {name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("") || "DR"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  {name || "Dr. Anya Sharma"}
                </h1>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-[#064E3B]/80 dark:text-[#A7F3D0]/80 font-semibold mt-0.5">
                {specialization} • {qualifications}
              </p>
              <p className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 mt-0.5">
                {hospitalAffiliation} • License: {registrationNumber}
              </p>
            </div>
          </div>

          {/* Star Rating Badge */}
          <div className="flex flex-col items-start sm:items-end gap-1 bg-white/80 dark:bg-[#081511]/80 rounded-2xl p-3 border border-[#064E3B]/10 dark:border-white/5">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-sm text-[#064E3B] dark:text-[#ECFDF5]">
                {profile.rating || 4.9}
              </span>
              <span className="text-xs text-[#064E3B]/60 dark:text-white/50">
                ({profile.reviewCount || 184} Reviews)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-[#10B981]">
              Top 1% Rated Cardiologist
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-bold text-center animate-fade-in">
            ✓ Doctor profile & credentials updated successfully!
          </div>
        )}

        {/* Main Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Academic & Professional Credentials */}
          <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Academic & Medical Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Full Clinician Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  NMC Registration / License #
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs font-mono font-bold text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Medical College / University
                </label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. AIIMS New Delhi"
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Qualifications & Fellowships
                </label>
                <input
                  type="text"
                  required
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. MBBS, MD (Medicine), DM (Cardio)"
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Primary Specialization
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Hospital & Network Affiliation
                </label>
                <input
                  type="text"
                  required
                  value={hospitalAffiliation}
                  onChange={(e) => setHospitalAffiliation(e.target.value)}
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                Clinical Biography & Focus
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your clinical experience, special procedures, and research interests..."
                className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] p-3 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
              />
            </div>
          </div>

          {/* Section 2: Clinic & Consulting Availability */}
          <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                Clinic Address & Availability
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Clinic / OPD Suite Address
                </label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Suite 402, Cardiac Center..."
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#064E3B] dark:text-[#ECFDF5] mb-1">
                  Consulting Hours
                </label>
                <input
                  type="text"
                  value={consultingHours}
                  onChange={(e) => setConsultingHours(e.target.value)}
                  placeholder="Mon-Sat: 09:00 AM - 04:00 PM"
                  className="w-full rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2.5 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Verified Medical Certificates */}
          <div className="rounded-3xl border border-[#064E3B]/15 dark:border-white/10 bg-white dark:bg-[#0B1D17] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#064E3B]/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif text-base font-bold text-[#064E3B] dark:text-[#ECFDF5]">
                  Verified Medical Licenses & Degrees ({certificates.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-[#064E3B]/10 dark:border-white/5 bg-[#F9FBF9] dark:bg-[#0F241E] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-[#064E3B] dark:text-[#ECFDF5]">
                        {cert.name}
                      </span>
                      <span className="block text-[10.5px] text-[#064E3B]/60 dark:text-white/50">
                        Issuer: {cert.issuer} • Verified {cert.issuedDate}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(cert.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Certificate Mini Form */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Add license / degree certificate name..."
                className="flex-1 rounded-2xl border border-[#064E3B]/15 dark:border-white/15 bg-[#F9FBF9] dark:bg-[#0F241E] px-3.5 py-2 text-xs text-[#064E3B] dark:text-[#ECFDF5] focus:outline-none focus:border-[#064E3B]"
              />
              <button
                type="button"
                onClick={handleAddCertificate}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certificate</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#064E3B] dark:bg-[#10B981] hover:bg-[#043327] dark:hover:bg-[#059669] py-3.5 text-xs font-bold text-white dark:text-[#042F24] transition-all shadow-md hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Doctor Profile & Verification Details</span>
          </button>
        </form>
      </div>
    </div>
  );
}
