/**
 * Revé Database Migration Runner
 * Tracks all executed migrations in the `schema_migrations` table
 * to ensure `npm run migrate` never double-runs a migration.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

async function runMigrations() {
  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "QooFWwWTjm0Et7W1",
        database: process.env.DB_NAME || "reve_db"
      };

  console.log("Connecting to PostgreSQL database...");
  console.log(`Database: ${config.database} @ ${config.host || "remote"}:${config.port || 5432}`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // 1. Ensure schema_migrations history table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Query all previously executed migrations
    const res = await client.query("SELECT name FROM schema_migrations ORDER BY id ASC");
    const executedMigrations = new Set(res.rows.map(r => r.name));

    // 3. Read all .sql files in migrations/ folder
    const migrationsDir = path.join(__dirname, "..", "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("No migrations folder found.");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort(); // Run in deterministic order (001, 002, etc.)

    if (files.length === 0) {
      console.log("No .sql migration files found in migrations/.");
      return;
    }

    let appliedCount = 0;
    let skippedCount = 0;

    console.log(`\nFound ${files.length} migration file(s). Checking execution history...\n`);

    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`  [SKIPPED] ${file} (already executed in database)`);
        skippedCount++;
        continue;
      }

      console.log(`  [RUNNING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        await client.query("BEGIN");
        // Execute migration SQL
        await client.query(sql);
        // Record into migration history table
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");

        console.log(`  [APPLIED] ${file} successfully.`);
        appliedCount++;
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`\n[ERROR] Migration ${file} failed:`, err.message);
        throw err;
      }
    }

    console.log(`\nMigration run complete!`);
    console.log(`Applied: ${appliedCount} | Skipped (already run): ${skippedCount}`);
  } catch (err) {
    console.error("\nMigration error:", err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
