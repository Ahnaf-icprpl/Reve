-- ===================================================================
-- Seed Migration: 001_users.sql
-- Description: Seed initial founder / CEO user
-- ===================================================================

INSERT INTO users (id, email, password_hash, salt, full_name, role, is_verified, street_address, city, state, postal_code)
VALUES (
    'usr-ahnaf-ceo',
    'ahnaf@reve.circular',
    '9ba0ea0bcc92ffcbdad8d4ad357975ff6029fef8db8725f5195cba0506ec43720f73be95ea06d6d76757c5a354fbfbec62dc8275ecd53d927df5be277b60b654',
    'a559af639a928e7e3f02e3c7ce9ccb37',
    'Ahnaf',
    'admin',
    TRUE,
    '100 Pine Street',
    'Seattle',
    'WA',
    '98101'
)
ON CONFLICT (email) DO NOTHING;
