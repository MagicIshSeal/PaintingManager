import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function migrate() {
  console.log("Starting migration...");
  
  const db = await open({ 
    filename: "./database.sqlite", 
    driver: sqlite3.Database 
  });

  try {
    // Check current schema
    const tableInfo = await db.all("PRAGMA table_info(paintings)");
    console.log("Current columns:", tableInfo.map(col => col.name));

    const columnNames = tableInfo.map(col => col.name);

    // Add missing columns
    if (!columnNames.includes('address')) {
      console.log("Adding 'address' column...");
      await db.exec("ALTER TABLE paintings ADD COLUMN address TEXT");
    }

    if (!columnNames.includes('image_url')) {
      console.log("Adding 'image_url' column...");
      await db.exec("ALTER TABLE paintings ADD COLUMN image_url TEXT");
    }

    if (!columnNames.includes('lent_email')) {
      console.log("Adding 'lent_email' column...");
      await db.exec("ALTER TABLE paintings ADD COLUMN lent_email TEXT");
    }

    if (!columnNames.includes('lent_phone')) {
      console.log("Adding 'lent_phone' column...");
      await db.exec("ALTER TABLE paintings ADD COLUMN lent_phone TEXT");
    }

    if (!columnNames.includes('lent_date')) {
      console.log("Adding 'lent_date' column...");
      await db.exec("ALTER TABLE paintings ADD COLUMN lent_date TEXT");
    }

    // Remove old columns (SQLite doesn't support DROP COLUMN easily, so we skip this)
    // If you have 'artist' or 'location' columns, they'll just be unused

    const newTableInfo = await db.all("PRAGMA table_info(paintings)");
    console.log("Updated columns:", newTableInfo.map(col => col.name));

    console.log("✅ Migration complete!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await db.close();
  }
}

migrate();
