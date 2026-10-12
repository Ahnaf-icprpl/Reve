/**
 * Revé Database & Icon Service
 * Connects to PostgreSQL and uses the official Lucide library
 * to dynamically query badges and render icon components.
 */

const { Pool } = require("pg");
const lucide = require("lucide");
require("dotenv").config();

// PostgreSQL connection pool
let pool = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return null;
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
 * @param {string} iconName - Icon identifier from database (e.g. 'diamond', 'crown', 'shield')
 * @param {object} options - SVG dimensions and class attributes
 * @returns {string} - Generated SVG markup
 */
function renderIcon(iconName, options = {}) {
  if (!iconName) iconName = "diamond";

  // Convert kebab-case or snake_case to PascalCase for Lucide (e.g. 'diamond' -> 'Diamond')
  const pascalName = iconName
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  const iconDef = lucide.icons[pascalName] || lucide.icons[iconName] || lucide.icons.Diamond;
  if (!iconDef) return "";

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
 * Query user badges live from the database
 * Joins `user_badges` and `badges` table
 *
 * @param {string} userId - User identifier (defaults to founder/CEO account)
 * @returns {Promise<Array>} - Badges with dynamic library-rendered icons
 */
async function getUserBadges(userId = "usr-ahnaf-ceo") {
  const p = getPool();
  if (!p) {
    // If no DB configured, return fallback
    return [{
      id: "badge-ceo",
      title: "I AM THE CEO",
      icon: "diamond",
      description: "Chief Executive Officer / Founder Badge",
      svg: renderIcon("diamond")
    }];
  }

  try {
    const res = await p.query(
      `SELECT b.id, b.title, b.icon, b.description, ub.awarded_at
       FROM badges b
       JOIN user_badges ub ON b.id = ub.badge_id
       WHERE ub.user_id = $1
       ORDER BY ub.awarded_at ASC`,
      [userId]
    );

    if (res.rows.length === 0) {
      // Query all available badges from DB if none specifically awarded
      const allBadges = await p.query(
        `SELECT id, title, icon, description FROM badges ORDER BY created_at ASC`
      );
      return allBadges.rows.map(b => ({
        ...b,
        svg: renderIcon(b.icon)
      }));
    }

    // Attach dynamic Lucide library SVG to each badge from its DB icon name
    return res.rows.map(b => ({
      ...b,
      svg: renderIcon(b.icon)
    }));
  } catch (err) {
    console.error("Error fetching badges from DB:", err.message);
    // Graceful fallback with dynamic Lucide render
    return [{
      id: "badge-ceo",
      title: "I AM THE CEO",
      icon: "diamond",
      description: "Chief Executive Officer / Founder Badge",
      svg: renderIcon("diamond")
    }];
  }
}

module.exports = {
  getPool,
  getUserBadges,
  renderIcon
};
