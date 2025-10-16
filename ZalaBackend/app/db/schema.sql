-- drop types
DROP TYPE IF EXISTS user_role;
-- drop tables
DROP TABLE IF EXISTS lead_properties;
DROP TABLE IF EXISTS user_properties;
DROP TABLE IF EXISTS user_authentication;
DROP TABLE IF EXISTS units;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS addresses;


-- create tables
CREATE TABLE contacts (
    contact_id      SERIAL PRIMARY KEY,
    first_name      TEXT NOT NULL,
    last_name       TEXT,
    email           TEXT UNIQUE,
    phone           VARCHAR(20)
);

CREATE TABLE addresses (
    address_id      SERIAL PRIMARY KEY,
    street_1        TEXT NOT NULL,
    street_2        TEXT,
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    zipcode         VARCHAR(10) NOT NULL,
    lat             NUMERIC(9, 6),
    long            NUMERIC(9, 6)
);

CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    contact_id      INTEGER REFERENCES contacts(contact_id),    -- connects to lead through contact_id
    username        VARCHAR(15) UNIQUE,
    role            VARCHAR(20) NOT NULL DEFAULT 'user',
    profile_pic     TEXT,
    xp              INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ
);

CREATE TABLE leads (
    lead_id         SERIAL PRIMARY KEY,
    created_by      INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    contact_id      INTEGER REFERENCES contacts(contact_id),
    address_id      INTEGER REFERENCES addresses(address_id),
    person_type     TEXT,
    business        TEXT,
    website         TEXT,
    license_num     TEXT,
    notes           TEXT
);

CREATE TABLE user_authentication (
    user_id         INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    password_hash   TEXT NOT NULL
);

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

CREATE TABLE properties (
    property_id     SERIAL PRIMARY KEY,
    property_name   TEXT NOT NULL,
    address_id      INTEGER REFERENCES addresses(address_id),
    mls_number      TEXT UNIQUE
);

CREATE TABLE units (
    unit_id         SERIAL PRIMARY KEY,
    property_id     INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE, -- Added FK and ON DELETE
    apt_num         TEXT,
    bedrooms        INTEGER,
    bath            NUMERIC(3, 1),
    sqft            INTEGER,
    notes           TEXT
);

CREATE TABLE user_properties (
    user_id         INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    property_id     INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, property_id)
);

CREATE TABLE lead_properties (
    lead_id         INTEGER REFERENCES leads(lead_id) ON DELETE CASCADE,
    property_id     INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, property_id)
);