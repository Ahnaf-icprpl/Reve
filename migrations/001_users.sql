-- ===================================================================
-- Migration: 001_users.sql
-- Description: Production-grade users authentication, credentials, & profile schema
-- ===================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer', -- 'customer', 'staff', 'admin'
    is_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(64),
    street_address TEXT,
    city VARCHAR(128),
    state VARCHAR(64),
    postal_code VARCHAR(32),
    country VARCHAR(64) DEFAULT 'United States',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Seed initial founder / CEO user
INSERT INTO users (id, email, password_hash, salt, full_name, role, is_verified, street_address, city, state, postal_code)
VALUES (
    'usr-ahnaf-ceo',
    'ahnaf@reve.circular',
    '9ba0ea0bcc92ffcbdad8d4ad357975ff6029fef8db8725f5195cba0506ec43720f73be95ea06d6d76757c5a354fbfbec62dc8275ecd53d927df5be277b60b654',
    'a559af639a928e7e3f02e3c7ce9ccb37',
    'Ahnaf',
    'admin',
    TRUE,
    '100 Pine Street',
    'Seattle',
    'WA',
    '98101'
)
ON CONFLICT (email) DO NOTHING;
