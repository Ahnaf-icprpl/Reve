// In-memory data store for Revé MVP
// Supports state mutations across session and requests

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Revé Sculpted Cape Minimalist Blouse",
    brand: "Revé Studio",
    category: "Tops",
    gender: "Women",
    size: "M",
    color: "Chalk White",
    condition: "Like New",
    conditionScore: "9.7/10",
    conditionNotes: "Sculpted architectural cape silhouette with clean seamless placket. Crisp organic poplin, no markings, ozone sanitized.",
    material: "100% Organic Structured Cotton Poplin",
    price: 68,
    tokens: 68, // 1:1 token peg
    originalRetail: 160,
    ecoSavings: {
      waterLiters: 1450,
      co2Kg: 4.8
    },
    image: "/img/clothes/3.png",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-2",
    title: "Lemaire Tailored Cropped Collar Jacket",
    brand: "Lemaire",
    category: "Outerwear",
    gender: "Women",
    size: "S",
    color: "Alabaster Cream",
    condition: "Like New",
    conditionScore: "9.8/10",
    conditionNotes: "Modern cropped bolero cut with soft collar and immaculate hidden finish. Virgin wool blend preserved in pristine condition.",
    material: "85% Upcycled Wool, 15% Recycled Polyamide",
    price: 95,
    tokens: 95,
    originalRetail: 240,
    ecoSavings: {
      waterLiters: 2200,
      co2Kg: 7.4
    },
    image: "/img/clothes/4.png",
    source: "Curated Upcycle",
    inStock: true
  },
  {
    id: "prod-3",
    title: "COS Boxy Utility Overshirt",
    brand: "COS",
    category: "Outerwear",
    gender: "Unisex",
    size: "L",
    color: "Pale Sage Grey",
    condition: "Like New",
    conditionScore: "9.5/10",
    conditionNotes: "Substantial 290gsm twill weave with structured square chest pocket and drop shoulders. Crisp edges, zero discoloration.",
    material: "100% Recycled Cotton Twill",
    price: 58,
    tokens: 58,
    originalRetail: 125,
    ecoSavings: {
      waterLiters: 1580,
      co2Kg: 5.2
    },
    image: "/img/clothes/5.png",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-4",
    title: "Acne Studios Asymmetric Grid Panel Shirt",
    brand: "Acne Studios",
    category: "Tops",
    gender: "Unisex",
    size: "M",
    color: "Burgundy Wine",
    condition: "Gently Used",
    conditionScore: "9.2/10",
    conditionNotes: "Deep burgundy tone with contrast geometric linear stitching and an asymmetric placket fold. Soft natural drape.",
    material: "65% Tencel Lyocell, 35% Organic Cotton",
    price: 74,
    tokens: 74,
    originalRetail: 185,
    ecoSavings: {
      waterLiters: 1650,
      co2Kg: 5.6
    },
    image: "/img/clothes/6.png",
    source: "Community Trade-in",
    inStock: true
  },
  {
    id: "prod-5",
    title: "Chloé Draped Fine Pleat Contrast Knit Blouse",
    brand: "Chloé",
    category: "Knitwear",
    gender: "Women",
    size: "M",
    color: "Dusty Mauve & White",
    condition: "Like New",
    conditionScore: "9.6/10",
    conditionNotes: "Delicate vertical micro-pleats with contrasting crisp ivory collar and tailored cuffs. Flawless stitchwork.",
    material: "70% Recycled Fine Viscose, 30% Organic Silk",
    price: 89,
    tokens: 89,
    originalRetail: 225,
    ecoSavings: {
      waterLiters: 1880,
      co2Kg: 6.2
    },
    image: "/img/clothes/7.png",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-6",
    title: "Pleats Please Textured Grid Collared Overshirt",
    brand: "Pleats Please",
    category: "Tops",
    gender: "Unisex",
    size: "Free Size (M/L)",
    color: "Terracotta Blush",
    condition: "Like New",
    conditionScore: "9.4/10",
    conditionNotes: "Iconic heat-set architectural grid pleating. Wrinkle-resistant with lightweight stretch memory. Pristine collar form.",
    material: "100% Recycled Technical Polyester Pleat",
    price: 84,
    tokens: 84,
    originalRetail: 210,
    ecoSavings: {
      waterLiters: 1540,
      co2Kg: 4.9
    },
    image: "/img/clothes/8.png",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-7",
    title: "K2 Studio Two-Tone Utility Cargo Streetwear Tee",
    brand: "K2 Studio",
    category: "Tops",
    gender: "Men",
    size: "XL",
    color: "Camel Tan & Black",
    condition: "Gently Used",
    conditionScore: "8.9/10",
    conditionNotes: "Heavyweight drop-shoulder relaxed cut featuring tactical arm pocket with patch detail and colorblocked lower body.",
    material: "100% Heavyweight Combed Cotton (260 GSM)",
    price: 38,
    tokens: 38,
    originalRetail: 75,
    ecoSavings: {
      waterLiters: 980,
      co2Kg: 3.2
    },
    image: "/img/clothes/images-5.jpg",
    source: "Community Trade-in",
    inStock: true
  },
  {
    id: "prod-8",
    title: "K2 Studio Colorblock Tech Pocket Streetwear Tee",
    brand: "K2 Studio",
    category: "Tops",
    gender: "Men",
    size: "L",
    color: "Sky Blue & Black",
    condition: "Like New",
    conditionScore: "9.3/10",
    conditionNotes: "Sky blue and matte black panel construction with functional sleeve pocket and geometric chest motif. Zero shrinkage.",
    material: "100% Heavyweight Combed Cotton (260 GSM)",
    price: 38,
    tokens: 38,
    originalRetail: 75,
    ecoSavings: {
      waterLiters: 980,
      co2Kg: 3.2
    },
    image: "/img/clothes/images-6.jpg",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-9",
    title: "Undercover Split Flame Graphic Streetwear Tee",
    brand: "Undercover",
    category: "Tops",
    gender: "Unisex",
    size: "L (Oversized)",
    color: "Crimson & Jet Black",
    condition: "Gently Used",
    conditionScore: "8.8/10",
    conditionNotes: "Striking 50/50 dual-tone vertical split tee with wrap-around flame graphics across the lower hem. Screen print pristine.",
    material: "100% Upcycled Cotton Jersey",
    price: 46,
    tokens: 46,
    originalRetail: 88,
    ecoSavings: {
      waterLiters: 1140,
      co2Kg: 3.7
    },
    image: "/img/clothes/images-7.jpg",
    source: "Community Trade-in",
    inStock: true
  }
];

