-- ===================================================================
-- Migration: 007_badges.sql
-- Description: Badges and user_badges tables supporting multiple badges per user
-- ===================================================================

CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    icon VARCHAR(64) NOT NULL DEFAULT 'diamond', -- Icon identifier: 'diamond', 'gem', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id VARCHAR(64) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

