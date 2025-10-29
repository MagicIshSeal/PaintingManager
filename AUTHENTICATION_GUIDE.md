# 🔐 Authentication Guide - Painting Manager

Complete authentication documentation for the Painting Manager application.

## Overview

The application uses secure session-based authentication with Passport.js and bcrypt password hashing.

---

## Authentication Features

### Security
- ✅ **Bcrypt Password Hashing** - Passwords hashed with 10 salt rounds
- ✅ **Session Management** - HTTP-only cookies, 24-hour expiration
- ✅ **Protected Routes** - All painting operations require authentication
- ✅ **CORS Protection** - Credentials allowed only from configured origin
- ✅ **XSS Prevention** - HTTP-only cookies prevent JavaScript access

### User Management
- ✅ **User Registration** - Create accounts via CLI script
- ✅ **Login/Logout** - Session-based authentication
- ✅ **Password Requirements** - Minimum 6 characters
- ✅ **User Tracking** - Track who created/modified each painting

---

## API Endpoints

### Public Endpoints (No Auth Required)

```
POST /api/auth/login
Body: { username: string, password: string }
Response: { message: string, user: { id, username } }

POST /api/auth/logout
Response: { message: string }

GET /api/auth/status
Response: { authenticated: boolean, user?: { id, username } }
```

### Protected Endpoints (Authentication Required)

All painting endpoints require authentication:

```
GET    /api/paintings      # List all paintings
GET    /api/categories     # Get unique categories
POST   /api/paintings      # Create new painting
PUT    /api/paintings/:id  # Update painting
DELETE /api/paintings/:id  # Delete painting
```

Unauthenticated requests return `401 Unauthorized`.

---

## Creating Users

### Using the CLI Script (Recommended)

```bash
cd backend
npm run create-user
```

Follow the prompts to enter username and password.

### Programmatically

```javascript
import { User } from './models/user.js';

const user = await User.create(db, 'username', 'password');
console.log('User created:', user);
```

---

## Frontend Integration

### Auth Store (Pinia)

The frontend uses a Pinia store for authentication state:

```javascript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Login
await authStore.login(username, password);

// Check auth status
await authStore.checkAuth();

// Logout
await authStore.logout();

// Access user info
console.log(authStore.user);
console.log(authStore.isAuthenticated);
```

### Route Guards

Router automatically protects routes:

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = await authStore.checkAuth();

  if (to.path !== '/login' && !isAuthenticated) {
    next('/login');  // Redirect to login
  } else if (to.path === '/login' && isAuthenticated) {
    next('/paintings');  // Redirect authenticated users away from login
  } else {
    next();
  }
});
```

### API Calls with Credentials

All API calls must include credentials:

```javascript
fetch(`${API_URL}/api/paintings`, {
  credentials: 'include',  // Important! Sends session cookie
  // ... other options
})
```

---

## Configuration

### Backend Environment Variables

```env
SESSION_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Session Configuration

In `backend/server.js`:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  }
}));
```

### CORS Configuration

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Security Best Practices

### Development

```env
SESSION_SECRET=anything-works-for-dev
FRONTEND_URL=http://localhost:5173
```

### Production

1. **Strong Session Secret**

```bash
# Generate a strong secret
openssl rand -hex 32

# Add to .env
SESSION_SECRET=<generated-secret>
```

2. **Enable Secure Cookies (HTTPS Only)**

```javascript
cookie: {
  secure: true,  // Requires HTTPS
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'strict'  // Prevent CSRF
}
```

3. **Update CORS for Production Domain**

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

4. **Use HTTPS**
   - Deploy with SSL/TLS certificates
   - Use Let's Encrypt for free certificates
   - Configure reverse proxy (Nginx/Apache)

5. **Strong Password Policy**

Consider adding to `backend/models/user.js`:
```javascript
static validatePassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
```

---

## Troubleshooting

### "Invalid credentials" Error

**Causes:**
- Wrong username or password
- User doesn't exist
- Password not hashed correctly

**Solutions:**
```bash
# Recreate the user
cd backend
npm run create-user
```

### CORS Errors

**Problem:** Browser console shows CORS policy error

**Solutions:**
1. Check `FRONTEND_URL` in `.env` matches your frontend URL exactly
2. Verify backend logs show correct CORS origin
3. Rebuild containers: `docker-compose down && docker-compose up -d --build`

### Session Not Persisting

**Causes:**
- Cookie not being sent
- CORS not configured correctly
- Session expired

**Solutions:**
1. Verify `credentials: 'include'` on all fetch requests
2. Check browser DevTools > Application > Cookies
3. Clear cookies and login again
4. Check backend CORS allows credentials

### 401 Unauthorized Errors

**Causes:**
- Not logged in
- Session expired
- Cookie not sent

**Solutions:**
1. Check login status: `GET /api/auth/status`
2. Login again
3. Verify session cookie exists in browser
4. Check `credentials: 'include'` in API calls

### Login Works but API Calls Fail

**Problem:** Can login but can't fetch paintings

**Solutions:**
1. Check all API calls include `credentials: 'include'`
2. Verify session cookie domain matches backend domain
3. Check backend logs for authentication errors

---

## Testing

### Manual Testing

```bash
# Login and save session
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt -v

