require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

if (!process.env.SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET in environment variables. Zero fallback allowed.");
}

const app = express();
const PORT = process.env.PORT || 3000;
// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "public/img")));

// Session setup for flash messages and demo persistence
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Global view locals middleware
app.use(async (req, res, next) => {
  try {
    const db = require("./services/db");
    res.locals.toast = req.session.toast || null;
    delete req.session.toast;
    res.locals.currentPath = req.path;
    res.locals.formatIdr = function (val) {
      if (val === null || val === undefined) return "0";
      let num = Number(val);
      if (isNaN(num)) return "0";
      if (num > 0 && num < 1000) {
        num = num * 1000;
      }
      return num.toLocaleString("id-ID");
    };

    if (req.session.user && req.session.user.id) {
      res.locals.currentUser = await db.getUserById(req.session.user.id);
    } else {
      res.locals.currentUser = await db.getDefaultUser();
    }

    const userId = res.locals.currentUser ? res.locals.currentUser.id : null;
    const [badges, cart] = await Promise.all([
      userId ? db.getUserBadges(userId) : [],
      db.getCart(userId, req.sessionID).catch(() => ({ items: [], count: 0, subtotal: 0, tokenSubtotal: 0, totalWaterSaved: 0, totalCo2Saved: 0 }))
    ]);

    res.locals.badges = badges;
    res.locals.cart = cart;
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
const indexRouter = require("./routes/index");
const marketplaceRouter = require("./routes/marketplace");
const tradeinRouter = require("./routes/tradein");
const donateRouter = require("./routes/donate");
const ordersRouter = require("./routes/orders");
const profileRouter = require("./routes/profile");
app.use("/", indexRouter);
app.use("/", marketplaceRouter);
app.use("/", tradeinRouter);
app.use("/", donateRouter);
app.use("/", ordersRouter);
app.use("/", profileRouter);
// 404 Handler
app.use(async (req, res, next) => {
  try {
    const db = require("./services/db");
    const userId = res.locals.currentUser.id;
    const [featuredProducts, stats, wallet, cart] = await Promise.all([
      db.getFeaturedProducts(4),
      db.getPlatformMetrics(),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);
    res.status(404).render("index", {
      title: "Page Not Found — Revé",
      featuredProducts,
      stats,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).send("Internal Server Error: " + err.message);
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌿 Revé running at http://localhost:${PORT}`);
  });
}

module.exports = app;
