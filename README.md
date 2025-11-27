# Skilli - Moroccan Marketplace Platform

A marketplace connecting clients (students, learners) with providers (teachers, coaches, professionals) in Morocco.

## Project Structure

```
skilli/
├── backend/              # NestJS API (TypeScript)
├── mobile/              # React Native (Expo) app
├── docs/                # Documentation
├── docker-compose.yml   # Docker setup
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional, for containerized setup)
- Git

## Setup Instructions

### 1. Clone and Initial Setup

If you haven't already:

```bash
cd skilli
```

### 2. Backend Setup

#### Option A: Run Locally (without Docker)

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Then edit `backend/.env` and update values if needed (default values work for local development).

3. **Start PostgreSQL** (you need Postgres running locally, or use Docker for just the DB):
   ```bash
   # From project root
   docker-compose up postgres -d
   ```

4. **Run Prisma migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

   This creates the database tables based on your schema.

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start the development server:**
   ```bash
   npm run start:dev
   ```

7. **Test the API:**

   Open your browser or use curl:
   ```bash
   curl http://localhost:3000/api/health
   ```

   You should see:
   ```json
   {
     "status": "ok",
     "message": "Skilli API is running",
     "timestamp": "...",
     "environment": "development"
   }
   ```

#### Option B: Run with Docker

1. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Start all services:**
   ```bash
   # From project root
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - pgAdmin on port 5050 (http://localhost:5050)
   - Backend on port 3000 (when uncommented in docker-compose.yml)

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### 3. Mobile Setup

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Update `mobile/.env` with the correct API URL:
   - iOS simulator: `http://localhost:3000`
   - Android emulator: `http://10.0.2.2:3000`
   - Physical device: `http://YOUR_COMPUTER_IP:3000` (find your IP with `ipconfig` or `ifconfig`)

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run the app:**
   - Press `i` for iOS simulator (Mac only)
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Database Management

### Prisma Commands

```bash
cd backend

# Create a new migration after schema changes
npx prisma migrate dev --name description_of_change

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (visual database browser)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate
```

### pgAdmin (Database UI)

If using Docker, pgAdmin is available at http://localhost:5050

- Email: `admin@skilli.com`
- Password: `admin`

Add server:
- Host: `postgres` (or `localhost` if running locally)
- Port: `5432`
- Database: `skilli_db`
- Username: `postgres`
- Password: `postgres`

## Development Workflow

1. **Backend changes:**
   - Edit code in `backend/src/`
   - NestJS auto-reloads on save
   - Add/update DTOs in module folders
   - Update Prisma schema in `backend/prisma/schema.prisma`
   - Run `npx prisma migrate dev` after schema changes

2. **Mobile changes:**
   - Edit code in `mobile/src/`
   - Expo auto-reloads on save
   - New dependencies: stop and restart Expo

3. **Testing:**
   ```bash
   # Backend
   cd backend
   npm test

   # Mobile (not set up yet)
   cd mobile
   npm test
   ```

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skilli_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="*"
```

### Mobile (`mobile/.env`)

```env
API_URL="http://localhost:3000"
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker-compose ps`
- Check `.env` file exists and DATABASE_URL is correct
- Try: `npm install` again

### Mobile can't connect to backend
- Check backend is running: visit http://localhost:3000/api/health
- Check `API_URL` in `mobile/.env` matches your setup (localhost vs 10.0.2.2 vs IP)
- Check CORS is enabled in backend

### Database errors
- Reset database: `cd backend && npx prisma migrate reset`
- Check PostgreSQL logs: `docker-compose logs postgres`

## Next Steps

- [ ] Implement authentication (JWT)
- [ ] Create user and provider profiles
- [ ] Build session management
- [ ] Add booking system
- [ ] Implement requests & offers
- [ ] Build feed & posts
- [ ] Add messaging
- [ ] Implement notifications

## Tech Stack

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (database)
- Prisma (ORM)
- JWT (authentication)

**Mobile:**
- React Native (framework)
- Expo (development platform)
- React Navigation (routing)
- React Query (data fetching)

**DevOps:**
- Docker & Docker Compose
- GitHub (version control)
