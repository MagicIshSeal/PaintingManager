import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Database
const db = await open({ filename: "./database.sqlite", driver: sqlite3.Database });
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);
CREATE TABLE IF NOT EXISTS paintings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  artist TEXT,
  category TEXT,
  lent_to TEXT,
  due_date TEXT
);
`);

app.get("/api/paintings", async (req, res) => {
  const rows = await db.all("SELECT * FROM paintings");
  res.json(rows);
});

app.listen(8080, () => console.log("✅ Backend running on http://localhost:8080"));
