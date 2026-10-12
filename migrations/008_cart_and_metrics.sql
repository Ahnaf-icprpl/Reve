-- ===================================================================
-- Migration: 008_cart_and_metrics.sql
-- Description: Cart items and platform metrics schema
-- ===================================================================

-- 1. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- 2. Platform Metrics Table
CREATE TABLE IF NOT EXISTS platform_metrics (
    key VARCHAR(64) PRIMARY KEY,
    value VARCHAR(64) NOT NULL
);