# Use session to access protected route
curl http://localhost:8080/api/paintings \
  -b cookies.txt -v

# Check auth status
curl http://localhost:8080/api/auth/status \
  -b cookies.txt -v

# Logout
curl -X POST http://localhost:8080/api/auth/logout \
  -b cookies.txt -v
```

### Browser Testing

1. Open DevTools (F12)
2. **Console Tab**: Check for errors
3. **Network Tab**: 
   - Check API response codes
   - Verify session cookies sent
4. **Application Tab > Cookies**:
   - Check session cookie exists
   - Verify `HttpOnly` flag is set

---

## Architecture

### Authentication Flow

```
┌──────────┐                 ┌──────────┐                ┌──────────┐
│  Client  │                 │  Backend │                │ Database │
└─────┬────┘                 └─────┬────┘                └─────┬────┘
      │                            │                           │
      │  POST /api/auth/login      │                           │
      │  {username, password}      │                           │
      ├──────────────────────────> │                           │
      │                            │  Find user by username    │
      │                            ├─────────────────────────> │
      │                            │                           │
      │                            │  <───── User data         │
      │                            │                           │
      │                            │  Compare password hash    │
      │                            │  (bcrypt.compare)         │
      │                            │                           │
      │  <─────────────────────────┤                           │
      │  Set-Cookie: session=...   │                           │
      │  {user: {id, username}}    │                           │
      │                            │                           │
      │  GET /api/paintings        │                           │
      │  Cookie: session=...       │                           │
      ├──────────────────────────> │                           │
      │                            │  Verify session           │
      │                            │  (Passport middleware)    │
      │                            │                           │
      │                            │  Query paintings          │
      │                            ├─────────────────────────> │
      │                            │  <───── Paintings         │
      │  <─────────────────────────┤                           │
      │  [paintings array]         │                           │
      │                            │                           │
```

### Password Hashing

```
Registration:
  User Input: "mypassword"
       ↓
  bcrypt.hash(password, 10)
       ↓
  "$2b$10$N9qo8uLO..." (stored in DB)

Login:
  User Input: "mypassword"
       ↓
  bcrypt.compare(input, stored_hash)
       ↓
  true/false
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL  -- bcrypt hash
);
```

### Paintings Table (with user tracking)

```sql
CREATE TABLE paintings (
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
  created_by TEXT,      -- Username who created
  created_at TEXT,      -- ISO timestamp
  modified_by TEXT,     -- Username who last modified
  modified_at TEXT      -- ISO timestamp
);
```

---

## Future Enhancements

Consider implementing:

- [ ] Password reset via email
- [ ] Remember me option (longer session)
- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed attempts
- [ ] Password strength meter
- [ ] User roles (admin, viewer, editor)
- [ ] Audit logging
- [ ] Rate limiting on auth endpoints
- [ ] Email verification
- [ ] OAuth providers (Google, GitHub)

---

## Summary

The Painting Manager uses industry-standard authentication:

- **Bcrypt** for secure password hashing
- **Passport.js** for authentication strategy
- **Express sessions** for state management
- **HTTP-only cookies** for security
- **CORS** configured for cross-origin requests

All painting operations require authentication, ensuring only authorized users can access and modify data.


## Overview

The application now has secure authentication using Passport.js with local strategy, bcrypt password hashing, and session management.

## Features Implemented

### Backend (Node.js/Express)

- ✅ **Passport.js Local Strategy** - Secure username/password authentication
- ✅ **Bcrypt** - Password hashing with salt rounds
- ✅ **Express Sessions** - Session-based authentication with cookies
- ✅ **Protected API Routes** - All painting routes require authentication
- ✅ **Auth Routes**:
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `POST /api/auth/logout` - Logout user
  - `GET /api/auth/status` - Check authentication status

### Frontend (Vue.js)

- ✅ **Login/Register UI** - Clean, user-friendly login page
- ✅ **Pinia Auth Store** - Centralized authentication state management
- ✅ **Route Guards** - Automatic redirect to login for unauthenticated users
- ✅ **Persistent Sessions** - User stays logged in across page refreshes
- ✅ **Logout Button** - Visible in header when authenticated

## Getting Started

### 1. Start the Backend

```bash
cd backend
node server.js
```

### 2. Create Your First Admin User

Option A - Using the create user script:

```bash
cd backend
node createUser.js
```

Follow the prompts to enter username and password.

Option B - Using the register endpoint directly:

- Start the backend
- Open the application in your browser
- Click "Geen account? Registreren" on the login page
- Enter your desired username and password (min 6 characters)

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

### 4. Login

- Navigate to `http://localhost:5173`
- You'll automatically be redirected to `/login`
- Enter your credentials
- Upon successful login, you'll be redirected to the paintings page

