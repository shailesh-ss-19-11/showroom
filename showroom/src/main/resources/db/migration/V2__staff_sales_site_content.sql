-- Staff assignment on enquiries and bookings
ALTER TABLE enquiry ADD COLUMN assigned_to UUID REFERENCES admin (id) ON DELETE SET NULL;
ALTER TABLE booking ADD COLUMN assigned_to UUID REFERENCES admin (id) ON DELETE SET NULL;

CREATE INDEX idx_enquiry_assigned_to ON enquiry (assigned_to);
CREATE INDEX idx_booking_assigned_to ON booking (assigned_to);

-- Sales / orders — covers both "mark as sold" tracking and basic invoicing
CREATE TABLE sale (
    id             UUID PRIMARY KEY,
    bike_id        UUID           REFERENCES bike (id) ON DELETE SET NULL,
    customer_name  VARCHAR(255)   NOT NULL,
    customer_phone VARCHAR(50)    NOT NULL,
    customer_email VARCHAR(255),
    sale_price     NUMERIC(14, 2) NOT NULL,
    payment_status VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'REFUNDED')),
    sale_date      TIMESTAMP      NOT NULL DEFAULT now(),
    invoice_number VARCHAR(30)    NOT NULL UNIQUE,
    notes          TEXT,
    enquiry_id     UUID           REFERENCES enquiry (id) ON DELETE SET NULL,
    booking_id     UUID           REFERENCES booking (id) ON DELETE SET NULL,
    sold_by        UUID           REFERENCES admin (id) ON DELETE SET NULL,
    created_at     TIMESTAMP      NOT NULL DEFAULT now()
);

CREATE INDEX idx_sale_bike ON sale (bike_id);
CREATE INDEX idx_sale_sold_by ON sale (sold_by);

-- Homepage content, editable from the admin panel instead of hardcoded copy
CREATE TABLE site_content (
    id                  UUID PRIMARY KEY,
    hero_eyebrow        VARCHAR(255),
    hero_heading_line1  VARCHAR(100),
    hero_heading_line2  VARCHAR(100),
    hero_heading_line3  VARCHAR(100),
    hero_subtext        TEXT,
    hero_image_url      VARCHAR(1024),
    stat1_value         VARCHAR(20),
    stat1_label         VARCHAR(100),
    stat2_value         VARCHAR(20),
    stat2_label         VARCHAR(100),
    stat3_value         VARCHAR(20),
    stat3_label         VARCHAR(100),
    updated_at          TIMESTAMP NOT NULL DEFAULT now()
);
