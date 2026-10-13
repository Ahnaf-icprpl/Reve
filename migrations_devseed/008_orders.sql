-- ===================================================================
-- Seed Migration: 008_orders.sql
-- Description: Seed initial marketplace orders and order items
-- ===================================================================

INSERT INTO orders (
    id, user_id, subtotal_fiat, shipping_fiat, total_fiat, paid_with_tokens,
    paid_with_cash, payment_method, shipping_name, shipping_street,
    shipping_city, shipping_state, shipping_postal_code, status,
    water_liters_saved, co2_kg_avoided, created_at
) VALUES (
    'REV-1049', 'usr-ahnaf-ceo', 165000.00, 0.00, 165000.00, 165000,
    0.00, 'Revé Tokens', 'Alex Rivera', '742 Evergreen Terrace',
    'Portland', 'OR', '97201', 'Delivered',
    2600, 6.50, '2026-10-10 16:45:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (
    order_id, product_id, title, brand, unit_price, unit_tokens, quantity, image_url
) VALUES (
    'REV-1049', 'prod-4', 'Acne Studios Asymmetric Grid Panel Shirt', 'Acne Studios',
    165000.00, 165000, 1, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828945/reve/clothes/6.png'
)
ON CONFLICT DO NOTHING;