## Security Features

### Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords must be at least 6 characters
- Plain text passwords are never stored

### Session Security

- HTTP-only cookies prevent XSS attacks
- Sessions expire after 24 hours
- Secure cookie flag should be enabled in production (HTTPS)

### API Protection

- All painting CRUD operations require authentication
- Unauthenticated requests return 401 Unauthorized
- Sessions are validated on every protected request

## Configuration

### Backend Environment Variables

Add to your `.env` file:

```env
SESSION_SECRET=your-secret-key-here-change-in-production
```

### Frontend Configuration

The frontend automatically connects to `http://localhost:8080` for the API.

For production, set the `VITE_API_URL` environment variable:

```env
VITE_API_URL=https://your-production-api.com
```

## Production Deployment

### Important Security Changes for Production:

1. **Update CORS settings** in `backend/server.js`:

   ```javascript
   app.use(
     cors({
       origin: "https://your-frontend-domain.com",
       credentials: true,
     })
   );
   ```

2. **Enable secure cookies** in `backend/server.js`:

   ```javascript
   app.use(
     session({
       secret: process.env.SESSION_SECRET,
       cookie: {
         secure: true, // Enable for HTTPS
         httpOnly: true,
         maxAge: 24 * 60 * 60 * 1000,
       },
     })
   );
   ```

3. **Use strong session secret**:

   - Generate a strong random secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Set it in your production environment variables

4. **Use HTTPS**:
   - Deploy both frontend and backend with SSL/TLS certificates
   - Consider using Let's Encrypt for free certificates

## User Management

### Create Additional Users

Run the create user script:

```bash
cd backend
node createUser.js
```

### Password Requirements

- Minimum 6 characters
- Consider enforcing stronger passwords in production (uppercase, lowercase, numbers, special characters)

## Troubleshooting

### Login Not Working

1. Check that backend is running on port 8080
2. Check browser console for CORS errors
3. Verify session cookie is being set (check browser DevTools > Application > Cookies)
4. Ensure `credentials: 'include'` is set on all fetch requests

### Session Not Persisting

1. Check cookie settings in `server.js`
2. Verify `credentials: 'include'` is set on all API calls
3. Check that CORS origin matches your frontend URL exactly
4. Clear browser cookies and try again

### 401 Unauthorized Errors

1. Verify you're logged in (check `/api/auth/status`)
2. Check that session cookie is present
3. Ensure session hasn't expired (24 hour default)

## API Endpoints

### Authentication Endpoints (Public)

```
POST /api/auth/register
Body: { username: string, password: string }
Response: { message: string, user: { id, username } }

POST /api/auth/login
Body: { username: string, password: string }
Response: { message: string, user: { id, username } }

POST /api/auth/logout
Response: { message: string }

GET /api/auth/status
Response: { authenticated: boolean, user?: { id, username } }
```

### Painting Endpoints (Protected - Requires Authentication)

```
GET /api/paintings
GET /api/categories
POST /api/paintings
PUT /api/paintings/:id
DELETE /api/paintings/:id
```

## Testing

### Manual Testing

1. Try accessing `/paintings` without logging in - should redirect to `/login`
2. Try making API calls without authentication - should return 401
3. Login and verify redirect to `/paintings`
4. Verify paintings load correctly
5. Logout and verify redirect to `/login`
6. Verify session persists after page refresh

### Testing with cURL

```bash
# Login and save session cookie
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  -c cookies.txt

# Access protected route with session
curl http://localhost:8080/api/paintings \
  -b cookies.txt

# Check auth status
curl http://localhost:8080/api/auth/status \
  -b cookies.txt
```

## Next Steps

Consider implementing:

- [ ] Password reset functionality via email
- [ ] Remember me option for longer sessions
- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] User roles and permissions (admin, viewer, etc.)
- [ ] Audit logging for security events
- [ ] Rate limiting on auth endpoints

## Support

If you encounter issues, check:

1. Backend logs in the terminal
2. Browser console for errors
3. Network tab in DevTools for API responses
4. Session cookie in DevTools > Application > Cookies
