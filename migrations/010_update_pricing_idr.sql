-- ===================================================================
-- Migration: 010_update_pricing_idr.sql
-- Description: Update catalog product prices and original retail to realistic Indonesian Rupiah (IDR)
-- ===================================================================

UPDATE products SET price_fiat = 135000.00, tokens = 135000.00, original_retail = 450000.00 WHERE id = 'prod-1';
UPDATE products SET price_fiat = 225000.00, tokens = 225000.00, original_retail = 950000.00 WHERE id = 'prod-2';
UPDATE products SET price_fiat = 145000.00, tokens = 145000.00, original_retail = 650000.00 WHERE id = 'prod-3';
UPDATE products SET price_fiat = 165000.00, tokens = 165000.00, original_retail = 750000.00 WHERE id = 'prod-4';
UPDATE products SET price_fiat = 185000.00, tokens = 185000.00, original_retail = 850000.00 WHERE id = 'prod-5';
UPDATE products SET price_fiat = 175000.00, tokens = 175000.00, original_retail = 750000.00 WHERE id = 'prod-6';
UPDATE products SET price_fiat = 75000.00, tokens = 75000.00, original_retail = 250000.00 WHERE id = 'prod-7';
UPDATE products SET price_fiat = 75000.00, tokens = 75000.00, original_retail = 250000.00 WHERE id = 'prod-8';
UPDATE products SET price_fiat = 95000.00, tokens = 95000.00, original_retail = 350000.00 WHERE id = 'prod-9';
