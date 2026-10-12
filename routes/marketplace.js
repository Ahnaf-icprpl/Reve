const express = require("express");
const router = express.Router();
const db = require("../services/db");

// Catalog list with filters and search
router.get("/marketplace", async (req, res, next) => {
  try {
    const { category, condition, sort, q, maxPrice } = req.query;
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";

    const [products, wallet, cart] = await Promise.all([
      db.getProducts({ category, condition, sort, q, maxPrice }),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    const categories = ["All", "Outerwear", "Knitwear", "Bottoms", "Tops", "Dresses", "Accessories"];
    const conditions = ["All", "Like New", "Gently Used", "Vintage"];

    res.render("marketplace/index", {
      title: "Circular Marketplace — Revé",
      products,
      categories,
      conditions,
      selectedCategory: category || "All",
      selectedCondition: condition || "All",
      selectedSort: sort || "featured",
      searchQuery: q || "",
      maxPrice: maxPrice || "",
      cart,
      wallet
    });
  } catch (err) {
    next(err);
  }
});

// Single product details
router.get("/marketplace/:id", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const product = await db.getProductById(req.params.id);

    if (!product) {
      req.session.toast = { type: "error", message: "Item not found in catalog." };
      return res.redirect("/marketplace");
    }

    const [similarItems, cart, wallet] = await Promise.all([
      db.getRelatedProducts(product.id, product.category, 3),
      db.getCart(userId, req.sessionID),
      db.getWalletSummary(userId)
    ]);

    res.render("marketplace/show", {
      title: `${product.title} — Revé`,
      product,
      similarItems,
      cart,
      wallet
    });
  } catch (err) {
    next(err);
  }
});

// Cart view
router.get("/cart", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [cart, wallet] = await Promise.all([
      db.getCart(userId, req.sessionID),
      db.getWalletSummary(userId)
    ]);

    res.render("cart/index", {
      title: "Your Bag — Revé",
      cart,
      wallet
    });
  } catch (err) {
    next(err);
  }
});

// Add to cart
router.post("/cart/add", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;
    const success = await db.addToCart(userId, req.sessionID, productId, qty);

    if (success) {
      req.session.toast = { type: "success", message: "Item added to your circular bag!" };
    } else {
      req.session.toast = { type: "error", message: "Could not add item." };
    }

    const referer = req.get("Referer") || "/marketplace";
    res.redirect(referer);
  } catch (err) {
    next(err);
  }
});

// Remove from cart
router.post("/cart/remove", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const { productId } = req.body;
    await db.removeFromCart(userId, req.sessionID, productId);
    req.session.toast = { type: "info", message: "Item removed from bag." };
    res.redirect("/cart");
  } catch (err) {
    next(err);
  }
});

// Checkout page
router.get("/checkout", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [cart, wallet] = await Promise.all([
      db.getCart(userId, req.sessionID),
      db.getWalletSummary(userId)
    ]);

    if (cart.items.length === 0) {
      req.session.toast = { type: "info", message: "Your bag is empty." };
      return res.redirect("/marketplace");
    }

    res.render("checkout/index", {
      title: "Checkout — Revé",
      cart,
      wallet
    });
  } catch (err) {
    next(err);
  }
});

// Process checkout
router.post("/checkout", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [cart, wallet] = await Promise.all([
      db.getCart(userId, req.sessionID),
      db.getWalletSummary(userId)
    ]);

    if (cart.items.length === 0) {
      req.session.toast = { type: "error", message: "Cart is empty." };
      return res.redirect("/marketplace");
    }

    const { paymentMethod, fullName, street, city, state, postalCode } = req.body;
    const totalAmount = cart.subtotal;

    let paidWithTokens = 0;
    let paidWithCash = 0;
    let paymentLabel = "Credit Card";

    if (paymentMethod === "tokens") {
      if (wallet.balance < totalAmount) {
        req.session.toast = {
          type: "error",
          message: `Insufficient token balance (${wallet.balance} RT available, required ${totalAmount} RT). Use Card or split payment.`
        };
        return res.redirect("/checkout");
      }
      paidWithTokens = totalAmount;
      paymentLabel = "Revé Tokens (1:1 Value Peg)";
    } else if (paymentMethod === "split") {
      paidWithTokens = Math.min(wallet.balance, totalAmount);
      paidWithCash = totalAmount - paidWithTokens;
      paymentLabel = `Split: ${paidWithTokens} RT + $${paidWithCash.toFixed(2)} Card`;
    } else {
      paidWithCash = totalAmount;
      paymentLabel = "Credit / Debit Card";
    }

    const orderId = await db.createOrder({
      userId,
      sessionId: req.sessionID,
      cart,
      paidWithTokens,
      paidWithCash,
      paymentLabel,
      shippingAddress: { fullName, street, city, state, postalCode }
    });

    req.session.toast = {
      type: "success",
      message: `Order #${orderId} confirmed! ${paidWithTokens > 0 ? `${paidWithTokens} RT redeemed.` : ""}`
    };

    res.redirect(`/orders/${orderId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
