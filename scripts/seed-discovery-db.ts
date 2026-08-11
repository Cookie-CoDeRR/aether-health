import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const SEED_DOCTORS = [
  {
    hospitalName: "General Hospital",
    name: "Dr. Arvind Sharma",
    specialty: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    experienceYears: 14,
    consultationFee: 800,
    availableSlots: ["09:30 AM", "11:00 AM", "03:30 PM", "05:00 PM"],
  },
  {
    hospitalName: "General Hospital",
    name: "Dr. Sunita Deshmukh",
    specialty: "General Physician",
    qualification: "MBBS, MD (Internal Medicine)",
    experienceYears: 10,
    consultationFee: 500,
    availableSlots: ["10:00 AM", "12:00 PM", "02:30 PM", "06:00 PM"],
  },
  {
    hospitalName: "General Hospital",
    name: "Dr. Rajesh Khanna",
    specialty: "Pediatrics",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experienceYears: 12,
    consultationFee: 600,
    availableSlots: ["09:00 AM", "11:30 AM", "04:00 PM"],
  },
  {
    hospitalName: "City Emergency Center",
    name: "Dr. Meera Nambiar",
    specialty: "Neurology",
    qualification: "MBBS, DNB, DM (Neurology)",
    experienceYears: 16,
    consultationFee: 950,
    availableSlots: ["10:30 AM", "01:00 PM", "04:30 PM"],
  },
  {
    hospitalName: "City Emergency Center",
    name: "Dr. Vikramaditya Rao",
    specialty: "General Physician",
    qualification: "MBBS, MD",
    experienceYears: 8,
    consultationFee: 450,
    availableSlots: ["08:30 AM", "10:30 AM", "02:00 PM", "05:30 PM"],
  },
  {
    hospitalName: "Apollo Specialty Clinic",
    name: "Dr. Ananya Iyer",
    specialty: "Cardiology",
    qualification: "MBBS, FACC (USA), DM",
    experienceYears: 15,
    consultationFee: 1100,
    availableSlots: ["09:00 AM", "12:30 PM", "03:00 PM"],
  },
  {
    hospitalName: "Apollo Specialty Clinic",
    name: "Dr. Siddharth Sen",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experienceYears: 11,
    consultationFee: 750,
    availableSlots: ["11:00 AM", "02:00 PM", "05:00 PM"],
  },
  {
    hospitalName: "Sunshine Childrens Clinic",
    name: "Dr. Priya Sundaram",
    specialty: "Pediatrics",
    qualification: "MBBS, MD, Fellow Pediatric Care",
    experienceYears: 9,
    consultationFee: 600,
    availableSlots: ["09:30 AM", "11:30 AM", "04:00 PM", "06:30 PM"],
  },
  {
    hospitalName: "St. Johns Medical Center",
    name: "Dr. Robert D Souza",
    specialty: "General Physician",
    qualification: "MBBS, DNB (Family Medicine)",
    experienceYears: 13,
    consultationFee: 550,
    availableSlots: ["10:00 AM", "01:30 PM", "03:30 PM"],
  },
  {
    hospitalName: "St. Johns Medical Center",
    name: "Dr. Kavitha Raman",
    specialty: "Neurology",
    qualification: "MBBS, MD, MCh (Neurosurgery)",
    experienceYears: 18,
    consultationFee: 1200,
    availableSlots: ["11:30 AM", "03:00 PM", "06:00 PM"],
  },
  {
    hospitalName: "Fortis Heart & Care Clinic",
    name: "Dr. Sameer Kapoor",
    specialty: "Cardiology",
    qualification: "MBBS, MD, FESC",
    experienceYears: 17,
    consultationFee: 1000,
    availableSlots: ["09:00 AM", "11:00 AM", "02:30 PM"],
  },
  {
    hospitalName: "Fortis Heart & Care Clinic",
    name: "Dr. Pooja Nair",
    specialty: "General Physician",
    qualification: "MBBS, MD",
    experienceYears: 7,
    consultationFee: 500,
    availableSlots: ["10:00 AM", "12:30 PM", "04:00 PM"],
  },
];

async function seed() {
  console.log("Seeding doctor discovery records...");
  for (const doc of SEED_DOCTORS) {
    await prisma.doctorRecord.create({
      data: {
        hospitalName: doc.hospitalName,
        name: doc.name,
        specialty: doc.specialty,
        qualification: doc.qualification,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        availableSlots: doc.availableSlots,
      },
    });
  }
  console.log("Discovery seeding complete!");
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
