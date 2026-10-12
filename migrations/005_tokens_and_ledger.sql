-- ===================================================================
-- Migration: 005_tokens_and_ledger.sql
-- Description: Revé digital token balances (RT) and audit ledger records
-- ===================================================================

CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token_balance INTEGER NOT NULL DEFAULT 0, -- Balance in RT
    total_earned_tokens INTEGER NOT NULL DEFAULT 0,
    total_spent_tokens INTEGER NOT NULL DEFAULT 0,
    total_withdrawn_cash NUMERIC(10, 2) NOT NULL DEFAULT 0,
    conversion_deduction_rate NUMERIC(4, 2) DEFAULT 0.20, -- 20% conversion deduction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(64) PRIMARY KEY,
    wallet_id VARCHAR(64) NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    transaction_type VARCHAR(64) NOT NULL, -- 'TRADE_IN_CREDIT', 'MARKETPLACE_PURCHASE', 'CASH_CONVERSION_WITHDRAWAL', 'TOPUP'
    title VARCHAR(255) NOT NULL,
    token_change INTEGER NOT NULL, -- Positive for credit, negative for debit
    balance_after INTEGER NOT NULL,
    fiat_equivalent NUMERIC(10, 2) NOT NULL,
    deduction_tokens INTEGER DEFAULT 0,
    payout_destination VARCHAR(255),
    reference_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(transaction_type);
