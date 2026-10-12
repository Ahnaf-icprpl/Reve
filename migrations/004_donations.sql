-- ===================================================================
-- Migration: 004_donations.sql
-- Description: Zero-landfill textile donations and damage assessments
-- ===================================================================

CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    item_count_label VARCHAR(64) NOT NULL, -- e.g. '6 garments'
    item_count_numeric INTEGER DEFAULT 1,
    damage_assessment VARCHAR(128) NOT NULL, -- 'Minor or No Damage (Circle Less)', 'Moderately Damaged (Circle Less)', etc.
    drop_off_method VARCHAR(128) NOT NULL, -- 'Prepaid Eco-Shipping Label', 'Local Hub Drop-off', etc.
    tracking_number VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'Pass Generated', -- 'Pass Generated', 'In Transit', 'Processed & Recycled'
    textiles_diverted_kg NUMERIC(6, 2) DEFAULT 0,
    water_saved_liters INTEGER DEFAULT 0,
    landfill_diverted_pct INTEGER DEFAULT 100,
    beneficiary_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_categories (
    id SERIAL PRIMARY KEY,
    donation_id VARCHAR(64) NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    category_name VARCHAR(128) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_tracking ON donations(tracking_number);
