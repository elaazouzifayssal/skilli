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

## Features Status

- [x] **Authentication (JWT)** ✅
  - User registration with email/password
  - Login with JWT access & refresh tokens
  - Protected routes with JWT guard
  - Persistent login (tokens stored in AsyncStorage)
  - Logout functionality
  - Profile screen with user info
- [x] **User & Provider Profiles** ✅
  - Create and edit provider profiles
  - Provider photo upload
  - Skills, education level, languages
  - Rating system integration
- [x] **Session Management** ✅
  - Create, edit, and delete sessions
  - Online and in-person sessions
  - Date/time scheduling with native pickers
  - Capacity management
  - Browse sessions with filters
- [x] **Booking System** ✅
  - Book sessions
  - Cancel bookings
  - View booking history
  - Booking status tracking
- [x] **Reviews & Ratings** ✅
  - Rate completed sessions (1-5 stars)
  - Write text reviews
  - Automatic rating calculation for providers
  - Review display on sessions and profiles
- [x] **Messaging** ✅
  - Real-time conversations
  - Message providers and clients
  - Conversation list
  - Unread message indicators
- [x] **Notifications** ✅
  - Booking confirmations
  - New messages
  - Offer updates
  - Session reminders
- [x] **Requests & Offers** ✅
  - Create service requests
  - Browse open requests
  - Submit offers as provider
  - Accept/reject offers
  - Budget range specification
  - Skill-based filtering
- [x] **Feed & Posts** ✅ NEW!
  - Providers can create posts to share expertise
  - Browse posts from all providers
  - Like/unlike posts
  - Skills tags and categories
  - Filter by skill, category, or provider
  - Rich post cards with author info and ratings
  - Post detail screen
- [ ] Payment integration (Coming soon)

## Testing Requests & Offers

### Setup

1. **Apply database migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start mobile app:**
   ```bash
   cd mobile
   npx expo start
   ```

### Testing Flow

**As a Client (Creating Requests):**

1. Log in to the app as a regular user
2. Navigate to "Demandes" tab (bottom navigation)
3. Tap "Nouvelle demande" button
4. Fill in the request form:
   - Title: "Besoin d'un prof de mathématiques"
   - Description: Describe what you're looking for
   - Select skills (e.g., Mathématiques, Physique)
   - Choose education level (optional)
   - Select request type (online/presential/both)
   - Set budget range (optional)
5. Tap "Publier ma demande"
6. View your request in "Profile" → "Mes demandes"

**As a Provider (Submitting Offers):**

1. Log in as a provider (or become a provider in settings)
2. Navigate to "Demandes" tab
3. Browse open requests
4. Tap on an interesting request
5. Tap "Envoyer une offre" button
6. Fill in the offer form:
   - Write a proposal message
   - Set your price
   - Estimate duration (hours)
   - Select first available date
7. Tap "Envoyer mon offre"
8. View your offers in "Profile" → "Mes offres"

**Accepting Offers:**

1. As the request owner, go to "Mes demandes"
2. Tap on a request that has received offers
3. Review all offers with provider info, price, duration
4. Tap "Accepter" on your preferred offer
5. Confirm acceptance
6. The request status changes to "Terminé"
7. All other pending offers are automatically rejected

### API Endpoints

**Requests:**
- `POST /api/requests` - Create new request
- `GET /api/requests` - Get all requests (with filters)
- `GET /api/requests/me` - Get my requests
- `GET /api/requests/:id` - Get single request
- `PATCH /api/requests/:id` - Update request
- `PATCH /api/requests/:id/cancel` - Cancel request
- `DELETE /api/requests/:id` - Delete request

**Offers:**
- `POST /api/offers` - Create new offer
- `GET /api/offers/request/:requestId` - Get all offers for a request
- `GET /api/offers/me` - Get my offers
- `GET /api/offers/:id` - Get single offer
- `PATCH /api/offers/:id` - Update offer
- `PATCH /api/offers/:id/accept` - Accept offer
- `PATCH /api/offers/:id/reject` - Reject offer
- `DELETE /api/offers/:id` - Delete offer

## Testing Feed & Posts

### Setup

1. **Apply database migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start mobile app:**
   ```bash
   cd mobile
   npx expo start
   ```

### Testing Flow

**As a Provider (Creating Posts):**

1. Log in as a provider (or become a provider in settings)
2. Navigate to "Feed" tab (bottom navigation)
3. Tap the "+" button in the header
4. Fill in the post form:
   - Content: Share your expertise, tips, or news
   - Select at least one skill tag
   - Optionally choose a category (Conseil, Tutoriel, Astuce, etc.)
5. Tap "Publier"
6. Your post appears at the top of the feed

**As Any User (Browsing Posts):**

1. Navigate to "Feed" tab
2. Scroll through posts from providers
3. See author info, rating, skills tags, and category
4. Tap a post to view full details
5. Like/unlike posts with the heart button
6. Tap on author avatar/name to view their profile

**Viewing Post Details:**

1. Tap any post card in the feed
2. View the full post content
3. See complete author information with rating
4. Like/unlike the post
5. If you're the author, delete the post using trash icon

**Managing Your Posts:**

1. As a provider, create multiple posts
2. View them in the feed
3. Tap on your post to see details
4. Delete your posts using the trash icon
5. Check like counts on your posts

### API Endpoints

**Posts:**
- `POST /api/posts` - Create new post (providers only)
- `GET /api/posts` - Get all posts (with filters: skill, category, authorId, page, limit)
- `GET /api/posts/me` - Get my posts
- `GET /api/posts/user/:userId` - Get posts by specific user
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/unlike` - Unlike a post
- `DELETE /api/posts/:id` - Delete post (author only)

### Features

**Business Rules:**
- Only providers can create posts (checked via `user.isProvider`)
- All users (clients and providers) can view and like posts
- Like/unlike operations are atomic (using transactions)
- Duplicate likes are prevented with unique constraint
- Authors can delete their own posts
- Posts show `isLiked` status per user

**Post Structure:**
- Content: Up to 5000 characters
- Skills: Array of skill tags (required)
- Category: Optional category (Conseil, Tutoriel, Astuce, Promotion, Actualité, Question)
- Like count: Automatically managed
- Comment count: Placeholder for future feature

**Feed Features:**
- Posts ordered by newest first
- Pull-to-refresh support
- Infinite scroll pagination (20 posts per page)
- Rich post cards with author photo, name, city, rating
- Expandable content with "Afficher plus"
- Empty state with call-to-action

## Testing Authentication

See detailed testing guide in [docs/AUTH_SETUP_GUIDE.md](docs/AUTH_SETUP_GUIDE.md)

Quick test:
```bash
# 1. Start backend
cd backend && npm run start:dev

# 2. In another terminal, start mobile
cd mobile && npx expo start

# 3. Register a new user in the app
# 4. Test login/logout flow
```

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
