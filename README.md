# Revé — Circular Clothing Marketplace

Revé is a responsive, server-side rendered (SSR) web application for buying, trading in, and donating clothing and textiles. Built with Express.js and EJS, the platform combines a circular fashion marketplace with an integrated digital token economy powered by **Revé Tokens (RT)**.

---

## Brand & Design System

- **Brand Wordmark**: **Revé.** (featuring the acute accent on the final *e*).
- **Aesthetic**: Minimalist pure white canvas (`#FFFFFF`) with crisp neutral borders (`#E5E7EB`), deep charcoal typography (`#111827`), and circular emerald accents (`#059669`).
- **Logo**: Pure text typography using `Playfair Display` serif paired with `Plus Jakarta Sans`.

---

## Core Pillars & Functionality

### 1. Circular Clothing Marketplace (`/marketplace`)
- **Discovery**: Filter by category (*Outerwear, Knitwear, Bottoms, Tops, Dresses, Accessories*), condition (*Like New, Gently Used, Vintage*), price, or freshwater savings.
- **Product Details (`/marketplace/:id`)**: Comprehensive material breakdown, condition rating, ozone sanitation verification, and environmental footprint metrics (liters of water conserved and kg of $CO_2$ avoided).
- **Cart & Flexible Checkout (`/cart`, `/checkout`)**: Supports full 1:1 token redemption, hybrid split payment (*RT + Card remainder*), or standard card checkout.

### 2. Wardrobe Trade-In Program (`/trade-in`)
- **Intake & Dynamic Valuation**: Garment submission form with a searchable brand datalist (*Patagonia, Arc'teryx, Levi's, Everlane, COS, etc.*) and live valuation calculator.
- **Submissions Ledger (`/trade-in/track`)**: Real-time status tracking (*Under Review*, *Offer Ready*, *Credited*). Accepting an offer credits `RT` directly to the user's account for marketplace spending.

### 3. Zero-Landfill Textile Donation (`/donate`)
- **Circular Reclamation**: Give worn or unwearable textiles a second life across community shelter reuse, circular repair/upcycling, or fiber-level shredding for insulation.
- **Damage Assessment**: Evaluates condition through the *"Circle less"* intake stream (*Wearable, Repairable, or Shredding*).
- **Pass Generation & Tracking (`/donate/:id`, `/donate/track`)**: Generates digital QR intake passes and tracks cumulative kilograms of textile diverted from landfills.

---

## Token Economy (Revé Token — RT)

- **Token Symbol**: `RT`
- **Marketplace Purchasing Power**: **1:1 Value Peg** (`1 RT = 1 RP`) when redeemed on circular clothing listings.
- **Closed-Loop Incentive**: Encourages keeping garments and value circulating within the circular loop.

---

## Tech Stack