class Store {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    
    // User wallet state
    // 1 RT = 1 RP in marketplace; 1 RT = 0.80 RP cash payout (20% conversion deduction)
    this.wallet = {
      tokenName: "Revé Token",
      tokenSymbol: "RT",
      currencyCode: "USD",
      currencySymbol: "$",
      tokenBalance: 150, // Initial demo balance to test spending or withdrawing
      conversionDeductionRate: 0.20, // 20% conversion deduction on cash-out per spec
      totalEarnedTokens: 210,
      totalSpentTokens: 60,
      totalWithdrawnCash: 0,
      ledger: [
        {
          id: "tx-init-1",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Patagonia Better Sweater",
          date: "2026-10-02T10:15:00Z",
          tokenChange: +65,
          balanceAfter: 65,
          fiatEquivalent: 65,
          status: "Completed",
          referenceId: "TI-9801"
        },
        {
          id: "tx-init-2",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Vintage Woolrich Overshirt",
          date: "2026-10-05T14:30:00Z",
          tokenChange: +85,
          balanceAfter: 150,
          fiatEquivalent: 85,
          status: "Completed",
          referenceId: "TI-9802"
        },
        {
          id: "tx-init-3",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Carhartt WIP Canvas Trousers",
          date: "2026-10-09T09:00:00Z",
          tokenChange: +60,
          balanceAfter: 210,
          fiatEquivalent: 60,
          status: "Completed",
          referenceId: "TI-9803"
        },
        {
          id: "tx-init-4",
          type: "MARKETPLACE_PURCHASE",
          title: "Order #REV-1049: Vintage Levi's Denim Jacket",
          date: "2026-10-10T16:45:00Z",
          tokenChange: -60,
          balanceAfter: 150,
          fiatEquivalent: 60,
          status: "Completed",
          referenceId: "REV-1049"
        }
      ]
    };

    // User cart items: array of { product, quantity }
    this.cart = [];

