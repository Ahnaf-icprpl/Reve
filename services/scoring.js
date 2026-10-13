/**
 * Revé Centralized Scoring & Environmental Calculation Service
 * 
 * Performs all score calculations, trade-in valuations, textile damage assessments,
 * and circular ecological impact metrics server-side.
 */

// Category base valuation points
const CATEGORY_BASE_SCORES = {
  outerwear: 150000,
  knitwear: 120000,
  dresses: 120000,
  bottoms: 90000,
  tops: 75000,
  accessories: 50000
};

// Brand tier scoring factors
const BRAND_TIER_FACTORS = [
  {
    tier: "Technical & Premium Outdoor",
    multiplier: 1.6,
    matches: ["arc'teryx", "patagonia", "a.p.c.", "acne studios", "barbour", "woolrich", "fjällräven", "norrona"]
  },
  {
    tier: "Contemporary & Sustainable Heritage",
    multiplier: 1.25,
    matches: ["everlane", "sezane", "sézane", "reformation", "levi's", "levi", "cos", "ganni", "eileen fisher", "nudie jeans", "arket"]
  },
  {
    tier: "Heritage Workwear",
    multiplier: 1.15,
    matches: ["carhartt wip", "carhartt", "ralph lauren", "dickies", "ll bean", "l.l. bean"]
  },
  {
    tier: "High-Street & Fast Fashion",
    multiplier: 0.75,
    matches: ["zara", "h&m", "uniqlo", "gap", "mango", "massimo dutti"]
  }
];

// Condition grading scoring
const CONDITION_FACTORS = {
  "like new": { multiplier: 1.0, scoreGrade: "9.5/10", label: "Pristine / Barely Worn" },
  "pristine": { multiplier: 1.0, scoreGrade: "9.8/10", label: "Pristine" },
  "excellent": { multiplier: 0.85, scoreGrade: "8.5/10", label: "Gently Used / Flawless" },
  "gently used": { multiplier: 0.85, scoreGrade: "8.5/10", label: "Gently Used" },
  "good": { multiplier: 0.70, scoreGrade: "7.0/10", label: "Good / Minor Character" },
  "fair": { multiplier: 0.50, scoreGrade: "5.5/10", label: "Fair / Light Repairable" }
};

// Natural / circular fiber bonus factors
const MATERIAL_BONUS = [
  { match: "wool", bonus: 1.1 },
  { match: "cashmere", bonus: 1.25 },
  { match: "silk", bonus: 1.15 },
  { match: "linen", bonus: 1.1 },
  { match: "organic cotton", bonus: 1.05 },
  { match: "recycled", bonus: 1.1 }
];

/**
 * Server-side Trade-In Valuation & Condition Score Calculation
 */
function calculateTradeInValuation(params = {}) {
  const brand = (params.brand || "").trim().toLowerCase();
  const category = (params.category || "").trim().toLowerCase();
  const condition = (params.condition || "").trim().toLowerCase();
  const material = (params.material || "").trim().toLowerCase();

  if (!brand) {
    return {
      isValid: false,
      valuationTokens: 0,
      fiatValue: 0,
      scoreGrade: "Pending",
      notes: "Brand required for assessment",
      displayTokens: "— RT",
      displaySummary: "Not defined yet \u2022 Assessed upon intake review",
      placeholderEstimate: "— RT",
      placeholderSummary: "Not defined yet \u2022 Assessed upon intake review"
    };
  }

  // 1. Category Base Score
  let baseScore = CATEGORY_BASE_SCORES[category] || 60000;

  // 2. Brand Prestige Factor
  let brandMultiplier = 1.0;
  for (const group of BRAND_TIER_FACTORS) {
    if (group.matches.some(m => brand.includes(m))) {
      brandMultiplier = group.multiplier;
      break;
    }
  }

  // 3. Condition Factor & Grade
  const conditionInfo = CONDITION_FACTORS[condition] || { multiplier: 0.75, scoreGrade: "7.5/10", label: "Inspected" };
  const conditionMultiplier = conditionInfo.multiplier;

  // 4. Material Fiber Bonus
  let materialMultiplier = 1.0;
  if (material) {
    for (const mat of MATERIAL_BONUS) {
      if (material.includes(mat.match)) {
        materialMultiplier *= mat.bonus;
        break;
      }
    }
  }

  // Calculate final token valuation score (minimum 15 RT)
  const rawScore = baseScore * brandMultiplier * conditionMultiplier * materialMultiplier;
  const valuationTokens = Math.max(35000, Math.round(rawScore / 1000) * 1000);
  const fiatValue = valuationTokens; // 1 RT = 1 IDR

  return {
    isValid: true,
    valuationTokens,
    fiatValue,
    scoreGrade: conditionInfo.scoreGrade,
    conditionLabel: conditionInfo.label,
    estimatedWaterSaved: Math.round((valuationTokens / 1000) * 15),
    estimatedCo2Avoided: Number(((valuationTokens / 1000) * 0.04).toFixed(1)),
    displayTokens: `~${valuationTokens.toLocaleString("id-ID")} RT`,
    displaySummary: `Indicative ~${valuationTokens.toLocaleString("id-ID")} RT (Rp ${fiatValue.toLocaleString("id-ID")}) \u2022 Condition Grade: ${conditionInfo.scoreGrade}`,
    placeholderEstimate: "— RT",
    placeholderSummary: "Not defined yet \u2022 Assessed upon intake review"
  };
}

