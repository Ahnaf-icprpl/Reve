-- ===================================================================
-- Migration: 002_products.sql
-- Description: Marketplace clothing catalog, materials, and eco savings
-- ===================================================================

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Outerwear', 'Knitwear', 'Bottoms', 'Tops', 'Dresses', 'Accessories'
    gender VARCHAR(32) NOT NULL DEFAULT 'Unisex', -- 'Men', 'Women', 'Unisex'
    size VARCHAR(32) NOT NULL,
    color VARCHAR(64) NOT NULL,
    condition VARCHAR(64) NOT NULL, -- 'Like New', 'Gently Used', 'Vintage', etc.
    condition_score VARCHAR(16) NOT NULL, -- e.g. '9.5/10'
    condition_notes TEXT,
    material TEXT NOT NULL,
    price_fiat NUMERIC(10, 2) NOT NULL, -- IDR price (Rp)
    tokens NUMERIC(10, 2) NOT NULL, -- Tokens price (RT)
    original_retail NUMERIC(10, 2),
    water_liters_saved INTEGER DEFAULT 0,
    co2_kg_saved NUMERIC(6, 2) DEFAULT 0,
    image_url TEXT NOT NULL,
    source VARCHAR(64) DEFAULT 'Verified Trade-in',
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_fiat);
