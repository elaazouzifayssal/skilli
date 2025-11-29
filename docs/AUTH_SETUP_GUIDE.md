# Authentication System Setup & Testing Guide

This guide walks you through setting up and testing the complete authentication system.

## Prerequisites

Before starting, make sure you have:
- Node.js 18+ installed
- PostgreSQL running (via Docker or locally)
- Backend dependencies installed (`cd backend && npm install`)
- Mobile dependencies installed (`cd mobile && npm install`)

## Step 1: Setup Backend

### 1.1 Start PostgreSQL

```bash
# From project root
docker-compose up postgres -d
```

This starts PostgreSQL on port 5432. You can verify it's running:
```bash
docker-compose ps
```

### 1.2 Configure Environment Variables

The `.env` file should already exist in `backend/`. Verify it has these values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skilli_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="*"
```

### 1.3 Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init_auth_schema
npx prisma generate
```

**What this does:**
- Creates the database tables (users, provider_profiles, refresh_tokens)
- Generates TypeScript types for Prisma Client

### 1.4 Start Backend Server

```bash
npm run start:dev
```

You should see:
```
🚀 Backend server is running on http://localhost:3000/api
```

### 1.5 Test Health Endpoint

Open your browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Skilli API is running",
  "timestamp": "2025-01-27T...",
  "environment": "development"
}
```

## Step 2: Setup Mobile App

### 2.1 Install AsyncStorage

```bash
cd mobile
npx expo install @react-native-async-storage/async-storage
```

### 2.2 Configure Environment Variables

The `.env` file should exist in `mobile/`. Update the `API_URL`:

**For iOS Simulator:**
```env
API_URL=http://localhost:3000
```

**For Android Emulator:**
```env
API_URL=http://10.0.2.2:3000
```

**For Physical Device:**
Find your computer's IP address:
- Mac/Linux: `ifconfig | grep inet`
- Windows: `ipconfig`

Then use:
```env
API_URL=http://192.168.1.XXX:3000
```

### 2.3 Start Expo

```bash
npx expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## Step 3: Test Complete Auth Flow

### Test 1: Register New User

1. In the mobile app, you'll see the **Landing Screen**
2. Tap **"S'inscrire"** (Register)
3. Fill in:
   - Nom: `Test User`
   - Email: `test@example.com`
   - Mot de passe: `password123`
   - Téléphone: `0612345678` (optional)
4. Tap **"Créer un compte"**

**Expected Result:**
- Loading spinner appears
- App automatically logs you in
- You're redirected to the Home screen with bottom tabs

**What happens behind the scenes:**
1. Mobile app sends POST request to `/api/auth/register`
2. Backend validates data (email format, password length, etc.)
3. Backend hashes password with bcrypt
4. Backend creates user in database
5. Backend generates JWT access token (15min expiry) and refresh token (7 days)
6. Backend stores refresh token in database
7. Mobile app receives tokens and user data
8. Mobile app saves tokens to AsyncStorage (device storage)
9. Mobile app updates auth state → triggers navigation to main app

### Test 2: View Profile

1. Tap the **"Profil"** tab
2. You should see:
   - Your name in a purple circle avatar
   - Your email and phone
   - A "Client" badge
   - Menu items
   - Red "Se déconnecter" button

### Test 3: Logout

1. On Profile screen, tap **"Se déconnecter"**
2. App should return to Landing screen

**What happens:**
- Refresh token is deleted from database
- Tokens are removed from device storage
- Auth state is cleared
- Navigation changes to auth flow

### Test 4: Login with Existing Account

1. On Landing screen, tap **"Se connecter"**
2. Enter:
   - Email: `test@example.com`
   - Mot de passe: `password123`
3. Tap **"Se connecter"**

**Expected Result:**
- You're logged in and see Home screen
- Profile shows same data as before

### Test 5: Persistent Login (Token Refresh)

1. While logged in, close the Expo app completely
2. Reopen the app
3. You should see a brief loading spinner, then go directly to Home screen (still logged in)

**What happens:**
- App loads tokens from AsyncStorage
- App tries to get user profile with access token
- If access token is still valid, you're logged in immediately
- If access token expired, app uses refresh token to get new access token
- If refresh token is also expired, you're logged out

### Test 6: Backend API Endpoint Protection

Let's verify the `/api/auth/me` endpoint requires authentication:

**Without Token (should fail):**
```bash
curl http://localhost:3000/api/auth/me
```

