-- Migration 006: Add university-scoped student ID and atomic sequence counter

-- 1. Add student_id column to student_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS student_id VARCHAR(100);

-- 2. Create university_student_sequences table for atomic sequence increments
CREATE TABLE IF NOT EXISTS university_student_sequences (
    university_normalized VARCHAR(255) PRIMARY KEY,
    last_sequence_number INTEGER NOT NULL DEFAULT 0,
    prefix VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create unique index for university + student_id combination (scoped to university)
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_univ_student_id 
ON student_profiles (LOWER(TRIM(university)), student_id)
WHERE student_id IS NOT NULL;

-- 4. Backfill existing demo student and faculty to 'MSU' with 'MSU-000001'
DO $$
DECLARE
    demo_stu_user_id UUID;
    demo_fac_user_id UUID;
BEGIN
    -- Locate demo student
    SELECT id INTO demo_stu_user_id FROM users WHERE email = 'student@university.edu';
    IF demo_stu_user_id IS NOT NULL THEN
        UPDATE student_profiles 
        SET university = 'MSU', 
            student_id = 'MSU-000001'
        WHERE user_id = demo_stu_user_id;

        INSERT INTO university_student_sequences (university_normalized, last_sequence_number, prefix)
        VALUES ('msu', 1, 'MSU')
        ON CONFLICT (university_normalized) 
        DO UPDATE SET last_sequence_number = GREATEST(university_student_sequences.last_sequence_number, 1);
    END IF;

    -- Locate demo faculty
    SELECT id INTO demo_fac_user_id FROM users WHERE email = 'professor@university.edu';
    IF demo_fac_user_id IS NOT NULL THEN
        UPDATE faculty_profiles 
        SET university = 'MSU'
        WHERE user_id = demo_fac_user_id;
    END IF;
END $$;
