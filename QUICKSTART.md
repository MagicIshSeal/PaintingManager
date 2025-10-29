# 🎨 Quick Start - Painting Manager

Get the Painting Manager running locally in 5 minutes!

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))

---

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/PaintingManager.git
cd PaintingManager
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
cd ..
```

### 3. Start Backend

```bash
cd backend
npm start
```

You should see:
```
✅ Backend running on http://0.0.0.0:8080
📝 CORS enabled for: http://localhost:5173
```

**Keep this terminal open!**

### 4. Create Your First User

Open a **new terminal** (keep the backend running):

```bash
cd backend
npm run create-user
```

Follow the prompts:
- Enter username (e.g., `admin`)
- Enter password (min 6 characters)

You should see:
```
✅ User created successfully!
   ID: 1
   Username: admin
```

### 5. Start Frontend

Open another **new terminal**:

```bash
cd frontend
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

### 6. Login and Use!

1. Open browser: **http://localhost:5173**
2. You'll see the login page
3. Enter your username and password
4. Start managing paintings! 🎨

---

## 🔐 Authentication

The application requires login to access any features:

- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication (24 hours)
- ✅ All painting routes protected
- ✅ Auto-redirect to login if not authenticated

---

## 📚 Available Scripts

### Backend (`backend/` directory)

```bash
npm start              # Start the backend server
npm run create-user    # Create a new user account
```

### Frontend (`frontend/` directory)

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

---

## 🛠️ Development Workflow

### Making Changes

1. **Backend changes**: Restart the backend server (Ctrl+C, then `npm start`)
2. **Frontend changes**: Vite will auto-reload (no restart needed)
3. **Database changes**: Modify `backend/server.js` schema and restart

### Creating Additional Users

```bash
cd backend
npm run create-user
```

### Resetting Database (⚠️ Deletes all data!)

```bash
cd backend
rm -rf data/database.sqlite data/sessions.db
npm start  # Creates new empty database
npm run create-user  # Create new user
```

---

## 🗂️ Project Structure

```
PaintingManager/
├── backend/
│   ├── server.js              # Main backend server
│   ├── createUser.js          # User creation script
│   ├── data/                  # Data directory (auto-created)
│   │   ├── database.sqlite    # SQLite database
│   │   └── sessions.db        # Session store
│   ├── models/
│   │   ├── user.js           # User model with auth
│   │   └── painting.js       # Painting model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── paintings.js      # Painting CRUD routes
│   └── uploads/              # Uploaded images
│
├── frontend/
│   ├── src/
│   │   ├── App.vue           # Main app component
│   │   ├── main.js           # App entry point
│   │   ├── config.js         # API configuration
│   │   ├── views/
│   │   │   ├── LoginView.vue      # Login/register page
│   │   │   ├── PaintingView.vue   # Main painting manager
│   │   │   └── CalendarView.vue   # Calendar view
│   │   ├── stores/
│   │   │   └── auth.js       # Authentication store (Pinia)
│   │   └── router/
│   │       └── index.js      # Route configuration
│   └── package.json
│
├── docker-compose.yaml        # Docker deployment config
├── .env                       # Environment variables (create this)
├── QUICKSTART.md             # This file
├── SETUP_SERVER.md           # Server deployment guide
└── AUTHENTICATION_GUIDE.md   # Auth details
```

---

## 🔧 Configuration

### Environment Variables (Optional for Local Dev)

Create a `.env` file in the project root (optional for local development):

```env
# Session secret for authentication
SESSION_SECRET=your-secret-key-here

# These are only needed for server deployment
VITE_API_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
```

For local development, the defaults work fine!

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Port 8080 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill <PID>
```

### Frontend won't start

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill <PID>
```

### Can't Login

**Problem**: "Invalid credentials" error

**Solution**:
1. Make sure backend is running
2. Check you created a user: `cd backend && npm run create-user`
3. Clear browser cookies and try again
4. Check backend logs for errors

### API Calls Failing

**Problem**: Network errors in browser console

**Solution**:
1. Verify backend is running on `http://localhost:8080`
2. Check `frontend/src/config.js` has correct API_URL
3. Look for CORS errors in browser console
4. Check backend terminal for error messages

### Database Errors

**Problem**: SQLite errors or locked database

**Solution**:
```bash
cd backend
# Stop the backend (Ctrl+C)
# Restart it
npm start
```

### Images Not Uploading

**Problem**: Image upload fails

**Solution**:
1. Check `backend/uploads/` directory exists
2. Check file size (max 5MB)
3. Check file type (only images allowed)
4. Look at backend logs for errors

---

## 📖 Next Steps

- **Deploy to server?** → See [SETUP_SERVER.md](SETUP_SERVER.md)
- **Authentication details?** → See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)
- **Add features?** → Start editing code!

---

## 🎯 Features

Once logged in, you can:

- ✅ Add new paintings with images
- ✅ Edit existing paintings
- ✅ Delete paintings
- ✅ Track lending information (who, when, contact details)
- ✅ Organize by categories
- ✅ Filter by availability (available/lent)
- ✅ View in calendar format
- ✅ See who created/modified each painting

---

## 🆘 Getting Help

If you're stuck:

1. **Check the logs**: Look at backend terminal output
2. **Check browser console**: Press F12 to see errors
3. **Read error messages**: They usually tell you what's wrong!
4. **Try restarting**: Stop and restart both backend and frontend

---

Enjoy managing your paintings! 🎨
