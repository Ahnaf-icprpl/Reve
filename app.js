const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");

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

// Session setup for flash messages and demo persistence
app.use(
  session({
    secret: "reve-circular-token-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);

// Global view locals middleware
app.use((req, res, next) => {
  res.locals.toast = req.session.toast || null;
  delete req.session.toast;
  res.locals.currentPath = req.path;
  res.locals.currentUser = req.session.user || { name: "Ahnaf" };
  next();
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
app.use((req, res) => {
  const store = require("./data/store");
  res.status(404).render("index", {
    title: "Page Not Found — Revé",
    featuredProducts: store.products.slice(0, 4),
    stats: {
      garmentsRecirculated: "14,820",
      waterSavedLiters: "18.4M",
      tokensEarnedByCommunity: "840,000",
      landfillDivertedKg: "12,400"
    },
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
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
