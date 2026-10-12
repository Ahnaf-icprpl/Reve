/**
 * Revé Database Service
 * PostgreSQL-backed service with ZERO fallbacks.
 * All product catalog, user profiles, wallets, transactions, cart, orders, trade-ins,
 * donations, and badges are queried and persisted directly in PostgreSQL.
 */

const { Pool } = require("pg");
const lucide = require("lucide");
require("dotenv").config();

let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured. Zero fallback allowed.");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000
    });

    pool.on("error", (err) => {
      console.error("PostgreSQL Pool Error:", err.message);
    });
  }
  return pool;
}

/**
 * Render any Lucide icon dynamically from its icon name (as stored in DB)
 * using the official Lucide library.
 *
 * @param {string} iconName - Icon identifier from database (e.g. 'diamond', 'gem', 'shield')
 * @param {object} options - SVG dimensions and class attributes
 * @returns {string} - Generated SVG markup
 */
function renderIcon(iconName, options = {}) {
  if (!iconName) {
    throw new Error("iconName is required for renderIcon. Zero fallback allowed.");
  }

  const pascalName = iconName
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  const iconDef = lucide.icons[pascalName] || lucide.icons[iconName];
  if (!iconDef) {
    throw new Error(`Lucide icon definition for "${iconName}" not found. Zero fallback allowed.`);
  }

  const width = options.width || 18;
  const height = options.height || 18;
  const className = options.class || "badge-icon-svg";

  const children = iconDef
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${attrStr}></${tag}>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">${children}</svg>`;
}

/**
 * Query user profile by ID from PostgreSQL
 */
async function getUserById(userId) {
  const p = getPool();
  const res = await p.query(
    `SELECT id, email, full_name, role, is_verified, phone,
            street_address, city, state, postal_code, country
     FROM users WHERE id = $1`,
    [userId]
  );

  if (res.rows.length === 0) {
    throw new Error(`User with ID "${userId}" does not exist in database. Zero fallback allowed.`);
  }

  const u = res.rows[0];
  return {
    id: u.id,
    email: u.email,
    name: u.full_name,
    role: u.role,
    isVerified: Boolean(u.is_verified),
    phone: u.phone,
    address: {
      street: u.street_address,
      city: u.city,
      state: u.state,
      postalCode: u.postal_code,
      country: u.country
    }
  };
}

/**
 * Query default primary user (e.g. founder) from PostgreSQL
 */
async function getDefaultUser() {
  const p = getPool();
  const res = await p.query(
    `SELECT id, email, full_name, role, is_verified, phone,
            street_address, city, state, postal_code, country
     FROM users ORDER BY created_at ASC LIMIT 1`
  );

  if (res.rows.length === 0) {
    throw new Error("No users found in database. Zero fallback allowed.");
  }

  const u = res.rows[0];
  return {
    id: u.id,
    email: u.email,
    name: u.full_name,
    role: u.role,
    isVerified: Boolean(u.is_verified),
    phone: u.phone,
    address: {
      street: u.street_address,
      city: u.city,
      state: u.state,
      postalCode: u.postal_code,
      country: u.country
    }
  };
}

/**
 * Map raw database product row to template-friendly object
 */
function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    gender: row.gender,
    size: row.size,
    color: row.color,
    condition: row.condition,
    conditionScore: row.condition_score,
    conditionNotes: row.condition_notes,
    material: row.material,
    price: Number(row.price_fiat),
    tokens: Number(row.tokens),
    originalRetail: row.original_retail ? Number(row.original_retail) : null,
    ecoSavings: {
      waterLiters: Number(row.water_liters_saved || 0),
      co2Kg: Number(row.co2_kg_saved || 0)
    },
    image: row.image_url,
    source: row.source,
    inStock: Boolean(row.in_stock),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Query user badges live from PostgreSQL
 */
