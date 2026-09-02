-- Migration 005: Add university column to student_profiles and faculty_profiles
-- Supports case-insensitive and whitespace-tolerant matching for institutional student isolation

-- 1. Add university column to student_profiles and faculty_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS university VARCHAR(255);
ALTER TABLE faculty_profiles ADD COLUMN IF NOT EXISTS university VARCHAR(255);

-- 2. Create functional indexes for fast case-insensitive, trimmed lookup
CREATE INDEX IF NOT EXISTS idx_student_profiles_university_norm ON student_profiles (LOWER(TRIM(university)));
CREATE INDEX IF NOT EXISTS idx_faculty_profiles_university_norm ON faculty_profiles (LOWER(TRIM(university)));

-- 3. Backfill default seeded accounts if university is null
UPDATE student_profiles SET university = 'MSU' WHERE university IS NULL;
UPDATE faculty_profiles SET university = 'MSU' WHERE university IS NULL;
