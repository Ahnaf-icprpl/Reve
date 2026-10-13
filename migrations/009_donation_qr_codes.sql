-- ===================================================================
-- Migration: 009_donation_qr_codes.sql
-- Description: Add qr_code column to donations table for scannable passes
-- ===================================================================

ALTER TABLE donations ADD COLUMN IF NOT EXISTS qr_code TEXT;
