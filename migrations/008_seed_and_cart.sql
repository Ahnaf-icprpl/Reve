-- ===================================================================
-- Migration: 008_seed_and_cart.sql
-- Description: Seed initial products, wallet, ledger, trade-ins, donations, orders,
--              create cart_items and platform_metrics tables with ZERO fallback.
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

INSERT INTO platform_metrics (key, value) VALUES
('garmentsRecirculated', '14,820'),
('waterSavedLiters', '18.4M'),
('tokensEarnedByCommunity', '840,000'),
('landfillDivertedKg', '12,400')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Seed Products
INSERT INTO products (
    id, title, brand, category, gender, size, color, condition, condition_score,
    condition_notes, material, price_fiat, tokens, original_retail,
    water_liters_saved, co2_kg_saved, image_url, source, in_stock
) VALUES
(
    'prod-1', 'Revé Sculpted Cape Minimalist Blouse', 'Revé Studio', 'Tops', 'Women', 'M', 'Chalk White',
    'Like New', '9.7/10', 'Sculpted architectural cape silhouette with clean seamless placket. Crisp organic poplin, no markings, ozone sanitized.',
    '100% Organic Structured Cotton Poplin', 68.00, 68.00, 160.00, 1450, 4.80, '/img/clothes/3.png', 'Verified Trade-in', TRUE
),
(
    'prod-2', 'Lemaire Tailored Cropped Collar Jacket', 'Lemaire', 'Outerwear', 'Women', 'S', 'Alabaster Cream',
    'Like New', '9.8/10', 'Modern cropped bolero cut with soft collar and immaculate hidden finish. Virgin wool blend preserved in pristine condition.',
    '85% Upcycled Wool, 15% Recycled Polyamide', 95.00, 95.00, 240.00, 2200, 7.40, '/img/clothes/4.png', 'Curated Upcycle', TRUE
),
(
    'prod-3', 'COS Boxy Utility Overshirt', 'COS', 'Outerwear', 'Unisex', 'L', 'Pale Sage Grey',
    'Like New', '9.5/10', 'Substantial 290gsm twill weave with structured square chest pocket and drop shoulders. Crisp edges, zero discoloration.',
    '100% Recycled Cotton Twill', 58.00, 58.00, 125.00, 1580, 5.20, '/img/clothes/5.png', 'Verified Trade-in', TRUE
),
(
    'prod-4', 'Acne Studios Asymmetric Grid Panel Shirt', 'Acne Studios', 'Tops', 'Unisex', 'M', 'Burgundy Wine',
    'Gently Used', '9.2/10', 'Deep burgundy tone with contrast geometric linear stitching and an asymmetric placket fold. Soft natural drape.',
    '65% Tencel Lyocell, 35% Organic Cotton', 74.00, 74.00, 185.00, 1650, 5.60, '/img/clothes/6.png', 'Community Trade-in', TRUE
),
(
    'prod-5', 'Chloé Draped Fine Pleat Contrast Knit Blouse', 'Chloé', 'Knitwear', 'Women', 'M', 'Dusty Mauve & White',
    'Like New', '9.6/10', 'Delicate vertical micro-pleats with contrasting crisp ivory collar and tailored cuffs. Flawless stitchwork.',
    '70% Recycled Fine Viscose, 30% Organic Silk', 89.00, 89.00, 225.00, 1880, 6.20, '/img/clothes/7.png', 'Verified Trade-in', TRUE
),
(
    'prod-6', 'Pleats Please Textured Grid Collared Overshirt', 'Pleats Please', 'Tops', 'Unisex', 'Free Size (M/L)', 'Terracotta Blush',
    'Like New', '9.4/10', 'Iconic heat-set architectural grid pleating. Wrinkle-resistant with lightweight stretch memory. Pristine collar form.',
    '100% Recycled Technical Polyester Pleat', 84.00, 84.00, 210.00, 1540, 4.90, '/img/clothes/8.png', 'Verified Trade-in', TRUE
),
(
    'prod-7', 'K2 Studio Two-Tone Utility Cargo Streetwear Tee', 'K2 Studio', 'Tops', 'Men', 'XL', 'Camel Tan & Black',
    'Gently Used', '8.9/10', 'Heavyweight drop-shoulder relaxed cut featuring tactical arm pocket with patch detail and colorblocked lower body.',
    '100% Heavyweight Combed Cotton (260 GSM)', 38.00, 38.00, 75.00, 980, 3.20, '/img/clothes/images-5.jpg', 'Community Trade-in', TRUE
),
(
    'prod-8', 'K2 Studio Colorblock Tech Pocket Streetwear Tee', 'K2 Studio', 'Tops', 'Men', 'L', 'Sky Blue & Black',
    'Like New', '9.3/10', 'Sky blue and matte black panel construction with functional sleeve pocket and geometric chest motif. Zero shrinkage.',
    '100% Heavyweight Combed Cotton (260 GSM)', 38.00, 38.00, 75.00, 980, 3.20, '/img/clothes/images-6.jpg', 'Verified Trade-in', TRUE
),
(
    'prod-9', 'Undercover Split Flame Graphic Streetwear Tee', 'Undercover', 'Tops', 'Unisex', 'L (Oversized)', 'Crimson & Jet Black',
    'Gently Used', '8.8/10', 'Striking 50/50 dual-tone vertical split tee with wrap-around flame graphics across the lower hem. Screen print pristine.',
    '100% Upcycled Cotton Jersey', 46.00, 46.00, 88.00, 1140, 3.70, '/img/clothes/images-7.jpg', 'Community Trade-in', TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    gender = EXCLUDED.gender,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    condition = EXCLUDED.condition,
    condition_score = EXCLUDED.condition_score,
    condition_notes = EXCLUDED.condition_notes,
    material = EXCLUDED.material,
    price_fiat = EXCLUDED.price_fiat,
    tokens = EXCLUDED.tokens,
    original_retail = EXCLUDED.original_retail,
    water_liters_saved = EXCLUDED.water_liters_saved,
    co2_kg_saved = EXCLUDED.co2_kg_saved,
    image_url = EXCLUDED.image_url,
    source = EXCLUDED.source,
    in_stock = EXCLUDED.in_stock,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Seed Wallet
INSERT INTO wallets (id, user_id, token_balance, total_earned_tokens, total_spent_tokens, total_withdrawn_cash, conversion_deduction_rate)
VALUES ('wal-ahnaf', 'usr-ahnaf-ceo', 150, 210, 60, 0.00, 0.20)
ON CONFLICT (id) DO UPDATE SET
    token_balance = EXCLUDED.token_balance,
    total_earned_tokens = EXCLUDED.total_earned_tokens,
    total_spent_tokens = EXCLUDED.total_spent_tokens,
    total_withdrawn_cash = EXCLUDED.total_withdrawn_cash,
    conversion_deduction_rate = EXCLUDED.conversion_deduction_rate,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Seed Wallet Transactions
INSERT INTO wallet_transactions (
    id, wallet_id, user_id, transaction_type, title, token_change,
    balance_after, fiat_equivalent, reference_id, status, created_at
) VALUES
(
    'tx-init-1', 'wal-ahnaf', 'usr-ahnaf-ceo', 'TRADE_IN_CREDIT',
    'Trade-in Accepted: Patagonia Better Sweater', 65, 65, 65.00, 'TI-9801', 'Completed', '2026-10-02 10:15:00+00'
),
(
    'tx-init-2', 'wal-ahnaf', 'usr-ahnaf-ceo', 'TRADE_IN_CREDIT',
    'Trade-in Accepted: Vintage Woolrich Overshirt', 85, 150, 85.00, 'TI-9802', 'Completed', '2026-10-05 14:30:00+00'
),
(
    'tx-init-3', 'wal-ahnaf', 'usr-ahnaf-ceo', 'TRADE_IN_CREDIT',
    'Trade-in Accepted: Carhartt WIP Canvas Trousers', 60, 210, 60.00, 'TI-9803', 'Completed', '2026-10-09 09:00:00+00'
),
(
    'tx-init-4', 'wal-ahnaf', 'usr-ahnaf-ceo', 'MARKETPLACE_PURCHASE',
    'Order #REV-1049: Vintage Levi''s Denim Jacket', -60, 150, 60.00, 'REV-1049', 'Completed', '2026-10-10 16:45:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Trade-ins
INSERT INTO trade_ins (
    id, user_id, title, brand, category, gender, size, material,
    condition, notes, photo_url, assessed_value_tokens, status,
    status_message, circular_outcome, created_at
) VALUES
(
    'TI-9801', 'usr-ahnaf-ceo', 'Patagonia Better Sweater 1/4 Zip', 'Patagonia', 'Outerwear', 'Men', 'M',
    '100% Recycled Polyester Fleece', 'Excellent', 'Light fleece wear on elbows, zipper works perfectly.',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
    65, 'Credited', 'Accepted and 65 RT credited to wallet on Oct 2, 2026.', 'Listed on Marketplace', '2026-10-01 12:00:00+00'
),
(
    'TI-9802', 'usr-ahnaf-ceo', 'Vintage Woolrich Heavyweight Overshirt', 'Woolrich', 'Outerwear', 'Men', 'L',
    '85% Wool, 15% Nylon', 'Like New', 'Classic buffalo check, heavy wool, no moth marks.',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80',
    85, 'Credited', 'Accepted and 85 RT credited to wallet on Oct 5, 2026.', 'Listed on Marketplace', '2026-10-04 11:15:00+00'
),
(
    'TI-9804', 'usr-ahnaf-ceo', 'Arc''teryx Atom LT Hoody - Kingfisher', 'Arc''teryx', 'Outerwear', 'Unisex', 'L',
    'Tyono 20 Nylon, Coreloft 60 Insulation', 'Like New', 'Minor scuff on inner cuff. Cinch cords intact, DWR repels water.',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
    110, 'Offer Ready', 'Assessment complete! Offer of 110 RT ($110.00 value) ready for your acceptance.', 'Pending User Acceptance', '2026-10-11 14:20:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Donations
INSERT INTO donations (
    id, user_id, title, item_count_label, item_count_numeric, damage_assessment,
    drop_off_method, tracking_number, status, textiles_diverted_kg,
    water_saved_liters, landfill_diverted_pct, beneficiary_notes, created_at
) VALUES (
    'DON-3012', 'usr-ahnaf-ceo', 'Assorted Everyday Tees & Denim', '8 garments', 8,
    'Severely Damaged — Fiber Shredding (Circle Less)', 'Prepaid Eco-Shipping Label', 'REV-CIRC-8821948',
    'Processed & Recycled', 4.80, 9800, 100,
    'Sorted at Revé Hub Seattle: 5 garments repaired for community clothing drive, 3 shredded into acoustic insulation.',
    '2026-10-06 11:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO donation_categories (donation_id, category_name) VALUES
('DON-3012', 'Tops'),
('DON-3012', 'Bottoms'),
('DON-3012', 'Textile Scraps')
ON CONFLICT DO NOTHING;

-- 8. Seed Orders
INSERT INTO orders (
    id, user_id, subtotal_fiat, shipping_fiat, total_fiat, paid_with_tokens,
    paid_with_cash, payment_method, shipping_name, shipping_street,
    shipping_city, shipping_state, shipping_postal_code, status,
    water_liters_saved, co2_kg_avoided, created_at
) VALUES (
    'REV-1049', 'usr-ahnaf-ceo', 60.00, 0.00, 60.00, 60,
    0.00, 'Revé Tokens (1:1 Value)', 'Alex Rivera', '742 Evergreen Terrace',
    'Portland', 'OR', '97201', 'Delivered',
    2600, 6.50, '2026-10-10 16:45:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (
    order_id, product_id, title, brand, unit_price, unit_tokens, quantity, image_url
) VALUES (
    'REV-1049', 'prod-4', 'Acne Studios Asymmetric Grid Panel Shirt', 'Acne Studios',
    60.00, 60, 1, '/img/clothes/6.png'
)
ON CONFLICT DO NOTHING;
