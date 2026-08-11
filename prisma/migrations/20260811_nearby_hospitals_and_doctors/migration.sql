-- Create extension for UUID generation if not existing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    osm_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_emergency BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    experience_years INT,
    consultation_fee INT,
    available_slots JSONB
);

-- Seed Realistic Doctor Data across varied specialties and hospital place names
INSERT INTO doctors (hospital_name, name, specialty, qualification, experience_years, consultation_fee, available_slots)
VALUES 
  ('General Hospital', 'Dr. Arvind Sharma', 'Cardiology', 'MBBS, MD, DM (Cardiology)', 14, 800, '["09:30 AM", "11:00 AM", "03:30 PM", "05:00 PM"]'::jsonb),
  ('General Hospital', 'Dr. Sunita Deshmukh', 'General Physician', 'MBBS, MD (Internal Medicine)', 10, 500, '["10:00 AM", "12:00 PM", "02:30 PM", "06:00 PM"]'::jsonb),
  ('General Hospital', 'Dr. Rajesh Khanna', 'Pediatrics', 'MBBS, DCH, MD (Pediatrics)', 12, 600, '["09:00 AM", "11:30 AM", "04:00 PM"]'::jsonb),
  ('City Emergency Center', 'Dr. Meera Nambiar', 'Neurology', 'MBBS, DNB, DM (Neurology)', 16, 950, '["10:30 AM", "01:00 PM", "04:30 PM"]'::jsonb),
  ('City Emergency Center', 'Dr. Vikramaditya Rao', 'General Physician', 'MBBS, MD', 8, 450, '["08:30 AM", "10:30 AM", "02:00 PM", "05:30 PM"]'::jsonb),
  ('Apollo Specialty Clinic', 'Dr. Ananya Iyer', 'Cardiology', 'MBBS, FACC (USA), DM', 15, 1100, '["09:00 AM", "12:30 PM", "03:00 PM"]'::jsonb),
  ('Apollo Specialty Clinic', 'Dr. Siddharth Sen', 'Orthopedics', 'MBBS, MS (Orthopedics)', 11, 750, '["11:00 AM", "02:00 PM", "05:00 PM"]'::jsonb),
  ('Sunshine Childrens Clinic', 'Dr. Priya Sundaram', 'Pediatrics', 'MBBS, MD, Fellow Pediatric Care', 9, 600, '["09:30 AM", "11:30 AM", "04:00 PM", "06:30 PM"]'::jsonb),
  ('St. Johns Medical Center', 'Dr. Robert D Souza', 'General Physician', 'MBBS, DNB (Family Medicine)', 13, 550, '["10:00 AM", "01:30 PM", "03:30 PM"]'::jsonb),
  ('St. Johns Medical Center', 'Dr. Kavitha Raman', 'Neurology', 'MBBS, MD, MCh (Neurosurgery)', 18, 1200, '["11:30 AM", "03:00 PM", "06:00 PM"]'::jsonb),
  ('Fortis Heart & Care Clinic', 'Dr. Sameer Kapoor', 'Cardiology', 'MBBS, MD, FESC', 17, 1000, '["09:00 AM", "11:00 AM", "02:30 PM"]'::jsonb),
  ('Fortis Heart & Care Clinic', 'Dr. Pooja Nair', 'General Physician', 'MBBS, MD', 7, 500, '["10:00 AM", "12:30 PM", "04:00 PM"]'::jsonb)
ON CONFLICT DO NOTHING;