async function getUserBadges(userId) {
  if (!userId) {
    throw new Error("userId is required for getUserBadges. Zero fallback allowed.");
  }
  const p = getPool();
  const res = await p.query(
    `SELECT b.id, b.title, b.icon, b.description, ub.awarded_at
     FROM badges b
     JOIN user_badges ub ON b.id = ub.badge_id
     WHERE ub.user_id = $1
     ORDER BY ub.awarded_at ASC`,
    [userId]
  );

  return res.rows.map(b => ({
    ...b,
    svg: renderIcon(b.icon)
  }));
}

/**
 * Query distinct product categories from PostgreSQL
 */
async function getCategories() {
  const p = getPool();
  const res = await p.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND in_stock = TRUE ORDER BY category ASC"
  );
  return res.rows.map(r => r.category);
}

/**
 * Query distinct product conditions from PostgreSQL
 */
async function getConditions() {
  const p = getPool();
  const res = await p.query(
    "SELECT DISTINCT condition FROM products WHERE condition IS NOT NULL AND in_stock = TRUE ORDER BY condition ASC"
  );
  return res.rows.map(r => r.condition);
}

/**
 * Query products with optional filters and sorting
 */
async function getProducts({ category, condition, sort, q, maxPrice } = {}) {
  const p = getPool();
  const conditions = ["in_stock = TRUE"];
  const params = [];

  if (q && q.trim()) {
    params.push(`%${q.trim().toLowerCase()}%`);
    const idx = params.length;
    conditions.push(
      `(LOWER(title) LIKE $${idx} OR LOWER(brand) LIKE $${idx} OR LOWER(category) LIKE $${idx} OR LOWER(material) LIKE $${idx})`
    );
  }

  if (category && category !== "All") {
    params.push(category.toLowerCase());
    conditions.push(`LOWER(category) = $${params.length}`);
  }

  if (condition && condition !== "All") {
    params.push(condition.toLowerCase());
    conditions.push(`LOWER(condition) = $${params.length}`);
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    params.push(Number(maxPrice));
    conditions.push(`price_fiat <= $${params.length}`);
  }

  let orderClause = "ORDER BY created_at ASC";
  if (sort === "price-asc") {
    orderClause = "ORDER BY price_fiat ASC";
  } else if (sort === "price-desc") {
    orderClause = "ORDER BY price_fiat DESC";
  } else if (sort === "eco") {
    orderClause = "ORDER BY water_liters_saved DESC";
  }

  const queryText = `
    SELECT * FROM products
    WHERE ${conditions.join(" AND ")}
    ${orderClause}
  `;

  const res = await p.query(queryText, params);
  return res.rows.map(mapProduct);
}

/**
 * Query featured products
 */
async function getFeaturedProducts(limit = 4) {
  const p = getPool();
  const res = await p.query(
    "SELECT * FROM products WHERE in_stock = TRUE ORDER BY id ASC LIMIT $1",
    [limit]
  );
  return res.rows.map(mapProduct);
}

/**
 * Query single product by ID
 */
async function getProductById(productId) {
  const p = getPool();
  const res = await p.query("SELECT * FROM products WHERE id = $1", [productId]);
  if (res.rows.length === 0) return null;
  return mapProduct(res.rows[0]);
}

/**
 * Query related products in the same category
 */
async function getRelatedProducts(productId, category, limit = 3) {
  const p = getPool();
  const res = await p.query(
    `SELECT * FROM products
     WHERE category = $1 AND id != $2 AND in_stock = TRUE
     ORDER BY created_at ASC
     LIMIT $3`,
    [category, productId, limit]
  );

  return res.rows.map(mapProduct);
}

/**
 * Query platform metrics strictly from PostgreSQL
 */
async function getPlatformMetrics() {
  const p = getPool();
  const res = await p.query("SELECT key, value FROM platform_metrics");
  if (res.rows.length === 0) {
    throw new Error("platform_metrics table is empty in database. Zero fallback allowed.");
  }

  const metrics = {};
  for (const row of res.rows) {
    metrics[row.key] = row.value;
  }

  const required = ["garmentsRecirculated", "waterSavedLiters", "tokensEarnedByCommunity", "landfillDivertedKg"];
  for (const key of required) {
    if (!metrics[key]) {
      throw new Error(`Missing "${key}" in platform_metrics table. Zero fallback allowed.`);
    }
  }

  return {
    garmentsRecirculated: metrics.garmentsRecirculated,
    waterSavedLiters: metrics.waterSavedLiters,
    tokensEarnedByCommunity: metrics.tokensEarnedByCommunity,
    landfillDivertedKg: metrics.landfillDivertedKg
  };
}

