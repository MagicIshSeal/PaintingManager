import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { setupAuth, isAuthenticated } from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file for local development
// In Docker, environment variables are passed directly via docker-compose
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

app.use(express.json());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(session({ 
  secret: process.env.SESSION_SECRET || "secret-key-change-in-production", 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded images
app.use("/uploads", express.static(uploadsDir));

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
  address TEXT,
  category TEXT,
  image_url TEXT,
  lent_to TEXT,
  lent_email TEXT,
  lent_phone TEXT,
  lent_date TEXT,
  due_date TEXT,
  created_by TEXT,
  created_at TEXT,
  modified_by TEXT,
  modified_at TEXT
);
`);

// Setup authentication routes
setupAuth(app, db);

// Get all paintings - Protected route
app.get("/api/paintings", isAuthenticated, async (req, res) => {
  const rows = await db.all("SELECT * FROM paintings ORDER BY id DESC");
  res.json(rows);
});

// Get all unique categories - Protected route
app.get("/api/categories", isAuthenticated, async (req, res) => {
  const rows = await db.all("SELECT DISTINCT category FROM paintings WHERE category IS NOT NULL AND category != '' ORDER BY category");
  res.json(rows.map(row => row.category));
});

// Add new painting - Protected route
app.post("/api/paintings", isAuthenticated, upload.single("image"), async (req, res) => {
  const { title, address, category, lent_to, lent_email, lent_phone, lent_date, due_date } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  const username = req.user.username;
  const timestamp = new Date().toISOString();
  
  try {
    const result = await db.run(
      "INSERT INTO paintings (title, address, category, image_url, lent_to, lent_email, lent_phone, lent_date, due_date, created_by, created_at, modified_by, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, address || null, category || null, image_url, lent_to || null, lent_email || null, lent_phone || null, lent_date || null, due_date || null, username, timestamp, username, timestamp]
    );
    res.status(201).json({ id: result.lastID, message: "Painting added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update painting - Protected route
app.put("/api/paintings/:id", isAuthenticated, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, address, category, lent_to, lent_email, lent_phone, lent_date, due_date } = req.body;
  const username = req.user.username;
  const timestamp = new Date().toISOString();
  
  try {
    // Get existing painting to check for old image
    const existing = await db.get("SELECT image_url FROM paintings WHERE id = ?", [id]);
    
    let image_url = existing?.image_url;
    
    // If new image is uploaded, delete old one and use new one
    if (req.file) {
      if (existing?.image_url) {
        const oldImagePath = path.join(__dirname, existing.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }
    
    await db.run(
      "UPDATE paintings SET title = ?, address = ?, category = ?, image_url = ?, lent_to = ?, lent_email = ?, lent_phone = ?, lent_date = ?, due_date = ?, modified_by = ?, modified_at = ? WHERE id = ?",
      [title, address || null, category || null, image_url, lent_to || null, lent_email || null, lent_phone || null, lent_date || null, due_date || null, username, timestamp, id]
    );
    res.json({ message: "Painting updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete painting - Protected route
app.delete("/api/paintings/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    // Get painting to delete associated image
    const painting = await db.get("SELECT image_url FROM paintings WHERE id = ?", [id]);
    
    // Delete the image file if it exists
    if (painting?.image_url) {
      const imagePath = path.join(__dirname, painting.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await db.run("DELETE FROM paintings WHERE id = ?", [id]);
    res.json({ message: "Painting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Listen on all interfaces for Docker
app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
  console.log(`📝 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📝 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
