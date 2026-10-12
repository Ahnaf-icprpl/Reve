-- ===================================================================
-- Seed Migration: 007_donations.sql
-- Description: Seed initial circular textile donations
-- ===================================================================

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