/**
 * Query user wallet and transaction ledger
 */
async function getWalletSummary(userId) {
  if (!userId) {
    throw new Error("userId is required for getWalletSummary. Zero fallback allowed.");
  }
  const p = getPool();
  const walletRes = await p.query(
    "SELECT * FROM wallets WHERE user_id = $1",
    [userId]
  );

  if (walletRes.rows.length === 0) {
    throw new Error(`Wallet record for user ${userId} does not exist in database.`);
  }

  const w = walletRes.rows[0];
  const txRes = await p.query(
    "SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC",
    [w.id]
  );

  const ledger = txRes.rows.map(tx => ({
    id: tx.id,
    type: tx.transaction_type,
    title: tx.title,
    date: tx.created_at,
    tokenChange: Number(tx.token_change),
    balanceAfter: Number(tx.balance_after),
    fiatEquivalent: Number(tx.fiat_equivalent),
    status: tx.status,
    referenceId: tx.reference_id
  }));

  const balance = Number(w.token_balance);
  const deductionRate = Number(w.conversion_deduction_rate);
  const cashValue = (balance * (1 - deductionRate)).toFixed(2);

  return {
    id: w.id,
    tokenName: "Revé Token",
    tokenSymbol: "RT",
    currencyCode: "USD",
    currencySymbol: "$",
    balance: balance,
    marketplacePurchasingValue: balance,
    cashPayoutValue: parseFloat(cashValue),
    conversionDeductionRate: deductionRate * 100,
    totalEarnedTokens: Number(w.total_earned_tokens),
    totalSpentTokens: Number(w.total_spent_tokens),
    totalWithdrawnCash: Number(w.total_withdrawn_cash),
    ledger
  };
}

/**
 * Spend tokens from wallet inside database transaction
 */
