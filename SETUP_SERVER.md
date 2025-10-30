# 🚀 Server Setup Guide - Painting Manager

Complete guide for deploying and updating the Painting Manager on a Linux server with Docker.

## 📋 Prerequisites

- Linux server (Debian/Ubuntu)
- Docker and Docker Compose installed
- Git installed
- Port 8080 and 5173 open (or your chosen ports)

---

## 🆕 First Time Setup

### 1. Install Docker (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone the Repository

```bash
# Create directory for the project
mkdir -p ~/dockerstuff
cd ~/dockerstuff

# Clone the repository
git clone https://github.com/YOUR_USERNAME/PaintingManager.git painting-manager
cd painting-manager
```

### 3. Create the `.env` File

**This is critical!** Create a `.env` file in the project root:

```bash
nano .env
```

Add the following content (replace `YOUR_SERVER_IP` with your actual server IP):

```env
# Backend API URL (used by frontend)
VITE_API_URL=http://YOUR_SERVER_IP:8080

# Frontend URL (used by backend CORS)
FRONTEND_URL=http://YOUR_SERVER_IP:5173

# Backend URL (used for email images - must be accessible externally)
BACKEND_URL=http://YOUR_SERVER_IP:8080

# Session secret - CHANGE THIS to a random string!
SESSION_SECRET=change-this-to-something-random-and-secure

# Resend API Key (for email functionality)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Email from address (optional, defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL=your-verified-email@yourdomain.com
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### 4. Open Firewall Ports

```bash
# Allow HTTP traffic
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp

# Check firewall status
sudo ufw status
```

### 5. Build and Start

```bash
# Build and start all containers
docker-compose up -d --build

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

You should see:
```
✅ Database initialized successfully
✅ Backend running on http://0.0.0.0:8080
📝 CORS enabled for: http://YOUR_SERVER_IP:5173
📝 NODE_ENV: production
```

### 6. Create Your First User

```bash
# Enter the backend container
docker-compose exec backend sh

# Create a user
npm run create-user

# Follow the prompts to enter username and password
# Exit the container
exit
```

### 7. Access the Application

Open your browser and go to:
```
http://YOUR_SERVER_IP:5173
```

You should see the login page. Login with the credentials you just created!

### 8. (Optional) Test Email Functionality

If you configured the Resend API key, you can test email sending:

1. **Login to the application** at `http://YOUR_SERVER_IP:5173`

2. **Test the email endpoint** using curl (from your local machine or server):

```bash
# Replace YOUR_SESSION_COOKIE with your actual session cookie
curl -X POST http://YOUR_SERVER_IP:8080/api/test-email \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "message": "<p>Hello from Painting Manager!</p>"
  }'
```

3. **Or test from browser console** (while logged in):

```javascript
fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test Email',
    message: '<p>Hello from Painting Manager!</p>'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

You should receive an email at the specified address!

---

## 🔄 Updating the Server (Keeping Database Data)

When you have new code to deploy:

### 1. Pull Latest Code

```bash
cd ~/dockerstuff/painting-manager
git pull
```

### 2. Rebuild Containers

**Important**: Use this command to rebuild WITHOUT losing data:

```bash
docker-compose down
docker-compose up -d --build
```

**What this does:**
- ✅ Stops containers
- ✅ Rebuilds with new code
- ✅ **Keeps database data** (stored in `backend-data` volume)
- ✅ **Keeps uploaded images** (stored in `backend/uploads`)
- ✅ **Keeps your `.env` file**

### 3. Verify Update

```bash
# Check logs to ensure everything started correctly
docker-compose logs backend | tail -30
docker-compose logs frontend | tail -20

# Check running containers
docker-compose ps
```

---

## 💾 Database and Data Management

### Database Location

The database is stored in a Docker volume called `backend-data` at `/app/data`. This means:
- ✅ Data persists across container restarts
- ✅ Data persists when you rebuild containers
- ✅ Data is NOT lost when you run `docker-compose down`
- ✅ Sessions are also stored here and persist across restarts

### Backup Database

```bash
# Create backups directory
mkdir -p ~/backups

