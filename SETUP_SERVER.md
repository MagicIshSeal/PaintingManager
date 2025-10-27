# 🚀 Quick Setup for Linux Server

## Step 1: Upload files to server

```bash
cd ~/dockerstuff/painting-manager
git pull  # or upload new files
```

## Step 2: Set your server IP

Edit the `.env` file:

```bash
nano .env
```

Change `YOUR_SERVER_IP` to your actual server IP:

```
VITE_API_URL=http://192.168.1.100:8080
```

Replace `192.168.1.100` with your server's IP address!

## Step 3: Rebuild and deploy

```bash
# Stop old containers
docker-compose down

# Rebuild with new API URL
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

## Step 4: Test

Open in browser: `http://YOUR_SERVER_IP:5173`

Try adding a painting - it should work now!

## Troubleshooting

### Still can't add paintings?

1. Check browser console (F12) for errors
2. Make sure you changed YOUR_SERVER_IP in .env
3. Verify backend is running: `curl http://localhost:8080/api/paintings`
4. Check CORS in logs: `docker-compose logs backend`

### Can't access from outside?

```bash
# Open firewall ports
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
```