async function spendTokens(userId, amount, title, referenceId) {
  if (!userId) {
    throw new Error("userId is required for spendTokens. Zero fallback allowed.");
  }
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const walletRes = await client.query(
      "SELECT id, token_balance, total_spent_tokens FROM wallets WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const w = walletRes.rows[0];
    if (w.token_balance < amount) {
      throw new Error(`Insufficient tokens: ${w.token_balance} available, ${amount} required`);
    }

    const newBalance = w.token_balance - amount;
    const newTotalSpent = w.total_spent_tokens + amount;

    await client.query(
      "UPDATE wallets SET token_balance = $1, total_spent_tokens = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [newBalance, newTotalSpent, w.id]
    );

    const txId = "tx-" + Math.floor(100000 + Math.random() * 900000);
    await client.query(
      `INSERT INTO wallet_transactions (
        id, wallet_id, user_id, transaction_type, title, token_change,
        balance_after, fiat_equivalent, reference_id, status
      ) VALUES ($1, $2, $3, 'MARKETPLACE_PURCHASE', $4, $5, $6, $7, $8, 'Completed')`,
      [txId, w.id, userId, title, -amount, newBalance, amount, referenceId]
    );

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Credit tokens to wallet inside database transaction
 */
async function creditTokens(userId, amount, title, referenceId) {
  if (!userId) {
    throw new Error("userId is required for creditTokens. Zero fallback allowed.");
  }
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const walletRes = await client.query(
      "SELECT id, token_balance, total_earned_tokens FROM wallets WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const w = walletRes.rows[0];
    const newBalance = w.token_balance + amount;
    const newTotalEarned = w.total_earned_tokens + amount;

    await client.query(
      "UPDATE wallets SET token_balance = $1, total_earned_tokens = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [newBalance, newTotalEarned, w.id]
    );

    const txId = "tx-" + Math.floor(100000 + Math.random() * 900000);
    await client.query(
      `INSERT INTO wallet_transactions (
        id, wallet_id, user_id, transaction_type, title, token_change,
        balance_after, fiat_equivalent, reference_id, status
      ) VALUES ($1, $2, $3, 'TRADE_IN_CREDIT', $4, $5, $6, $7, $8, 'Completed')`,
      [txId, w.id, userId, title, amount, newBalance, amount, referenceId]
    );

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Query cart from PostgreSQL
 */
async function getCart(userId, sessionId = null) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required for getCart. Zero fallback allowed.");
  }

  const p = getPool();
  let res;
  if (userId) {
    res = await p.query(
      `SELECT c.id AS cart_item_id, c.quantity, p.*
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at ASC`,
      [userId]
    );
  } else {
    res = await p.query(
      `SELECT c.id AS cart_item_id, c.quantity, p.*
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.session_id = $1
       ORDER BY c.created_at ASC`,
      [sessionId]
    );
  }

  const items = res.rows.map(row => ({
    product: mapProduct(row),
    quantity: row.quantity
  }));

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tokenSubtotal = items.reduce((sum, item) => sum + item.product.tokens * item.quantity, 0);
  const totalWaterSaved = items.reduce((sum, item) => sum + item.product.ecoSavings.waterLiters * item.quantity, 0);
  const totalCo2Saved = parseFloat(
    items.reduce((sum, item) => sum + item.product.ecoSavings.co2Kg * item.quantity, 0).toFixed(1)
  );

  return {
    items,
    count,
    subtotal,
    tokenSubtotal,
    totalWaterSaved,
    totalCo2Saved
  };
}

/**
 * Add product to cart in PostgreSQL
 */
async function addToCart(userId, sessionId = null, productId, quantity = 1) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required for addToCart. Zero fallback allowed.");
  }
  const p = getPool();
  const product = await getProductById(productId);
  if (!product) return false;

  if (userId) {
    await p.query(
      `INSERT INTO cart_items (user_id, session_id, product_id, quantity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [userId, sessionId, productId, quantity]
    );
  } else {
    await p.query(
      `INSERT INTO cart_items (session_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [sessionId, productId, quantity]
    );
  }
  return true;
}

/**
 * Remove product from cart in PostgreSQL
 */
async function removeFromCart(userId, sessionId = null, productId) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required for removeFromCart. Zero fallback allowed.");
  }
  const p = getPool();
  if (userId) {
    await p.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
  } else {
    await p.query(
      "DELETE FROM cart_items WHERE session_id = $1 AND product_id = $2",
      [sessionId, productId]
    );
  }
}

/**
 * Clear cart in PostgreSQL
 */
async function clearCart(userId, sessionId = null) {
  if (!userId && !sessionId) {
    throw new Error("userId or sessionId is required for clearCart. Zero fallback allowed.");
  }
  const p = getPool();
  if (userId) {
    await p.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
  } else {
    await p.query("DELETE FROM cart_items WHERE session_id = $1", [sessionId]);
  }
}

/**
 * Query orders list for a user
 */
async function getOrders(userId) {
  if (!userId) {
    throw new Error("userId is required for getOrders. Zero fallback allowed.");
  }
  const p = getPool();
  const ordersRes = await p.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  const orders = [];
  for (const o of ordersRes.rows) {
    const itemsRes = await p.query(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
      [o.id]
    );

    orders.push({
      id: o.id,
      date: o.created_at,
      items: itemsRes.rows.map(item => ({
        id: item.product_id,
        title: item.title,
        brand: item.brand,
        price: Number(item.unit_price),
        tokens: Number(item.unit_tokens),
        quantity: item.quantity,
        image: item.image_url
      })),
      subtotal: Number(o.subtotal_fiat),
      shipping: Number(o.shipping_fiat),
      totalFiat: Number(o.total_fiat),
      paidWithTokens: Number(o.paid_with_tokens),
      paidWithCash: Number(o.paid_with_cash),
      paymentMethod: o.payment_method,
      shippingAddress: {
        fullName: o.shipping_name,
        street: o.shipping_street,
        city: o.shipping_city,
        state: o.shipping_state,
        postalCode: o.shipping_postal_code,
        country: o.shipping_country
      },
      status: o.status,
      ecoMetrics: {
        waterSaved: Number(o.water_liters_saved || 0),
        co2Avoided: Number(o.co2_kg_avoided || 0)
      }
    });
  }

  return orders;
}

