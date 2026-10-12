const express = require("express");
const router = express.Router();
const store = require("../data/store");

// Catalog list with filters and search
router.get("/marketplace", (req, res) => {
  const { category, condition, sort, q, maxPrice } = req.query;
  
  let products = [...store.products];

  // Search filter
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.material.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (category && category !== "All") {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Condition filter
  if (condition && condition !== "All") {
    products = products.filter(p => p.condition.toLowerCase() === condition.toLowerCase());
  }

  // Max price filter
  if (maxPrice && !isNaN(Number(maxPrice))) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === "eco") {
    products.sort((a, b) => b.ecoSavings.waterLiters - a.ecoSavings.waterLiters);
  } else {
    // Default newest/featured
  }

  // Available categories & conditions for filter sidebar
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
    cart: store.getCart(),
    wallet: store.getWalletSummary()
  });
});

// Single product details
router.get("/marketplace/:id", (req, res) => {
  const product = store.products.find(p => p.id === req.params.id);
  if (!product) {
    req.session.toast = { type: "error", message: "Item not found in catalog." };
    return res.redirect("/marketplace");
  }

  // Similar items
  const similarItems = store.products
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  res.render("marketplace/show", {
    title: `${product.title} — Revé`,
    product,
    similarItems,
    cart: store.getCart(),
    wallet: store.getWalletSummary()
  });
});

// Cart view
router.get("/cart", (req, res) => {
  res.render("cart/index", {
    title: "Your Bag — Revé",
    cart: store.getCart(),
    wallet: store.getWalletSummary()
  });
});

// Add to cart
router.post("/cart/add", (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;
  const success = store.addToCart(productId, qty);

  if (success) {
    req.session.toast = { type: "success", message: "Item added to your circular bag!" };
  } else {
    req.session.toast = { type: "error", message: "Could not add item." };
  }

  const referer = req.get("Referer") || "/marketplace";
  res.redirect(referer);
});

// Remove from cart
router.post("/cart/remove", (req, res) => {
  const { productId } = req.body;
  store.removeFromCart(productId);
  req.session.toast = { type: "info", message: "Item removed from bag." };
  res.redirect("/cart");
});

// Checkout page
router.get("/checkout", (req, res) => {
  const cart = store.getCart();
  if (cart.items.length === 0) {
    req.session.toast = { type: "info", message: "Your bag is empty." };
    return res.redirect("/marketplace");
  }

  res.render("checkout/index", {
    title: "Checkout — Revé",
    cart,
    wallet: store.getWalletSummary()
  });
});

// Process checkout
router.post("/checkout", (req, res) => {
  const cart = store.getCart();
  if (cart.items.length === 0) {
    req.session.toast = { type: "error", message: "Cart is empty." };
    return res.redirect("/marketplace");
  }

  const { paymentMethod, fullName, street, city, state, postalCode } = req.body;
  const wallet = store.getWalletSummary();
  const totalAmount = cart.subtotal;

  let paidWithTokens = 0;
  let paidWithCash = 0;
  let paymentLabel = "Credit Card";

  if (paymentMethod === "tokens") {
    // 1:1 token payment
    if (wallet.balance < totalAmount) {
      req.session.toast = {
        type: "error",
        message: `Insufficient token balance (${wallet.balance} CT available, required ${totalAmount} CT). Use Card or split payment.`
      };
      return res.redirect("/checkout");
    }
    paidWithTokens = totalAmount;
    paymentLabel = "Revé Tokens (1:1 Value Peg)";
  } else if (paymentMethod === "split") {
    // Split tokens + cash
    paidWithTokens = Math.min(wallet.balance, totalAmount);
    paidWithCash = totalAmount - paidWithTokens;
    paymentLabel = `Split: ${paidWithTokens} CT + $${paidWithCash.toFixed(2)} Card`;
  } else {
    // Standard cash/card
    paidWithCash = totalAmount;
    paymentLabel = "Credit / Debit Card";
  }

  const orderId = "REV-" + Math.floor(1000 + Math.random() * 9000);

  // If tokens were spent, deduct and log in wallet ledger
  if (paidWithTokens > 0) {
    store.spendTokens(paidWithTokens, `Marketplace Order #${orderId}`, orderId);
  }

  // Create order record
  const newOrder = {
    id: orderId,
    date: new Date().toISOString(),
    items: cart.items.map(i => ({
      id: i.product.id,
      title: i.product.title,
      brand: i.product.brand,
      price: i.product.price,
      tokens: i.product.tokens,
      quantity: i.quantity,
      image: i.product.image
    })),
    subtotal: cart.subtotal,
    shipping: 0, // Free circular shipping
    totalFiat: totalAmount,
    paidWithTokens,
    paidWithCash,
    paymentMethod: paymentLabel,
    shippingAddress: {
      fullName: fullName || "Alex Rivera",
      street: street || "742 Evergreen Terrace",
      city: city || "Portland",
      state: state || "OR",
      postalCode: postalCode || "97201"
    },
    status: "Processing",
    ecoMetrics: {
      waterSaved: cart.totalWaterSaved,
      co2Avoided: cart.totalCo2Saved
    }
  };

  store.orders.unshift(newOrder);

  // Clear cart
  store.clearCart();

  req.session.toast = {
    type: "success",
    message: `Order #${orderId} confirmed! ${paidWithTokens > 0 ? `${paidWithTokens} CT redeemed.` : ""}`
  };

  res.redirect(`/orders/${orderId}`);
});

module.exports = router;
