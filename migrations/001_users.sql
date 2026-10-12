-- ===================================================================
-- Migration: 001_users.sql
-- Description: User accounts, authentication credentials, and profiles
-- ===================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer', -- 'customer', 'staff', 'admin'
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