/**
 * Query single order by ID
 */
async function getOrderById(orderId, userId) {
  if (!orderId || !userId) {
    throw new Error("orderId and userId are required for getOrderById. Zero fallback allowed.");
  }
  const p = getPool();
  const orderRes = await p.query(
    "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
    [orderId, userId]
  );

  if (orderRes.rows.length === 0) return null;
  const o = orderRes.rows[0];

  const itemsRes = await p.query(
    "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
    [o.id]
  );

  return {
    id: o.id,
    date: o.created_at,
    items: itemsRes.rows.map(item => ({
      id: item.product_id,
      title: item.title,
      brand: item.brand,
      price: Number(item.unit_price),
      tokens: Number(item.unit_tokens),
      quantity: item.quantity,
      image: item.image_url
    })),
    subtotal: Number(o.subtotal_fiat),
    shipping: Number(o.shipping_fiat),
    totalFiat: Number(o.total_fiat),
    paidWithTokens: Number(o.paid_with_tokens),
    paidWithCash: Number(o.paid_with_cash),
    paymentMethod: o.payment_method,
    shippingAddress: {
      fullName: o.shipping_name,
      street: o.shipping_street,
      city: o.shipping_city,
      state: o.shipping_state,
      postalCode: o.shipping_postal_code,
      country: o.shipping_country
    },
    status: o.status,
    ecoMetrics: {
      waterSaved: Number(o.water_liters_saved || 0),
      co2Avoided: Number(o.co2_kg_avoided || 0)
    }
  };
}

/**
 * Create order with cart items in PostgreSQL inside a database transaction
 */
async function createOrder({
  userId,
  sessionId = null,
  cart,
  paidWithTokens = 0,
  paidWithCash = 0,
  paymentLabel,
  shippingAddress = {}
}) {
  if (!userId) {
    throw new Error("userId is required to createOrder. Zero fallback allowed.");
  }
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty. Cannot create order. Zero fallback allowed.");
  }

  const p = getPool();
  const client = await p.connect();
  const orderId = "REV-" + Math.floor(1000 + Math.random() * 9000);

  try {
    await client.query("BEGIN");

    // Fetch user profile from database for address
    const userRes = await client.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      throw new Error(`User with ID "${userId}" does not exist in database.`);
    }
    const u = userRes.rows[0];

    // 1. If tokens paid, verify and deduct tokens
    if (paidWithTokens > 0) {
      const walletRes = await client.query(
        "SELECT id, token_balance, total_spent_tokens FROM wallets WHERE user_id = $1 FOR UPDATE",
        [userId]
      );
      if (walletRes.rows.length === 0) {
        throw new Error(`Wallet not found for user ${userId}`);
      }
      const w = walletRes.rows[0];
      if (w.token_balance < paidWithTokens) {
        throw new Error(`Insufficient tokens: ${w.token_balance} available, ${paidWithTokens} required`);
      }
      const newBalance = w.token_balance - paidWithTokens;
      const newTotalSpent = w.total_spent_tokens + paidWithTokens;

      await client.query(
        "UPDATE wallets SET token_balance = $1, total_spent_tokens = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [newBalance, newTotalSpent, w.id]
      );

      const txId = "tx-" + Math.floor(100000 + Math.random() * 900000);
      await client.query(
        `INSERT INTO wallet_transactions (
          id, wallet_id, user_id, transaction_type, title, token_change,
          balance_after, fiat_equivalent, reference_id, status
        ) VALUES ($1, $2, $3, 'MARKETPLACE_PURCHASE', $4, $5, $6, $7, $8, 'Completed')`,
        [txId, w.id, userId, `Marketplace Order #${orderId}`, -paidWithTokens, newBalance, paidWithTokens, orderId]
      );
    }

    // 2. Insert order using user profile for missing shipping details
    const fullName = (shippingAddress.fullName && shippingAddress.fullName.trim()) || u.full_name;
    const street = (shippingAddress.street && shippingAddress.street.trim()) || u.street_address || "";
    const city = (shippingAddress.city && shippingAddress.city.trim()) || u.city || "";
    const state = (shippingAddress.state && shippingAddress.state.trim()) || u.state || "";
    const postalCode = (shippingAddress.postalCode && shippingAddress.postalCode.trim()) || u.postal_code || "";

    await client.query(
      `INSERT INTO orders (
        id, user_id, subtotal_fiat, shipping_fiat, total_fiat,
        paid_with_tokens, paid_with_cash, payment_method,
        shipping_name, shipping_street, shipping_city, shipping_state, shipping_postal_code,
        status, water_liters_saved, co2_kg_avoided
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Processing', $14, $15)`,
      [
        orderId,
        userId,
        cart.subtotal,
        0,
        cart.subtotal,
        paidWithTokens,
        paidWithCash,
        paymentLabel,
        fullName,
        street,
        city,
        state,
        postalCode,
        cart.totalWaterSaved,
        cart.totalCo2Saved
      ]
    );

    // 3. Insert order items
    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, title, brand, unit_price, unit_tokens, quantity, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          item.product.id,
          item.product.title,
          item.product.brand,
          item.product.price,
          item.product.tokens,
          item.quantity,
          item.product.image
        ]
      );
    }

    // 4. Clear cart
    if (userId) {
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
    } else {
      await client.query("DELETE FROM cart_items WHERE session_id = $1", [sessionId]);
    }

    await client.query("COMMIT");
    return orderId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Query trade-ins for a user
 */
