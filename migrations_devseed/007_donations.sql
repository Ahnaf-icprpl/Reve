-- ===================================================================
-- Seed Migration: 007_donations.sql
-- Description: Seed initial circular textile donations
-- ===================================================================

INSERT INTO donations (
    id, user_id, title, item_count_label, item_count_numeric, damage_assessment,
    drop_off_method, tracking_number, status, textiles_diverted_kg,
    water_saved_liters, landfill_diverted_pct, beneficiary_notes, qr_code, created_at
) VALUES (
    'DON-3012', 'usr-ahnaf-ceo', 'Assorted Everyday Tees & Denim', '8 garments', 8,
    'Severely Damaged — Fiber Shredding (Circle Less)', 'Prepaid Eco-Shipping Label', 'REV-CIRC-8821948',
    'Processed & Recycled', 4.80, 9800, 100,
    'Sorted at Revé Hub Seattle: 5 garments repaired for community clothing drive, 3 shredded into acoustic insulation.',
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 23 23" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h23v23H0z"/><path stroke="#000000" d="M1 1.5h7m2 0h4m1 0h7M1 2.5h1m5 0h1m1 0h1m3 0h1m1 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m2 0h1m1 0h2m1 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m3 0h2m2 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h1m1 0h3m1 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m3 0h2m2 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h7M10 8.5h1M1 9.5h1m1 0h1m1 0h1m1 0h1m3 0h1m1 0h1m3 0h1m2 0h1M3 10.5h3m3 0h1m1 0h2m1 0h1m1 0h1m1 0h2M2 11.5h1m2 0h5m1 0h2m1 0h1m2 0h2m1 0h1M1 12.5h1m1 0h2m1 0h1m3 0h1m1 0h2m1 0h4m1 0h1M1 13.5h1m2 0h2m1 0h1m4 0h1m4 0h2m1 0h1M9 14.5h1m1 0h2m2 0h6M1 15.5h7m2 0h2m1 0h1m3 0h1m1 0h2M1 16.5h1m5 0h1m2 0h1m1 0h1m5 0h3M1 17.5h1m1 0h3m1 0h1m1 0h1m3 0h1m1 0h2m2 0h3M1 18.5h1m1 0h3m1 0h1m3 0h2m5 0h3M1 19.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h3m2 0h1M1 20.5h1m5 0h1m3 0h2m1 0h1m1 0h6M1 21.5h7m1 0h9m3 0h1"/></svg>
',
    '2026-10-06 11:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO donation_categories (donation_id, category_name) VALUES
('DON-3012', 'Tops'),
('DON-3012', 'Bottoms'),
('DON-3012', 'Textile Scraps')
ON CONFLICT DO NOTHING;
