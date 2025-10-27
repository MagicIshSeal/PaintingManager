# 🐳 Docker Guide - Schilderijen Beheer Systeem

## Vereisten

Voordat je begint, zorg dat je het volgende geïnstalleerd hebt:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) voor Windows
- [Git](https://git-scm.com/downloads) (optioneel, als je het project wilt clonen)

## Snelle Start

### 1. Eerste Keer Opzetten

```powershell
# Zorg dat je in de project directory bent
cd C:\Users\mvane\Documents\GItHub\Haans

# Maak .env bestand aan (optioneel - alleen nodig voor email notificaties)
# Copy .env.example to .env and fill in your email credentials
copy .env.example .env

# Bouw en start alle containers
docker-compose up --build
```

De applicatie is nu beschikbaar op:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080

### 2. Stoppen van de Applicatie

```powershell
# Stop alle containers (Ctrl+C in de terminal, of in een nieuwe terminal:)
docker-compose down
```

### 3. Herstarten van de Applicatie

```powershell
# Start containers zonder opnieuw te bouwen
docker-compose up

# Of in detached mode (op de achtergrond)
docker-compose up -d
```

## Gedetailleerde Commando's

### Container Beheer

```powershell
# Containers starten (detached mode - draait op achtergrond)
docker-compose up -d

# Containers stoppen
docker-compose stop

# Containers stoppen en verwijderen
docker-compose down

# Containers opnieuw bouwen (na code wijzigingen)
docker-compose up --build

# Containers opnieuw bouwen zonder cache
docker-compose build --no-cache
```

### Logs Bekijken

```powershell
# Alle logs bekijken
docker-compose logs

# Alleen backend logs
docker-compose logs backend

# Alleen frontend logs
docker-compose logs frontend

# Logs live volgen (zoals tail -f)
docker-compose logs -f

# Laatste 100 regels van logs
docker-compose logs --tail=100
```

### Container Status

```powershell
# Bekijk draaiende containers
docker-compose ps

# Bekijk gedetailleerde container info
docker ps

# Bekijk alle containers (ook gestopte)
docker ps -a
```

### In een Container Gaan

```powershell
# Open shell in backend container
docker-compose exec backend sh

# Open shell in frontend container
docker-compose exec frontend sh

# Als containers niet draaien, gebruik:
docker-compose run backend sh
```

### Database Beheer

```powershell
# Maak backup van database
copy backend\database.sqlite backend\database.sqlite.backup

# Database reset (LET OP: verwijdert alle data!)
# Stop eerst de containers
docker-compose down

# Verwijder database
del backend\database.sqlite

# Start opnieuw (maakt nieuwe lege database)
docker-compose up
```

### Uploads Beheer

```powershell
# Bekijk geüploade afbeeldingen
dir backend\uploads

# Maak backup van uploads
xcopy backend\uploads backend\uploads_backup /E /I

# Verwijder alle uploads (LET OP: verwijdert alle afbeeldingen!)
docker-compose down
rmdir /s backend\uploads
mkdir backend\uploads
```

## Troubleshooting

### Poorten al in gebruik

Als je de fout krijgt dat poort 8080 of 5173 al in gebruik is:

```powershell
# Vind welk proces de poort gebruikt
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Stop het proces (vervang <PID> met het process ID)
taskkill /PID <PID> /F

# Of wijzig de poorten in docker-compose.yaml:
# Voor backend: "8081:8080" (host:container)
# Voor frontend: "3000:80"
```

### Containers bouwen niet

```powershell
# Verwijder alle images en bouw opnieuw
docker-compose down --rmi all
docker-compose up --build
```

### Database problemen

```powershell
# Reset de database (LET OP: verwijdert alle data!)
docker-compose down -v
docker-compose up --build
```

### Schijfruimte opruimen

```powershell
# Verwijder ongebruikte images, containers en volumes
docker system prune -a --volumes

# Bekijk schijfgebruik
docker system df
```

## Productie Deployment

### Optimalisatie voor Productie

1. **Update docker-compose.yaml** voor productie:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    volumes:
      - ./backend/database.sqlite:/app/database.sqlite
      - ./backend/uploads:/app/uploads
    environment:
      - NODE_ENV=production
    restart: always  # Changed from unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"  # Changed to port 80
    depends_on:
      - backend
    restart: always
```

2. **Start in productie mode**:

```powershell
docker-compose -f docker-compose.yaml up -d
```

### Backups

Maak regelmatig backups van belangrijke data:

```powershell
# Backup script voorbeeld
$backupDir = "backups\$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
New-Item -ItemType Directory -Path $backupDir
Copy-Item backend\database.sqlite $backupDir\
Copy-Item backend\uploads $backupDir\ -Recurse
```

## Updates Installeren

Na het wijzigen van code:

```powershell
# Stop containers
docker-compose down

# Rebuild en start
docker-compose up --build -d

# Bekijk logs om te controleren
docker-compose logs -f
```

## Docker Desktop Tips

1. **Open Docker Desktop** om containers visueel te beheren
2. **Containers tab**: Zie draaiende containers en hun status
3. **Images tab**: Beheer Docker images
4. **Volumes tab**: Beheer persistent storage
5. **Settings > Resources**: Pas CPU/Memory toe aan Docker

## Belangrijke Bestanden

- `docker-compose.yaml` - Configuratie voor alle services
- `backend/Dockerfile` - Backend container configuratie
- `frontend/Dockerfile` - Frontend container configuratie
- `.env` - Environment variabelen (niet in git)
- `.dockerignore` - Bestanden die niet in container komen

## Performance Tips

1. **Gebruik volumes voor development**:
   - Database en uploads blijven behouden tussen restarts

2. **Build cache**:
   - Docker cached layers voor snellere rebuilds
   - Gebruik `--no-cache` alleen als er problemen zijn

3. **Resource limits**:
   - In Docker Desktop: Settings > Resources
   - Geef minstens 2GB RAM en 2 CPU cores

## Veelgestelde Vragen

**Q: Hoe update ik npm packages?**
```powershell
docker-compose exec backend npm install <package-name>
docker-compose exec frontend npm install <package-name>
# Rebuild daarna de containers
docker-compose up --build
```

**Q: Kan ik de database direct bewerken?**
```powershell
docker-compose exec backend sh
sqlite3 database.sqlite
```

**Q: Hoe maak ik de applicatie toegankelijk vanaf andere computers?**
- Zorg dat Windows Firewall de poorten toestaat
- Gebruik je lokale IP adres: `http://192.168.1.XXX:5173`
- Of wijzig CORS settings in backend/server.js

**Q: Waar worden de afbeeldingen opgeslagen?**
- Lokaal: `backend/uploads/`
- Deze directory wordt gekoppeld aan de container via volume

## Extra Informatie

### Architectuur

```
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │─────▶│     Backend     │
│   (Vue + Vite)  │      │  (Node + Express)│
│   Port: 5173    │      │   Port: 8080    │
└─────────────────┘      └─────────────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                    ┌────▼─────┐    ┌─────▼────┐
                    │ Database │    │ Uploads  │
                    │ (SQLite) │    │  (Files) │
                    └──────────┘    └──────────┘
```

### Nuttige Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

---

**Need help?** Check de logs met `docker-compose logs -f` voor error messages.
