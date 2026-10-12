# Database Migrations

This folder contains modular SQL migration files structured by functional domain for Revé.

## Migration Files

| File | Domain | Description |
|---|---|---|
| `001_users.sql` | **Users & Staff** | User accounts, authentication credentials, profiles, and roles |
| `002_products.sql` | **Catalog & Inventory** | Circular clothing marketplace listings, conditions, sizing, prices (USD & RT), and eco-savings |
| `003_trade_ins.sql` | **Trade-in Intake** | Wardrobe trade-in submissions, valuation assessments, and offer lifecycle |
| `004_donations.sql` | **Donations & Reclamation** | Textile donations, damage assessments (Circle less), tracking passes, and landfill diversion |
| `005_tokens_and_ledger.sql` | **Token Economy (RT)** | Wallets, token balances, transaction audit ledger, and conversion deductions |
| `006_orders.sql` | **Orders & Fulfillment** | Customer checkout records, line items, token/cash split payments, and delivery addresses |

## Notes
- Database credentials configured in `.env` (`DB_PASSWORD=QooFWwWTjm0Et7W1`).
- These migration scripts are prepared for schema definition; no live execution has been performed yet per instructions.