# Backup database from Docker volume
docker-compose exec backend cp /app/data/database.sqlite /app/data/database-backup.sqlite
docker cp $(docker-compose ps -q backend):/app/data/database-backup.sqlite ~/backups/database-$(date +%Y%m%d_%H%M%S).sqlite

# Backup session database too
docker cp $(docker-compose ps -q backend):/app/data/sessions.db ~/backups/sessions-$(date +%Y%m%d_%H%M%S).db

# Backup uploaded images
tar -czf ~/backups/uploads-$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

### Restore Database

```bash
# Stop containers
docker-compose down

# Restore database backup to volume
docker run --rm -v painting-manager_backend-data:/data -v ~/backups:/backups alpine sh -c "cp /backups/database-YYYYMMDD_HHMMSS.sqlite /data/database.sqlite"

# Restore uploads
tar -xzf ~/backups/uploads-YYYYMMDD_HHMMSS.tar.gz

# Start containers
docker-compose up -d
```

### Reset Everything (⚠️ DANGER - Deletes All Data!)

```bash
# Stop and remove containers AND volumes
docker-compose down -v

# Remove uploaded images
rm -rf backend/uploads/*

# Start fresh
docker-compose up -d --build

# Create new user
docker-compose exec backend npm run create-user
```

---

## 🔧 Troubleshooting

### Check Logs

```bash
# All logs
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50
```

### Container Status

```bash
# Check if containers are running
docker-compose ps

# Check container health
docker ps
```

### Common Issues

#### 1. Can't Login - CORS Error

**Problem**: Browser console shows CORS error

**Solution**: Check that `.env` file has correct server IP:
```bash
cat .env
```

Make sure `FRONTEND_URL` matches where you're accessing the site from.

#### 2. Backend Shows Wrong CORS Origin

**Problem**: Backend logs show `http://localhost:5173` instead of your server IP

**Solution**:
```bash
# Verify .env file
cat .env

# Rebuild completely
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs backend | grep CORS
```

#### 3. Port Already in Use

**Problem**: Error that port 8080 or 5173 is already in use

**Solution**:
```bash
# Find what's using the port
sudo lsof -i :8080
sudo lsof -i :5173

# Stop the process or change ports in docker-compose.yaml
```

#### 4. Database Locked Error

**Problem**: SQLite database is locked

**Solution**:
```bash
# Restart containers
docker-compose restart

# If that doesn't work
docker-compose down
docker-compose up -d
```

#### 5. Images Not Loading

**Problem**: Uploaded images return 404

**Solution**:
```bash
# Check if uploads directory exists
ls -la backend/uploads/

# Check volume mount
docker-compose exec backend ls -la /app/uploads/

# Restart if needed
docker-compose restart backend
```

---

## 🛡️ Security Recommendations

### 1. Change Session Secret

Edit `.env` and set a strong random string for `SESSION_SECRET`:

```bash
# Generate a random secret
openssl rand -hex 32

# Add it to .env
nano .env
```

### 2. Use HTTPS (Production)

For production, use a reverse proxy like Nginx with Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 3. Regular Backups

Set up a cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * cd ~/dockerstuff/painting-manager && docker-compose exec backend cp database.sqlite /app/database-backup.sqlite && docker cp $(docker-compose ps -q backend):/app/database-backup.sqlite ~/backups/database-$(date +\%Y\%m\%d).sqlite
```

### 4. Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (important!)
sudo ufw allow ssh

# Allow your application ports
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp

# Check status
sudo ufw status
```

---

## 📊 Maintenance Commands

```bash
# View disk usage
docker system df

# Clean up unused images/containers (doesn't affect data)
docker system prune -a

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Start services
docker-compose start

# View resource usage
docker stats
```

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify .env file**: `cat .env`
3. **Check container status**: `docker-compose ps`
4. **Verify environment variables**: `docker-compose config | grep -A 5 "FRONTEND_URL"`

---

## 📝 Summary

**First Setup:**
1. Install Docker
2. Clone repository
3. Create `.env` file with your server IP
4. Run `docker-compose up -d --build`
5. Create first user
6. Access application

**Update Code (Keep Data):**
1. `git pull`
2. `docker-compose down`
3. `docker-compose up -d --build`

**Backup Data:**
1. Backup database from Docker volume
2. Backup `backend/uploads/` directory

Your data is safe in Docker volumes and will persist across updates!

