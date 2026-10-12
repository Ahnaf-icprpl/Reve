-- ===================================================================
-- Seed Migration: 006_trade_ins.sql
-- Description: Seed initial wardrobe trade-in evaluations
-- ===================================================================

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
