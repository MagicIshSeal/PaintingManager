import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function migrate() {
  try {
    console.log("🔄 Running database migration...\n");
    
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    // Check if columns already exist
    const tableInfo = await db.all("PRAGMA table_info(paintings)");
    const columnNames = tableInfo.map(col => col.name);

    const columnsToAdd = [
      { name: 'created_by', type: 'TEXT' },
      { name: 'created_at', type: 'TEXT' },
      { name: 'modified_by', type: 'TEXT' },
      { name: 'modified_at', type: 'TEXT' }
    ];

    for (const column of columnsToAdd) {
      if (!columnNames.includes(column.name)) {
        await db.exec(`ALTER TABLE paintings ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⏭️  Column already exists: ${column.name}`);
      }
    }

    await db.close();
    console.log("\n✅ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
