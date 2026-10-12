-- ===================================================================
-- Seed Migration: 003_platform_metrics.sql
-- Description: Seed initial platform metrics
-- ===================================================================

INSERT INTO platform_metrics (key, value) VALUES
('garmentsRecirculated', '14,820'),
('waterSavedLiters', '18.4M'),
('tokensEarnedByCommunity', '840,000'),
('landfillDivertedKg', '12,400')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