/**
 * Server-side Donation Environmental Impact Calculation
 */
function calculateDonationImpact(params = {}) {
  const rawCount = params.itemCount;
  // Parse numeric quantity from string like "6 garments", "1 bag (8 items)", etc.
  let parsedCount = 1;
  if (typeof rawCount === "number") {
    parsedCount = Math.max(1, rawCount);
  } else if (typeof rawCount === "string") {
    const match = rawCount.match(/\d+/);
    parsedCount = match ? parseInt(match[0], 10) : 1;
  }

  // Industry standard circular metrics per apparel piece:
  // ~0.55kg average textile weight per garment
  // ~1,250 Liters of water preserved vs virgin textile agriculture & dyeing
  // ~3.2 kg CO2 avoided per garment recirculated/diverted
  const textilesDivertedKg = Number((parsedCount * 0.55).toFixed(1));
  const waterSavedLiters = Math.round(parsedCount * 1250);
  const co2AvoidedKg = Number((parsedCount * 3.2).toFixed(1));

  return {
    parsedCount,
    textilesDivertedKg,
    waterSavedLiters,
    co2AvoidedKg,
    landfillDivertedPct: 100
  };
}

/**
 * Dynamic Platform Aggregate Metrics Calculation
 * Aggregates live numbers from data metrics
 */
function calculatePlatformMetrics(data = {}) {
  let garmentsRecirculated = 0;
  let totalWaterLiters = 0;
  let totalTokensEarned = 0;
  let totalTextilesDivertedKg = 0;

  // 1. Tally from products catalog
  if (data.products && Array.isArray(data.products)) {
    garmentsRecirculated += data.products.length;
    data.products.forEach(p => {
      totalWaterLiters += (p.ecoSavings && p.ecoSavings.waterLiters) || 0;
    });
  }

  // 2. Tally from placed orders
  if (data.orders && Array.isArray(data.orders)) {
    data.orders.forEach(o => {
      const orderCount = o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1;
      garmentsRecirculated += orderCount;
      totalWaterLiters += (o.ecoMetrics && o.ecoMetrics.waterSaved) || 0;
    });
  }

  // 3. Tally from accepted trade-ins
  if (data.tradeIns && Array.isArray(data.tradeIns)) {
    data.tradeIns.forEach(t => {
      if (t.status === "Credited" || t.status === "Offer Ready") {
        garmentsRecirculated += 1;
        totalWaterLiters += Math.round(((t.assessedValueTokens || 0) / 1000) * 15);
      }
    });
  }

  // 4. Tally from processed donations
  if (data.donations && Array.isArray(data.donations)) {
    data.donations.forEach(d => {
      const count = typeof d.itemCount === "number" ? d.itemCount : (parseInt(d.itemCount, 10) || 1);
      garmentsRecirculated += count;
      totalTextilesDivertedKg += (d.impactMetrics && d.impactMetrics.textilesDivertedKg) || (count * 0.55);
      totalWaterLiters += (d.impactMetrics && d.impactMetrics.waterSavedLiters) || (count * 1250);
    });
  }

  // 5. Tally tokens issued from wallet ledger
  if (data.wallet && data.wallet.ledger && Array.isArray(data.wallet.ledger)) {
    data.wallet.ledger.forEach(tx => {
      if (tx.tokenChange > 0) {
        totalTokensEarned += tx.tokenChange;
      }
    });
  }

  // Format with friendly notation
  function formatWater(liters) {
    if (liters >= 1000000) {
      return (liters / 1000000).toFixed(1) + "M";
    } else if (liters >= 1000) {
      return (liters / 1000).toFixed(1) + "K";
    }
    return liters.toLocaleString();
  }

  return {
    garmentsRecirculated: garmentsRecirculated.toLocaleString(),
    waterSavedLiters: formatWater(totalWaterLiters),
    tokensEarnedByCommunity: totalTokensEarned.toLocaleString(),
    landfillDivertedKg: Number(totalTextilesDivertedKg.toFixed(1)).toLocaleString()
  };
}

module.exports = {
  calculateTradeInValuation,
  calculateDonationImpact,
  calculatePlatformMetrics
};
