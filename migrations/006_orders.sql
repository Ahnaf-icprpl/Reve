-- ===================================================================
-- Migration: 006_orders.sql
-- Description: Marketplace customer orders and line item records
-- ===================================================================

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    subtotal_fiat NUMERIC(10, 2) NOT NULL,
    shipping_fiat NUMERIC(10, 2) DEFAULT 0.00,
    total_fiat NUMERIC(10, 2) NOT NULL,
    paid_with_tokens INTEGER DEFAULT 0, -- RT tokens spent
    paid_with_cash NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(128) NOT NULL,
    shipping_name VARCHAR(255) NOT NULL,
    shipping_street TEXT NOT NULL,
    shipping_city VARCHAR(128) NOT NULL,
    shipping_state VARCHAR(64) NOT NULL,
    shipping_postal_code VARCHAR(32) NOT NULL,
    shipping_country VARCHAR(64) DEFAULT 'United States',
    status VARCHAR(32) NOT NULL DEFAULT 'Processing', -- 'Processing', 'Shipped', 'Delivered'
    water_liters_saved INTEGER DEFAULT 0,
    co2_kg_avoided NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    brand VARCHAR(128) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_tokens INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