- **Runtime & Server**: Node.js, Express.js (v5)
- **View Engine**: EJS (Server-Side Rendered)
- **Styling**: Modern CSS3 (Custom responsive layout & design system, pure white base)
- **Database & Migrations**: PostgreSQL (`pg`), automated runner with `schema_migrations` audit table
- **File Uploads**: Multer
- **Session Management**: Express Session

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (v9+)
- [PostgreSQL](https://www.postgresql.org/) (optional for live database migrations)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:Ahnaf-icprpl/Reve.git
cd Reve
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Default development configuration:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=QooFWwWTjm0Et7W1
DB_NAME=reve_db
SESSION_SECRET=reve-circular-token-secret-key-2026
```

### 3. Database Migrations

Run database migrations with built-in history tracking:

```bash
npm run migrate
```

> **Note on Migration Idempotency**: The migration runner stores execution history in the `schema_migrations` table. Already executed scripts are automatically skipped (`[SKIPPED]`), ensuring migrations never double-run.

### 4. Running the Application

```bash
# Start production server
npm start

# Or start with live reload / development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Reve/
├── app.js                   # Express application setup & middleware
├── package.json             # NPM package scripts & dependencies
├── .env.example             # Environment configuration template
├── README.md                # Project documentation
├── services/
│   ├── db.js                # PostgreSQL database service (zero fallback)
│   ├── cloudinary.js        # Cloudinary media management & upload service
│   └── scoring.js           # Environmental savings & valuation algorithms
├── migrations/              # Modular SQL database migrations
│   ├── 001_users.sql        # Users credentials & profiles
│   ├── 002_products.sql     # Clothing catalog & eco-savings schema
│   ├── 003_trade_ins.sql    # Wardrobe trade-ins & valuation offers
│   ├── 004_donations.sql    # Donations & damage assessment (Circle less)
│   ├── 005_tokens_and_ledger.sql # Token wallets & audit ledger
│   ├── 006_orders.sql       # Orders & line items schema
│   ├── 007_badges.sql       # User badges schema
│   ├── 008_cart_and_metrics.sql # Shopping cart items & platform metrics schema
│   └── README.md            # Migrations guide
├── migrations_devseed/      # Development seed migrations (001-008)
│   ├── 001_users.sql        # Seed founder user
│   ├── 002_badges.sql       # Seed badges & user assignment
│   ├── 003_platform_metrics.sql # Seed platform metrics
│   ├── 004_products.sql     # Seed products catalog
│   ├── 005_wallets.sql      # Seed wallets & transactions
│   ├── 006_trade_ins.sql    # Seed trade-in submissions
│   ├── 007_donations.sql    # Seed textile donations
│   └── 008_orders.sql       # Seed orders & items
├── scripts/
│   └── migrate.js           # Idempotent migration runner script
├── routes/
│   ├── index.js             # Home & About routes
│   ├── marketplace.js       # Catalog, product details, cart, and checkout
│   ├── tradein.js           # Trade-in submission, assessment, and acceptance
│   ├── donate.js            # Donation intake, QR pass, and impact dashboard
│   └── orders.js            # Order confirmation and history
├── public/
│   ├── css/
│   │   └── style.css        # Minimalist white-base design system
│   ├── js/
│   │   └── main.js          # Interactive calculators & UI scripts
│   └── img/
│       └── logo.png         # Brand logo
└── views/
    ├── partials/            # Header, Navbar, Footer, and Toast partials
    ├── index.ejs            # Editorial landing page
    ├── about/               # Circular economy & model documentation
    ├── marketplace/         # Product catalog and detail views
    ├── cart/                # Shopping bag
    ├── checkout/            # Payment selection & checkout flow
    ├── orders/              # Order history & receipts
    ├── trade-in/            # Trade-in intake, tracking, and offer acceptance
    └── donate/              # Donation intake, QR passes, and impact tracker
```

---

## Route Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Editorial homepage & circular highlights |
| `GET` | `/marketplace` | Circular clothing catalog with search & filters |
| `GET` | `/marketplace/:id` | Garment detail view, condition, and eco metrics |
| `POST` | `/cart/add` | Add garment to shopping bag |
| `GET` | `/cart` | Review bag and environmental impact |
| `GET` | `/checkout` | Checkout with `RT` (1:1 peg), card, or split payment |
| `POST` | `/checkout` | Process order and record transaction |
| `GET` | `/orders` | Order history list |
| `GET` | `/orders/:id` | Order receipt & environmental footprint report |
| `GET` | `/trade-in` | Wardrobe trade-in form & valuation calculator |
| `POST` | `/trade-in` | Submit garment for assessment |
| `GET` | `/trade-in/track` | Track trade-ins & accept token offers |
| `POST` | `/trade-in/:id/accept` | Accept offer & credit `RT` directly to account |
| `GET` | `/donate` | Textile donation form with *"Circle less"* assessment |
| `POST` | `/donate` | Generate donation intake pass |
| `GET` | `/donate/track` | Cumulative textile diversion & water saved impact |
| `GET` | `/donate/:id` | Printable donation pass & drop-off QR code |
| `GET` | `/about` | Circular model documentation |

---

## License

ISC License. Copyright &copy; 2026 Revé Inc. All rights reserved.
