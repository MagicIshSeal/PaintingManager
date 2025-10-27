# Authentication Setup Guide

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
