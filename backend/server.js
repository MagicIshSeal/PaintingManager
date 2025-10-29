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
import connectSqlite3 from "connect-sqlite3";
import { Resend } from "resend";
import { sendLendingNotification } from "./utils/email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file for local development FIRST
// In Docker, environment variables are passed directly via docker-compose
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SQLiteStore = connectSqlite3(session);

// Initialize Resend only if API key is provided
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend email client initialized');
} else {
  console.log('⚠️  RESEND_API_KEY not set - email functionality disabled');
}

const app = express();

// Create data and uploads directories if they don't exist
const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
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
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: dataDir
  }),
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

// Database initialization with error handling
let db;
try {
  db = await open({ 
    filename: path.join(dataDir, "database.sqlite"), 
    driver: sqlite3.Database 
  });
  
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
  
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

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
    
    // If painting is created with lending info, send notification email
    if (lent_to && lent_email && resend) {
      try {
        const paintingDetails = {
          title,
          lent_to,
          lent_email,
          lent_phone,
          lent_date,
          due_date,
          address,
          category
        };
        
        await sendLendingNotification(resend, paintingDetails);
        console.log(`✅ Lending notification sent to ${lent_email} for new painting: ${title}`);
      } catch (emailError) {
        // Log error but don't fail the creation
        console.error('❌ Failed to send lending notification email:', emailError.message);
      }
    }
    
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
    // Get existing painting to check for old image and lending status
    const existing = await db.get("SELECT image_url, lent_to, lent_email FROM paintings WHERE id = ?", [id]);
    
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
    
    // Update the painting
    await db.run(
      "UPDATE paintings SET title = ?, address = ?, category = ?, image_url = ?, lent_to = ?, lent_email = ?, lent_phone = ?, lent_date = ?, due_date = ?, modified_by = ?, modified_at = ? WHERE id = ?",
      [title, address || null, category || null, image_url, lent_to || null, lent_email || null, lent_phone || null, lent_date || null, due_date || null, username, timestamp, id]
    );
    
    // Check if painting is being newly lent out (wasn't lent before, now is)
    const wasNotLent = !existing?.lent_to || !existing?.lent_email;
    const isNowLent = lent_to && lent_email;
    
    if (wasNotLent && isNowLent && resend) {
      try {
        // Send lending notification email
        const paintingDetails = {
          title,
          lent_to,
          lent_email,
          lent_phone,
          lent_date,
          due_date,
          address,
          category
        };
        
        await sendLendingNotification(resend, paintingDetails);
        console.log(`✅ Lending notification sent to ${lent_email} for painting: ${title}`);
      } catch (emailError) {
        // Log error but don't fail the update
        console.error('❌ Failed to send lending notification email:', emailError.message);
      }
    }
    
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

// Test email endpoint - Protected route
app.post("/api/test-email", isAuthenticated, async (req, res) => {
  try {
    if (!resend) {
      return res.status(500).json({ 
        error: "Email service not configured. Please set RESEND_API_KEY in your .env file." 
      });
    }

    const { to, subject, message } = req.body;
    
    // Use provided email or default to user's email if available
    const recipientEmail = to || 'maxvaneikeren@gmail.com';
    const emailSubject = subject || 'Test Email from Painting Manager';
    const emailMessage = message || '<p>This is a <strong>test email</strong> from your Painting Manager application!</p>';

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: recipientEmail,
      subject: emailSubject,
      html: emailMessage
    });

    console.log('✅ Email sent successfully:', data);
    res.json({ 
      success: true, 
      message: "Email sent successfully!", 
      data: data 
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.body || 'No additional details'
    });
  }
});

// Multer and general error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Listen on all interfaces for Docker
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
  console.log(`📝 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📝 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(async () => {
    console.log('📡 HTTP server closed');
    try {
      await db.close();
      console.log('💾 Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing database:', error);
      process.exit(1);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