async function getTradeIns(userId) {
  if (!userId) {
    throw new Error("userId is required for getTradeIns. Zero fallback allowed.");
  }
  const p = getPool();
  const res = await p.query(
    "SELECT * FROM trade_ins WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  return res.rows.map(row => ({
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    gender: row.gender,
    size: row.size,
    material: row.material,
    condition: row.condition,
    notes: row.notes,
    photoUrl: row.photo_url,
    assessedValueTokens: Number(row.assessed_value_tokens),
    status: row.status,
    statusMessage: row.status_message,
    circularOutcome: row.circular_outcome,
    submissionDate: row.created_at
  }));
}

/**
 * Query single trade-in by ID
 */
async function getTradeInById(tradeInId) {
  if (!tradeInId) {
    throw new Error("tradeInId is required for getTradeInById. Zero fallback allowed.");
  }
  const p = getPool();
  const res = await p.query("SELECT * FROM trade_ins WHERE id = $1", [tradeInId]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    gender: row.gender,
    size: row.size,
    material: row.material,
    condition: row.condition,
    notes: row.notes,
    photoUrl: row.photo_url,
    assessedValueTokens: Number(row.assessed_value_tokens),
    status: row.status,
    statusMessage: row.status_message,
    circularOutcome: row.circular_outcome,
    submissionDate: row.created_at
  };
}

/**
 * Create a new trade-in record in PostgreSQL
 */
async function createTradeIn({
  id,
  userId,
  title,
  brand,
  category,
  gender,
  size,
  material,
  condition,
  notes,
  photoUrl,
  assessedValueTokens
}) {
  if (!id || !userId || !brand || !category || assessedValueTokens === undefined) {
    throw new Error("Missing required trade-in fields. Zero fallback allowed.");
  }
  const p = getPool();
  const statusMessage = `Assessment complete! Offer of ${assessedValueTokens} RT ($${assessedValueTokens}.00 value) ready for your acceptance.`;

  await p.query(
    `INSERT INTO trade_ins (
      id, user_id, title, brand, category, gender, size, material,
      condition, notes, photo_url, assessed_value_tokens, status,
      status_message, circular_outcome
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Offer Ready', $13, 'Pending User Acceptance')`,
    [
      id,
      userId,
      title || `${brand} ${category}`,
      brand,
      category,
      gender || "Unisex",
      size || "Standard",
      material || "Apparel",
      condition || "Inspected",
      notes || "",
      photoUrl || null,
      assessedValueTokens,
      statusMessage
    ]
  );
}

