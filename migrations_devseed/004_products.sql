-- ===================================================================
-- Seed Migration: 004_products.sql
-- Description: Seed initial marketplace product catalog
-- ===================================================================

INSERT INTO products (
    id, title, brand, category, gender, size, color, condition, condition_score,
    condition_notes, material, price_fiat, tokens, original_retail,
    water_liters_saved, co2_kg_saved, image_url, source, in_stock
) VALUES
(
    'prod-1', 'Revé Sculpted Cape Minimalist Blouse', 'Revé Studio', 'Tops', 'Women', 'M', 'Chalk White',
    'Like New', '9.7/10', 'Sculpted architectural cape silhouette with clean seamless placket. Crisp organic poplin, no markings, ozone sanitized.',
    '100% Organic Structured Cotton Poplin', 68.00, 68.00, 160.00, 1450, 4.80, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828935/reve/clothes/3.png', 'Verified Trade-in', TRUE
),
(
    'prod-2', 'Lemaire Tailored Cropped Collar Jacket', 'Lemaire', 'Outerwear', 'Women', 'S', 'Alabaster Cream',
    'Like New', '9.8/10', 'Modern cropped bolero cut with soft collar and immaculate hidden finish. Virgin wool blend preserved in pristine condition.',
    '85% Upcycled Wool, 15% Recycled Polyamide', 95.00, 95.00, 240.00, 2200, 7.40, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828937/reve/clothes/4.png', 'Curated Upcycle', TRUE
),
(
    'prod-3', 'COS Boxy Utility Overshirt', 'COS', 'Outerwear', 'Unisex', 'L', 'Pale Sage Grey',
    'Like New', '9.5/10', 'Substantial 290gsm twill weave with structured square chest pocket and drop shoulders. Crisp edges, zero discoloration.',
    '100% Recycled Cotton Twill', 58.00, 58.00, 125.00, 1580, 5.20, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828941/reve/clothes/5.png', 'Verified Trade-in', TRUE
),
(
    'prod-4', 'Acne Studios Asymmetric Grid Panel Shirt', 'Acne Studios', 'Tops', 'Unisex', 'M', 'Burgundy Wine',
    'Gently Used', '9.2/10', 'Deep burgundy tone with contrast geometric linear stitching and an asymmetric placket fold. Soft natural drape.',
    '65% Tencel Lyocell, 35% Organic Cotton', 74.00, 74.00, 185.00, 1650, 5.60, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828945/reve/clothes/6.png', 'Community Trade-in', TRUE
),
(
    'prod-5', 'Chloé Draped Fine Pleat Contrast Knit Blouse', 'Chloé', 'Knitwear', 'Women', 'M', 'Dusty Mauve & White',
    'Like New', '9.6/10', 'Delicate vertical micro-pleats with contrasting crisp ivory collar and tailored cuffs. Flawless stitchwork.',
    '70% Recycled Fine Viscose, 30% Organic Silk', 89.00, 89.00, 225.00, 1880, 6.20, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828950/reve/clothes/7.png', 'Verified Trade-in', TRUE
),
(
    'prod-6', 'Pleats Please Textured Grid Collared Overshirt', 'Pleats Please', 'Tops', 'Unisex', 'Free Size (M/L)', 'Terracotta Blush',
    'Like New', '9.4/10', 'Iconic heat-set architectural grid pleating. Wrinkle-resistant with lightweight stretch memory. Pristine collar form.',
    '100% Recycled Technical Polyester Pleat', 84.00, 84.00, 210.00, 1540, 4.90, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828954/reve/clothes/8.png', 'Verified Trade-in', TRUE
),
(
    'prod-7', 'K2 Studio Two-Tone Utility Cargo Streetwear Tee', 'K2 Studio', 'Tops', 'Men', 'XL', 'Camel Tan & Black',
    'Gently Used', '8.9/10', 'Heavyweight drop-shoulder relaxed cut featuring tactical arm pocket with patch detail and colorblocked lower body.',
    '100% Heavyweight Combed Cotton (260 GSM)', 38.00, 38.00, 75.00, 980, 3.20, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828958/reve/clothes/images-5.jpg', 'Community Trade-in', TRUE
),
(
    'prod-8', 'K2 Studio Colorblock Tech Pocket Streetwear Tee', 'K2 Studio', 'Tops', 'Men', 'L', 'Sky Blue & Black',
    'Like New', '9.3/10', 'Sky blue and matte black panel construction with functional sleeve pocket and geometric chest motif. Zero shrinkage.',
    '100% Heavyweight Combed Cotton (260 GSM)', 38.00, 38.00, 75.00, 980, 3.20, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828959/reve/clothes/images-6.jpg', 'Verified Trade-in', TRUE
),
(
    'prod-9', 'Undercover Split Flame Graphic Streetwear Tee', 'Undercover', 'Tops', 'Unisex', 'L (Oversized)', 'Crimson & Jet Black',
    'Gently Used', '8.8/10', 'Striking 50/50 dual-tone vertical split tee with wrap-around flame graphics across the lower hem. Screen print pristine.',
    '100% Upcycled Cotton Jersey', 46.00, 46.00, 88.00, 1140, 3.70, 'https://res.cloudinary.com/arwppqjt/image/upload/v1791828960/reve/clothes/images-7.jpg', 'Community Trade-in', TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    brand = EXCLUDED.brand,
    category = EXCLUDED.category,
    gender = EXCLUDED.gender,
    size = EXCLUDED.size,
    color = EXCLUDED.color,
    condition = EXCLUDED.condition,
    condition_score = EXCLUDED.condition_score,
    condition_notes = EXCLUDED.condition_notes,
    material = EXCLUDED.material,
    price_fiat = EXCLUDED.price_fiat,
    tokens = EXCLUDED.tokens,
    original_retail = EXCLUDED.original_retail,
    water_liters_saved = EXCLUDED.water_liters_saved,
    co2_kg_saved = EXCLUDED.co2_kg_saved,
    image_url = EXCLUDED.image_url,
    source = EXCLUDED.source,
    in_stock = EXCLUDED.in_stock,
    updated_at = CURRENT_TIMESTAMP;
