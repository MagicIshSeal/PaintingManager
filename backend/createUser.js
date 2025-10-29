import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { User } from "./models/user.js";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createUser() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Open database
    const db = await open({
      filename: path.join(dataDir, "database.sqlite"),
      driver: sqlite3.Database,
    });

    // Ensure users table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    console.log("\n🎨 Create Admin User for Schilderijen Beheer\n");

    const username = await question("Enter username: ");
    const password = await question("Enter password (min 6 characters): ");

    if (!username || !password) {
      console.log("❌ Username and password are required!");
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.log("❌ Password must be at least 6 characters!");
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(db, username);
    if (existingUser) {
      console.log("❌ Username already exists!");
      rl.close();
      process.exit(1);
    }

    // Create user
    const user = await User.create(db, username, password);
    console.log(`\n✅ User created successfully!`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}\n`);

    await db.close();
    rl.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    rl.close();
    process.exit(1);
  }
}

createUser();
