# Database Migrations

This folder contains modular SQL migration files structured by functional domain for Revé.

## Migration Files

| File | Domain | Description |
|---|---|---|
| `001_users.sql` | **Users & Authentication** | Production-grade users schema (`email`, `password_hash`, `salt`, `full_name`, `role`, timestamps) |
| `002_products.sql` | **Catalog & Inventory** | Circular clothing marketplace listings, conditions, sizing, prices (USD & RT), and eco-savings |
| `003_trade_ins.sql` | **Trade-in Intake** | Wardrobe trade-in submissions, valuation assessments, and offer lifecycle |
| `004_donations.sql` | **Donations & Reclamation** | Textile donations, damage assessments (Circle less), tracking passes, and landfill diversion |
| `005_tokens_and_ledger.sql` | **Token Economy (RT)** | Wallets, token balances, transaction audit ledger, and conversion deductions |
| `006_orders.sql` | **Orders & Fulfillment** | Customer checkout records, line items, token/cash split payments, and delivery addresses |
| `007_badges.sql` | **User Badges & Honors** | Badges and user_badges tables supporting multiple badges per user |
| `008_cart_and_metrics.sql` | **Cart & Metrics** | Shopping cart items persistence and dynamic platform metrics schema |

## Development Seed Data

Seed data migrations have been isolated into `migrations_devseed/` numbered sequentially from `001`:
- `001_users.sql` — Seed founder user (`usr-ahnaf-ceo`)
- `002_badges.sql` — Seed founder badge (`badge-ceo`) and assignment
- `003_platform_metrics.sql` — Seed platform circular metrics
- `004_products.sql` — Seed catalog products (`prod-1` through `prod-9`)
- `005_wallets.sql` — Seed wallet and ledger transactions
- `006_trade_ins.sql` — Seed wardrobe trade-in evaluations
- `007_donations.sql` — Seed textile donations and categories
- `008_orders.sql` — Seed marketplace orders and order items
## Running Migrations

To run migrations with idempotency and history tracking:

```bash
npm run migrate
```

### Migration History Tracking
- Migrations are automatically tracked inside the database in a dedicated `schema_migrations` table:
  ```sql
  CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  ```
- Before applying any file, the runner queries `schema_migrations`.
- Any migration that has already been executed is skipped (`[SKIPPED]`), guaranteeing that `npm run migrate` **never double-runs a migration**.
- Each new migration runs within a database transaction (`BEGIN ... COMMIT`) to ensure atomicity.
