CREATE TABLE time_slot (
    id         UUID PRIMARY KEY,
    slot_time  TIMESTAMP NOT NULL,
    capacity   INT       NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (slot_time)
);

CREATE INDEX idx_time_slot_time ON time_slot (slot_time);

ALTER TABLE booking ADD COLUMN slot_id UUID REFERENCES time_slot (id) ON DELETE SET NULL;
CREATE INDEX idx_booking_slot ON booking (slot_id);
