-- ===================================================================
-- Seed Migration: 005_wallets.sql
-- Description: Seed initial user wallet and ledger transactions
-- ===================================================================

INSERT INTO wallets (id, user_id, token_balance, total_earned_tokens, total_spent_tokens, total_withdrawn_cash, conversion_deduction_rate)
VALUES ('wal-ahnaf', 'usr-ahnaf-ceo', 150, 210, 60, 0.00, 0.20)
ON CONFLICT (id) DO UPDATE SET
    token_balance = EXCLUDED.token_balance,
    total_earned_tokens = EXCLUDED.total_earned_tokens,
    total_spent_tokens = EXCLUDED.total_spent_tokens,
    total_withdrawn_cash = EXCLUDED.total_withdrawn_cash,
    conversion_deduction_rate = EXCLUDED.conversion_deduction_rate,
    updated_at = CURRENT_TIMESTAMP;

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
