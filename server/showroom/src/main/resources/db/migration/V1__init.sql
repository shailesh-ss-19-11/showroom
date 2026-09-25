CREATE TABLE admin (
    id         UUID PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'STAFF' CHECK (role IN ('OWNER', 'STAFF')),
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE bike (
    id                    UUID PRIMARY KEY,
    name                  VARCHAR(255)   NOT NULL,
    brand                 VARCHAR(255)   NOT NULL,
    category              VARCHAR(100)   NOT NULL,
    price                 NUMERIC(14, 2) NOT NULL,
    battery_capacity_kwh  DOUBLE PRECISION,
    range_km              DOUBLE PRECISION,
    charging_time_hours   DOUBLE PRECISION,
    top_speed_kmph        DOUBLE PRECISION,
    power                 VARCHAR(255),
    description           TEXT,
    featured              BOOLEAN        NOT NULL DEFAULT false,
    is_active             BOOLEAN        NOT NULL DEFAULT true,
    created_at            TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at            TIMESTAMP      NOT NULL DEFAULT now()
);

CREATE INDEX idx_bike_brand ON bike (brand);
CREATE INDEX idx_bike_category ON bike (category);

CREATE TABLE bike_color (
    id       UUID PRIMARY KEY,
    bike_id  UUID         NOT NULL REFERENCES bike (id) ON DELETE CASCADE,
    name     VARCHAR(255) NOT NULL,
    hex_code VARCHAR(20)  NOT NULL
);

CREATE TABLE bike_image (
    id         UUID PRIMARY KEY,
    bike_id    UUID         NOT NULL REFERENCES bike (id) ON DELETE CASCADE,
    color_id   UUID         REFERENCES bike_color (id) ON DELETE SET NULL,
    url        VARCHAR(1024) NOT NULL,
    is_primary BOOLEAN      NOT NULL DEFAULT false,
    sort_order INT          NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE enquiry (
    id         UUID PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    phone      VARCHAR(50)  NOT NULL,
    email      VARCHAR(255),
    message    TEXT,
    bike_id    UUID         REFERENCES bike (id) ON DELETE SET NULL,
    source     VARCHAR(50)  NOT NULL DEFAULT 'contact',
    status     VARCHAR(20)  NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED')),
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE booking (
    id             UUID PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    phone          VARCHAR(50)  NOT NULL,
    email          VARCHAR(255),
    preferred_date TIMESTAMP    NOT NULL,
    notes          TEXT,
    bike_id        UUID         REFERENCES bike (id) ON DELETE SET NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    created_at     TIMESTAMP    NOT NULL DEFAULT now()
);