    // Orders placed
    this.orders = [
      {
        id: "REV-1049",
        date: "2026-10-10T16:45:00Z",
        items: [
          {
            id: "prod-4",
            title: "Acne Studios Asymmetric Grid Panel Shirt",
            brand: "Acne Studios",
            price: 60,
            tokens: 60,
            quantity: 1,
            image: "/img/clothes/6.png"
          }
        ],
        subtotal: 60,
        shipping: 0,
        totalFiat: 60,
        paidWithTokens: 60,
        paidWithCash: 0,
        paymentMethod: "Revé Tokens (1:1 Value)",
        shippingAddress: {
          fullName: "Alex Rivera",
          street: "742 Evergreen Terrace",
          city: "Portland",
          state: "OR",
          postalCode: "97201"
        },
        status: "Delivered",
        ecoMetrics: {
          waterSaved: 2600,
          co2Avoided: 6.5
        }
      }
    ];

    // Trade-ins submitted by user
    this.tradeIns = [
      {
        id: "TI-9801",
        title: "Patagonia Better Sweater 1/4 Zip",
        brand: "Patagonia",
        category: "Outerwear",
        gender: "Men",
        size: "M",
        material: "100% Recycled Polyester Fleece",
        condition: "Excellent",
        notes: "Light fleece wear on elbows, zipper works perfectly.",
        photoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-01T12:00:00Z",
        assessedValueTokens: 65,
        status: "Credited", // Statuses: 'Submitted', 'Under Review', 'Offer Ready', 'Credited', 'Declined'
        statusMessage: "Accepted and 65 RT credited to wallet on Oct 2, 2026.",
        circularOutcome: "Listed on Marketplace"
      },
      {
        id: "TI-9802",
        title: "Vintage Woolrich Heavyweight Overshirt",
        brand: "Woolrich",
        category: "Outerwear",
        gender: "Men",
        size: "L",
        material: "85% Wool, 15% Nylon",
        condition: "Like New",
        notes: "Classic buffalo check, heavy wool, no moth marks.",
        photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-04T11:15:00Z",
        assessedValueTokens: 85,
        status: "Credited",
        statusMessage: "Accepted and 85 RT credited to wallet on Oct 5, 2026.",
        circularOutcome: "Listed on Marketplace"
      },
      {
        id: "TI-9804",
        title: "Arc'teryx Atom LT Hoody - Kingfisher",
        brand: "Arc'teryx",
        category: "Outerwear",
        gender: "Unisex",
        size: "L",
        material: "Tyono 20 Nylon, Coreloft 60 Insulation",
        condition: "Like New",
        notes: "Minor scuff on inner cuff. Cinch cords intact, DWR repels water.",
        photoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-11T14:20:00Z",
        assessedValueTokens: 110,
        status: "Offer Ready", // User can click "Accept Offer" to test crediting live!
        statusMessage: "Assessment complete! Offer of 110 RT ($110.00 value) ready for your acceptance.",
        circularOutcome: "Pending User Acceptance"
      }
    ];

    // Donations submitted by user (no tokens or cash returned, circular textile recycling / reuse)
    this.donations = [
      {
        id: "DON-3012",
        title: "Assorted Everyday Tees & Denim",
        itemCount: 8,
        categories: ["Tops", "Bottoms", "Textile Scraps"],
        fabrics: ["Cotton", "Polyester Blend", "Denim"],
        conditionSummary: "Mixed wearable and worn items",
        intendedProgram: "Severely Damaged — Fiber Shredding (Circle Less)",
        dropOffMethod: "Prepaid Eco-Shipping Label",
        trackingNumber: "REV-CIRC-8821948",
        submissionDate: "2026-10-06T11:00:00Z",
        status: "Processed & Recycled",
        impactMetrics: {
          textilesDivertedKg: 4.8,
          waterSavedLiters: 9800,
          landfillDivertedPct: 100
        },
        beneficiaryNotes: "Sorted at Revé Hub Seattle: 5 garments repaired for community clothing drive, 3 shredded into acoustic insulation."
      }
    ];

    // User Badges (supports multiple badges per user)
    this.badges = [
      {
        id: "badge-ceo",
        title: "I AM THE CEO",
        icon: "diamond",
        description: "Chief Executive Officer / Founder Badge"
      }
    ];

