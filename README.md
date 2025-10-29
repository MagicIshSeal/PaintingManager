# 🎨 Painting Manager - Schilderijen Beheer Systeem

A secure web application for managing paintings with authentication, image uploads, and lending tracking.

## 📚 Quick Links

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes (local development)
- **[SETUP_SERVER.md](SETUP_SERVER.md)** - Deploy to a server with Docker
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication details and security

## 🚀 Features

- ✅ **Secure Authentication** - Login required, session-based auth with bcrypt
- ✅ **Painting Management** - Add, edit, delete paintings with images
- ✅ **Lending Tracking** - Track who borrowed paintings and when they're due
- ✅ **Category Management** - Organize paintings by category
- ✅ **Image Upload** - Upload and store painting images
- ✅ **User Tracking** - See who created/modified each painting
- ✅ **Responsive UI** - Works on desktop and mobile

## 🛠️ Technology Stack

- **Frontend**: Vue 3 + Vite + Pinia
- **Backend**: Node.js + Express + Passport.js
- **Database**: SQLite
- **Deployment**: Docker + Docker Compose

## 📖 Documentation

### For Local Development
See [QUICKSTART.md](QUICKSTART.md)

### For Server Deployment
See [SETUP_SERVER.md](SETUP_SERVER.md)

### For Authentication Details
See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)

## 🔐 Security

- Passwords hashed with bcrypt
- Session-based authentication (24h sessions)
- HTTP-only cookies prevent XSS
- CORS configured for specific origins
- All painting routes require authentication

## 📝 License

MIT