Expected: `401 Unauthorized`

**With Token (should work):**

First, get a token by logging in:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Copy the `accessToken` from response, then:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected: Your user profile data

## Step 4: Test Error Handling

### Test Invalid Email

1. Try to register with email: `notanemail`
2. Expected: Error alert "Email must be valid"

### Test Short Password

1. Try to register with password: `123`
2. Expected: Error alert "Password must be at least 6 characters"

### Test Duplicate Email

1. Try to register with email you already used
2. Expected: Error alert about email already being registered

### Test Wrong Password

1. On login screen, enter correct email but wrong password
2. Expected: Error "Invalid credentials"

### Test Network Error

1. Stop the backend server (`Ctrl+C` in backend terminal)
2. Try to login
3. Expected: Error alert about connection failure
4. Restart backend: `npm run start:dev`

## Step 5: Database Verification

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

This opens a web UI at http://localhost:5555 where you can:
- View all users in the `users` table
- See refresh tokens in `refresh_tokens` table
- Notice that passwords are hashed (not plain text)

### Using pgAdmin (if running via Docker)

1. Open http://localhost:5050
2. Login with:
   - Email: `admin@skilli.com`
   - Password: `admin`
3. Add server:
   - Host: `postgres` (or `localhost`)
   - Port: `5432`
   - Database: `skilli_db`
   - Username: `postgres`
   - Password: `postgres`

## Common Issues & Solutions

### Issue: "Cannot connect to backend"

**Solution:**
- Check backend is running: `curl http://localhost:3000/api/health`
- Check API_URL in `mobile/.env` is correct for your device
- For Android emulator, use `10.0.2.2` not `localhost`
- For physical device, use your computer's IP address

### Issue: "Database connection error"

**Solution:**
- Check PostgreSQL is running: `docker-compose ps`
- Verify `DATABASE_URL` in `backend/.env`
- Try restarting: `docker-compose restart postgres`

### Issue: "Prisma Client not generated"

**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue: Mobile app shows blank white screen

**Solution:**
- Check Expo terminal for errors
- Clear cache: `npx expo start -c`
- Reinstall node_modules: `rm -rf node_modules && npm install`

### Issue: "Invalid token" errors

**Solution:**
- Tokens might have expired, logout and login again
- Clear AsyncStorage:
  ```typescript
  // In mobile app, you can add this temporarily to a button
  import AsyncStorage from '@react-native-async-storage/async-storage';
  await AsyncStorage.clear();
  ```

## Next Steps

Now that authentication works, we can build:

1. **Provider Profiles**
   - Create/edit provider profile
   - Add skills, bio, location
   - Upload profile photo

2. **Sessions**
   - Create sessions (providers)
   - Browse sessions (clients)
   - Book sessions
   - Session ratings

3. **Requests & Offers**
   - Create requests (clients)
   - Browse requests (providers)
   - Send offers
   - Accept offers

4. **Feed & Posts**
   - Providers create posts
   - Clients follow providers
   - Feed with posts from followed providers

5. **Messaging**
   - Real-time chat between clients and providers

6. **Notifications**
   - In-app notifications
   - Email notifications
   - (Later) Push notifications

## Architecture Overview

### JWT Token Flow

```
1. User logs in
   → Backend validates credentials
   → Backend generates access token (15min) + refresh token (7 days)
   → Backend stores refresh token in DB
   → Mobile app receives tokens

2. User makes API request
   → Mobile app sends: Authorization: Bearer <access_token>
   → Backend validates token
   → Backend attaches user to request
   → Controller accesses user via @Request() req

3. Access token expires
   → Mobile app detects 401 error
   → Mobile app uses refresh token to get new access token
   → New access token is stored and used

4. Refresh token expires
   → User must login again
```

### Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens for stateless authentication
- ✅ Refresh tokens stored in database (can be revoked)
- ✅ Access tokens expire quickly (15 minutes)
- ✅ Input validation with class-validator
- ✅ CORS protection
- ✅ SQL injection protection (Prisma uses parameterized queries)

### What's NOT Yet Implemented (for later)

- ❌ Rate limiting (prevent brute force attacks)
- ❌ Email verification
- ❌ Password reset flow
- ❌ Two-factor authentication
- ❌ OAuth (Google, Facebook login)
- ❌ Session device management (see all logged-in devices)
- ❌ Audit logs (who accessed what when)
