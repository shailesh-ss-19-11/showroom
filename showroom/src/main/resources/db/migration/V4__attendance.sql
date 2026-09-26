CREATE TABLE attendance (
    id         UUID PRIMARY KEY,
    admin_id   UUID         NOT NULL REFERENCES admin (id) ON DELETE CASCADE,
    work_date  DATE         NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'PRESENT'
        CHECK (status IN ('PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY')),
    notes      TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (admin_id, work_date)
);

CREATE INDEX idx_attendance_date ON attendance (work_date);
