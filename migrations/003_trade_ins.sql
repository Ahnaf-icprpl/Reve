-- ===================================================================
-- Migration: 003_trade_ins.sql
-- Description: Customer wardrobe trade-ins, assessments, and offers
-- ===================================================================

CREATE TABLE IF NOT EXISTS trade_ins (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    gender VARCHAR(32) DEFAULT 'Unisex',
    size VARCHAR(32) NOT NULL,
    material TEXT,
    condition VARCHAR(64) NOT NULL, -- 'Like New', 'Excellent', 'Good', 'Fair'
    notes TEXT,
    photo_url TEXT,
    assessed_value_tokens INTEGER NOT NULL, -- Valuation offer in RT
    status VARCHAR(32) NOT NULL DEFAULT 'Offer Ready', -- 'Submitted', 'Under Review', 'Offer Ready', 'Credited', 'Declined'
    status_message TEXT,
    circular_outcome VARCHAR(128) DEFAULT 'Pending User Acceptance',
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trade_ins_user_id ON trade_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_ins_status ON trade_ins(status);
