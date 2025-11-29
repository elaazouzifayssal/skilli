# Quick Commands Reference

This is a cheat sheet of all the commands you'll need during development.

## First-Time Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init_auth_schema
npx prisma generate
```

### Mobile
```bash
cd mobile
npm install
npx expo install @react-native-async-storage/async-storage
cp .env.example .env
# Edit .env and set correct API_URL
```

### Database (Docker)
```bash
# From project root
docker-compose up postgres -d
```

## Daily Development

### Start Backend (Local)
```bash
cd backend
npm run start:dev
```

### Start Mobile
```bash
cd mobile
npx expo start
```

Then press:
- `i` - iOS simulator
- `a` - Android emulator
- Scan QR - Physical device with Expo Go

### Start Database
```bash
docker-compose up postgres -d
```

## Database Commands

### View Database in Browser
```bash
cd backend
npx prisma studio
# Opens http://localhost:5555
```

### Create Migration (after schema changes)
```bash
cd backend
npx prisma migrate dev --name description_of_change
npx prisma generate
```

### Reset Database (WARNING: Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

### Seed Database (if you create seed file)
```bash
cd backend
npx prisma db seed
```

## Testing

### Test Backend Health
```bash
curl http://localhost:3000/api/health
```

### Test Register (via curl)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test Login (via curl)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route (via curl)
```bash
# First get token from login response, then:
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Docker Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just postgres
docker-compose logs -f postgres
```

### Restart Service
```bash
docker-compose restart postgres
docker-compose restart backend
```

### View Running Containers
```bash
docker-compose ps
```

### Access PostgreSQL Shell
```bash
docker-compose exec postgres psql -U postgres -d skilli_db
```

## Troubleshooting Commands

### Clear Backend Cache
```bash
cd backend
rm -rf dist node_modules
npm install
```

### Clear Mobile Cache
```bash
cd mobile
npx expo start -c
```

### Rebuild Mobile Node Modules
```bash
cd mobile
rm -rf node_modules
npm install
```

### Get Your Computer's IP (for mobile .env)
```bash
# Mac/Linux
ifconfig | grep inet

# Windows
ipconfig
```

### Check if Port is in Use
```bash
# Mac/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Kill Process on Port
```bash
# Mac/Linux
kill -9 $(lsof -t -i:3000)

# Windows
# Find PID from netstat, then:
taskkill /PID <PID> /F
```

## Git Commands (Version Control)

### Initial Commit
```bash
git init
git add .
git commit -m "Initial commit with auth system"
```

### Create Feature Branch
```bash
git checkout -b feature/session-management
```

### Commit Changes
```bash
git add .
git commit -m "Add session management endpoints"
```

### Push to GitHub
```bash
git remote add origin https://github.com/yourusername/skilli.git
git push -u origin main
```

## NestJS CLI Commands

### Generate Module
```bash
cd backend
nest generate module sessions
# or shorthand:
nest g module sessions
```

### Generate Controller
```bash
nest g controller sessions
```

### Generate Service
```bash
nest g service sessions
```

### Generate Complete Resource (Module + Controller + Service + DTO)
```bash
nest g resource sessions
```

## Expo Commands

### Start with Clear Cache
```bash
npx expo start -c
```

### Build for Production
```bash
# Android
npx expo build:android

# iOS (requires Mac)
npx expo build:ios
```

### Install Expo Package
```bash
npx expo install package-name
```

## NPM/Package Commands

### Install Package
```bash
npm install package-name
```

### Install Dev Package
```bash
npm install -D package-name
```

### Update All Packages
```bash
npm update
```

### Check Outdated Packages
```bash
npm outdated
```

### Audit Security
```bash
npm audit
npm audit fix
```

## Prisma Commands Reference

```bash
# Initialize Prisma
npx prisma init

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed

# Pull schema from existing database
npx prisma db pull

# Push schema without migration
npx prisma db push
```

## Common Development Workflows

### Adding a New Database Table

1. Edit `backend/prisma/schema.prisma`
2. Run migration:
   ```bash
   cd backend
   npx prisma migrate dev --name add_sessions_table
   npx prisma generate
   ```
3. Use new table in code with autocomplete!

### Adding a New API Endpoint

1. Generate resource (if new module):
   ```bash
   cd backend
   nest g resource sessions
   ```
2. Or add to existing controller/service
3. Backend auto-reloads on save
4. Test with curl or mobile app

### Adding a New Mobile Screen

1. Create file in `mobile/src/screens/`
2. Import in navigation file
3. Add to Stack or Tab navigator
4. Expo auto-reloads on save

### Debugging Backend

```bash
# View backend logs
cd backend
npm run start:dev
# Logs appear in terminal

# Add console.log in code
console.log('Debug:', variable);
```

### Debugging Mobile

```bash
# View logs in Expo
# Logs appear automatically in terminal

# Or open React Native Debugger
# In app, shake device (or Cmd+D / Ctrl+M)
# Select "Debug"
```

## Environment-Specific Commands

### Production Build (Backend)
```bash
cd backend
npm run build
npm run start:prod
```

### Production Build (Mobile)
```bash
cd mobile
# Configure app.json first
eas build --platform android
eas build --platform ios
```

## Quick Health Checks

```bash
# Is database running?
docker-compose ps

# Is backend running?
curl http://localhost:3000/api/health

# Can mobile reach backend?
# Update mobile/.env API_URL and restart Expo
```
