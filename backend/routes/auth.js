import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models/user.js";

export function setupAuth(app, db) {
  // Configure Passport Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findByUsername(db, username);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const isValid = await User.comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(db, id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const router = express.Router();

  // Register route - Disabled for admin-only access
  // Use the createUser.js script to create admin accounts
  /*
  router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
      const existingUser = await User.findByUsername(db, username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await User.create(db, username, password);
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login after registration failed" });
        }
        res.status(201).json({ message: "User registered successfully", user: { id: user.id, username: user.username } });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  */

  // Login route
  router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
      });
    })(req, res, next);
  });

  // Logout route
  router.post("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check authentication status
  router.get("/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ authenticated: true, user: { id: req.user.id, username: req.user.username } });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.use("/api/auth", router);
}

// Middleware to check if user is authenticated
export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please login." });
}
