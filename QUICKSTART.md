# 🎨 Schilderijen Beheer - Quick Start with Authentication

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Backend

```powershell
cd backend
npm start
# Server will run on http://localhost:8080
```

### 3. Create Your First User

Open a new terminal:

```powershell
cd backend
npm run create-user
```

Follow the prompts to create your admin account.

### 4. Start Frontend

Open another terminal:

```powershell
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### 5. Login & Use

1. Open http://localhost:5173 in your browser
2. You'll be redirected to the login page
3. Enter your credentials from step 3
4. Start managing your paintings! 🎨

## 🔐 Authentication

The application now requires login to access. Key features:

- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication with Passport.js
- ✅ Protected API routes
- ✅ Auto-redirect to login for unauthenticated users
- ✅ 24-hour session duration

## 📚 Documentation

- **[AUTHENTICATION_SUMMARY.md](AUTHENTICATION_SUMMARY.md)** - Quick overview of changes
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Complete setup & security guide
- **[SETUP_SERVER.md](SETUP_SERVER.md)** - Server deployment instructions
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Docker setup instructions

## 🛠️ Available Scripts

### Backend

```powershell
npm start          # Start the backend server
npm run create-user # Create a new user via CLI
```

### Frontend

```powershell
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## ⚙️ Configuration

Edit `.env` file in the root directory:

```env
SESSION_SECRET=your-secret-key-here
EMAIL=youremail@example.com
PASS=your-email-password
VITE_API_URL=http://localhost:8080
```

**Important**: Change `SESSION_SECRET` to a strong random string in production!

## 🔒 Security Notes

- All painting management routes require authentication
- Passwords are hashed and never stored in plain text
- Sessions use HTTP-only cookies to prevent XSS
- CORS is configured to allow credentials

## 📝 First Login

If you haven't created a user yet:

1. Run `npm run create-user` in the backend directory
2. Or use the "Registreren" button on the login page

## 🆘 Troubleshooting

**Can't login?**

- Ensure backend is running on port 8080
- Check that you created a user
- Clear browser cookies and try again

**401 Unauthorized errors?**

- Make sure you're logged in
- Session may have expired (24 hours)
- Try logging in again

**More help?**
See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for detailed troubleshooting.

## 🎯 What's New

All features from before, now secured with authentication:

- Add, edit, and delete paintings
- Upload images
- Track lending information
- Category management
- Filter by status (available/lent)
- **NEW**: Login required for all operations
- **NEW**: User registration and management
- **NEW**: Secure session handling

Enjoy your secure painting manager! 🖼️