    this.userBadges = [
      {
        id: "badge-ceo",
        title: "I AM THE CEO",
        icon: "diamond",
        description: "Chief Executive Officer / Founder Badge"
      }
    ];
  }

  // --- Wallet Helpers ---
  getWalletSummary() {
    const balance = this.wallet.tokenBalance;
    const deductionRate = this.wallet.conversionDeductionRate; // e.g. 0.20
    const cashOutValue = Math.max(0, balance * (1 - deductionRate));
    const deductionAmount = balance * deductionRate;

    return {
      balance,
      symbol: this.wallet.tokenSymbol,
      name: this.wallet.tokenName,
      currencyCode: this.wallet.currencyCode,
      currencySymbol: this.wallet.currencySymbol,
      marketplacePower: balance, // 1:1
      cashOutValue: Number(cashOutValue.toFixed(2)),
      deductionRatePct: Math.round(deductionRate * 100),
      deductionAmount: Number(deductionAmount.toFixed(2)),
      ledger: this.wallet.ledger
    };
  }

  getUserBadges() {
    return this.userBadges || [];
  }

  getPlatformMetrics() {
    const scoring = require("../services/scoring");
    return scoring.calculatePlatformMetrics(this);
  }

  creditTokens(amount, title, referenceId, type = "TRADE_IN_CREDIT") {
    const num = Math.round(Number(amount));
    if (num <= 0) return false;
    this.wallet.tokenBalance += num;
    this.wallet.totalEarnedTokens += num;
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type,
      title,
      date: new Date().toISOString(),
      tokenChange: +num,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: num,
      status: "Completed",
      referenceId
    });
    return true;
  }

  spendTokens(amount, title, referenceId) {
    const num = Math.round(Number(amount));
    if (num <= 0 || num > this.wallet.tokenBalance) return false;
    this.wallet.tokenBalance -= num;
    this.wallet.totalSpentTokens += num;
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type: "MARKETPLACE_PURCHASE",
      title,
      date: new Date().toISOString(),
      tokenChange: -num,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: num,
      status: "Completed",
      referenceId
    });
    return true;
  }

  withdrawTokens(tokenAmount, payoutDestination) {
    const tokens = Math.round(Number(tokenAmount));
    if (tokens <= 0 || tokens > this.wallet.tokenBalance) {
      return { success: false, error: "Insufficient token balance" };
    }
    const deductionRate = this.wallet.conversionDeductionRate;
    const deductionTokens = Math.round(tokens * deductionRate);
    const netCash = Number((tokens - deductionTokens).toFixed(2));

    this.wallet.tokenBalance -= tokens;
    this.wallet.totalWithdrawnCash += netCash;

    const refId = "WD-" + Math.floor(100000 + Math.random() * 900000);
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type: "CASH_CONVERSION_WITHDRAWAL",
      title: `Cash-out to ${payoutDestination} (${this.wallet.currencySymbol}${netCash} after ${Math.round(deductionRate * 100)}% deduction)`,
      date: new Date().toISOString(),
      tokenChange: -tokens,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: netCash,
      deductionTokens,
      payoutDestination,
      status: "Completed",
      referenceId: refId
    });

    return {
      success: true,
      tokensDeducted: tokens,
      deductionTokens,
      netCash,
      referenceId: refId,
      remainingBalance: this.wallet.tokenBalance
    };
  }

  // --- Cart Helpers ---
  getCart() {
    let subtotal = 0;
    let totalWaterSaved = 0;
    let totalCo2Saved = 0;

    const items = this.cart.map(item => {
      const itemSubtotal = item.product.price * item.quantity;
      subtotal += itemSubtotal;
      totalWaterSaved += (item.product.ecoSavings?.waterLiters || 0) * item.quantity;
      totalCo2Saved += (item.product.ecoSavings?.co2Kg || 0) * item.quantity;
      return {
        ...item,
        subtotal: itemSubtotal
      };
    });

    return {
      items,
      count: this.cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tokenSubtotal: subtotal, // 1:1
      totalWaterSaved,
      totalCo2Saved: Number(totalCo2Saved.toFixed(1))
    };
  }

  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    const existing = this.cart.find(c => c.product.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        product,
        quantity
      });
    }
    return true;
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
  }

  clearCart() {
    this.cart = [];
  }
}

// Export singleton instance
module.exports = new Store();
