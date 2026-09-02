-- 4. PROCTORING EVENTS TABLE
CREATE TABLE IF NOT EXISTS proctoring_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_proctoring_attempt ON proctoring_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_student ON proctoring_events(student_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_type ON proctoring_events(event_type);
