-- ===================================================================
-- Seed Migration: 002_badges.sql
-- Description: Seed initial badges and award founder badge
-- ===================================================================

INSERT INTO badges (id, title, icon, description)
VALUES ('badge-ceo', 'I AM THE CEO', 'diamond', 'Chief Executive Officer / Founder Badge')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id)
VALUES ('usr-ahnaf-ceo', 'badge-ceo')
ON CONFLICT (user_id, badge_id) DO NOTHING;