/**
 * Accept trade-in offer: updates status and credits tokens to wallet in one transaction
 */
async function acceptTradeIn(tradeInId, userId) {
  if (!tradeInId || !userId) {
    throw new Error("tradeInId and userId are required for acceptTradeIn. Zero fallback allowed.");
  }
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query("BEGIN");
    const itemRes = await client.query(
      "SELECT * FROM trade_ins WHERE id = $1 FOR UPDATE",
      [tradeInId]
    );

    if (itemRes.rows.length === 0) {
      throw new Error(`Trade-in ${tradeInId} not found`);
    }

    const item = itemRes.rows[0];
    if (item.status === "Credited") {
      throw new Error("This offer has already been accepted and credited.");
    }

    const tokens = Number(item.assessed_value_tokens);
    const dateStr = new Date().toLocaleDateString();
    const statusMsg = `Accepted! ${tokens} RT credited to your digital wallet on ${dateStr}.`;

    // 1. Update trade-in
    await client.query(
      `UPDATE trade_ins
       SET status = 'Credited',
           status_message = $1,
           circular_outcome = 'Listed on Circular Marketplace / Hub Intake',
           accepted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [statusMsg, tradeInId]
    );

    // 2. Credit wallet
    const walletRes = await client.query(
      "SELECT id, token_balance, total_earned_tokens FROM wallets WHERE user_id = $1 FOR UPDATE",
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw new Error(`Wallet not found for user ${userId}`);
    }

    const w = walletRes.rows[0];
    const newBalance = w.token_balance + tokens;
    const newTotalEarned = w.total_earned_tokens + tokens;

    await client.query(
      "UPDATE wallets SET token_balance = $1, total_earned_tokens = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [newBalance, newTotalEarned, w.id]
    );

    const txId = "tx-" + Math.floor(100000 + Math.random() * 900000);
    await client.query(
      `INSERT INTO wallet_transactions (
        id, wallet_id, user_id, transaction_type, title, token_change,
        balance_after, fiat_equivalent, reference_id, status
      ) VALUES ($1, $2, $3, 'TRADE_IN_CREDIT', $4, $5, $6, $7, $8, 'Completed')`,
      [txId, w.id, userId, `Trade-in Accepted: ${item.title}`, tokens, newBalance, tokens, item.id]
    );

    await client.query("COMMIT");
    return { tokens, title: item.title };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Decline trade-in offer
 */
async function declineTradeIn(tradeInId) {
  if (!tradeInId) {
    throw new Error("tradeInId is required for declineTradeIn. Zero fallback allowed.");
  }
  const p = getPool();
  await p.query(
    `UPDATE trade_ins
     SET status = 'Declined',
         status_message = 'Offer declined by user. Item will be returned or donated per preference.',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status != 'Credited'`,
    [tradeInId]
  );
}

/**
 * Query donations for a user
 */
async function getDonations(userId) {
  if (!userId) {
    throw new Error("userId is required for getDonations. Zero fallback allowed.");
  }
  const p = getPool();
  const donRes = await p.query(
    "SELECT * FROM donations WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  const donations = [];
  for (const d of donRes.rows) {
    const catRes = await p.query(
      "SELECT category_name FROM donation_categories WHERE donation_id = $1",
      [d.id]
    );

    donations.push({
      id: d.id,
      title: d.title,
      itemCount: d.item_count_label || `${d.item_count_numeric} garments`,
      intendedProgram: d.damage_assessment,
      dropOffMethod: d.drop_off_method,
      trackingNumber: d.tracking_number,
      status: d.status,
      submissionDate: d.created_at,
      beneficiaryNotes: d.beneficiary_notes,
      qrCode: d.qr_code,
      categories: catRes.rows.map(c => c.category_name),
      impactMetrics: {
        textilesDivertedKg: Number(d.textiles_diverted_kg || 0),
        waterSavedLiters: Number(d.water_saved_liters || 0),
        landfillDivertedPct: Number(d.landfill_diverted_pct || 100)
      }
    });
  }

  return donations;
}

/**
 * Query single donation by ID
 */
async function getDonationById(donationId) {
  if (!donationId) {
    throw new Error("donationId is required for getDonationById. Zero fallback allowed.");
  }
  const p = getPool();
  const donRes = await p.query("SELECT * FROM donations WHERE id = $1", [donationId]);
  if (donRes.rows.length === 0) return null;
  const d = donRes.rows[0];

  let qrCode = d.qr_code;
  if (!qrCode && d.tracking_number) {
    try {
      const QRCode = require("qrcode");
      qrCode = await QRCode.toString(d.tracking_number, { type: "svg", margin: 1, width: 120 });
      await p.query("UPDATE donations SET qr_code = $1 WHERE id = $2", [qrCode, d.id]);
    } catch (_) {}
  }

  const catRes = await p.query(
    "SELECT category_name FROM donation_categories WHERE donation_id = $1",
    [d.id]
  );

  return {
    id: d.id,
    title: d.title,
    itemCount: d.item_count_label || `${d.item_count_numeric} garments`,
    intendedProgram: d.damage_assessment,
    dropOffMethod: d.drop_off_method,
    trackingNumber: d.tracking_number,
    status: d.status,
    submissionDate: d.created_at,
    beneficiaryNotes: d.beneficiary_notes,
    qrCode: qrCode || d.qr_code,
    categories: catRes.rows.map(c => c.category_name),
    impactMetrics: {
      textilesDivertedKg: Number(d.textiles_diverted_kg || 0),
      waterSavedLiters: Number(d.water_saved_liters || 0),
      landfillDivertedPct: Number(d.landfill_diverted_pct || 100)
    }
  };
}

/**
 * Create a new donation in PostgreSQL
 */
async function createDonation({
  id,
  userId,
  title,
  itemCountLabel,
  itemCountNumeric = 1,
  damageAssessment,
  dropOffMethod,
  trackingNumber,
  categories = [],
  textilesDivertedKg = 0,
  waterSavedLiters = 0,
  landfillDivertedPct = 100,
  beneficiaryNotes,
  qrCode = null
}) {
  if (!id || !userId || !trackingNumber) {
    throw new Error("Missing required donation fields. Zero fallback allowed.");
  }
  let finalQrCode = qrCode;
  if (!finalQrCode) {
    const QRCode = require("qrcode");
    finalQrCode = await QRCode.toString(trackingNumber, { type: "svg", margin: 1, width: 120 });
  }
  const p = getPool();
  const client = await p.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO donations (
        id, user_id, title, item_count_label, item_count_numeric,
        damage_assessment, drop_off_method, tracking_number, status,
        textiles_diverted_kg, water_saved_liters, landfill_diverted_pct,
        beneficiary_notes, qr_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pass Generated', $9, $10, $11, $12, $13)`,
      [
        id,
        userId,
        title,
        itemCountLabel,
        itemCountNumeric,
        damageAssessment,
        dropOffMethod,
        trackingNumber,
        textilesDivertedKg,
        waterSavedLiters,
        landfillDivertedPct,
        beneficiaryNotes,
        finalQrCode
      ]
    );

    for (const cat of categories) {
      await client.query(
        "INSERT INTO donation_categories (donation_id, category_name) VALUES ($1, $2)",
        [id, cat]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getPool,
  renderIcon,
  getUserById,
  getDefaultUser,
  getUserBadges,
  getCategories,
  getConditions,
  getProducts,
  getFeaturedProducts,
  getProductById,
  getRelatedProducts,
  getPlatformMetrics,
  getWalletSummary,
  spendTokens,
  creditTokens,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  getOrders,
  getOrderById,
  createOrder,
  getTradeIns,
  getTradeInById,
  createTradeIn,
  acceptTradeIn,
  declineTradeIn,
  getDonations,
  getDonationById,
  createDonation
};
