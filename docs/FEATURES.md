# Skilli - Complete Features Documentation

## Overview
Skilli is a Moroccan marketplace platform connecting clients with providers for learning and professional services. This document covers all implemented features.

---

## 1. Authentication System

### Features
- **User Registration**: Email, name, phone, password
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Auto-login**: Persistent sessions via AsyncStorage
- **Secure Logout**: Cleans tokens from client and server
- **Token Refresh**: Automatic when access token expires

### User Flows

#### Registration
1. Landing Screen → Tap "S'inscrire"
2. Fill: Name, Email, Phone, Password
3. Submit → Auto-login → Redirect to Home

#### Login
1. Landing Screen → Tap "Se connecter"
2. Enter: Email, Password
3. Submit → Redirect to Home
4. Tokens saved → Auto-login on app restart

#### Logout
1. Profile → Tap "Se déconnecter"
2. Tokens cleared → Redirect to Landing

### API Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/profile
```

### Security
- Passwords hashed with bcrypt (10 rounds)
- Refresh tokens stored in database with expiry
- JWT validation on all protected routes
- CORS enabled for mobile app

---

## 2. Provider Profiles

### Features
- **4-Step Onboarding Wizard**
- **100+ Categorized Skills** (12 categories)
- **20 Moroccan Cities**
- **Education Levels**: Bac, Licence, Master, Doctorat, Formation Pro
- **Languages**: Multi-select (Arabe, Français, Anglais, etc.)
- **Rating System**: Auto-calculated from session reviews
- **Dual Role**: Users can be both client AND provider

### Onboarding Steps

#### Step 1: Bio
- Minimum 10 characters
- Describe your expertise
- Validation: Checks trimmed length

#### Step 2: Location & Education
- Select city (horizontal scroll)
- Select education level (horizontal scroll)
- Both required

#### Step 3: Languages
- Multi-select chips
- At least one required
- Options: Arabe, Français, Anglais, Espagnol, Allemand, Amazigh

#### Step 4: Skills
- Browse 100+ skills in 12 categories:
  - Matières Scolaires (Mathématiques, Physique, etc.)
  - Programmation (React, Python, Java, etc.)
  - Design (Photoshop, Figma, UI/UX, etc.)
  - Business & Management
  - Langues
  - Marketing & Communication
  - Santé & Bien-être
  - Art & Musique
  - Sports & Fitness
  - Cuisine & Pâtisserie
  - Vie Pratique
  - Préparation aux Concours (TCF, IELTS, ENSAM, etc.)
- Multi-select
- At least one required

#### Step 5: Additional Info
- Hourly rate (MAD)
- Years of experience
- Certifications (optional)
- Availability (optional)

### Profile Display
- Shows on session details
- Includes rating (⭐ X.X) and total reviews
- Avatar with initials
- City display

### API Endpoints
```
POST /api/provider-profiles              # Create profile
GET  /api/provider-profiles              # List all (with filters)
GET  /api/provider-profiles/:id          # Get by ID
PUT  /api/provider-profiles/:id          # Update
```

### Filters
- `city`: Filter by Moroccan city
- `skills`: Comma-separated skill names
- `level`: Education level

---

## 3. Sessions System

### For Providers

#### Create Session
**Location**: Profile → "Créer une session"

**Form Fields**:
- **Title**: Session name (e.g., "Maîtriser React en 2 heures")
- **Description**: Detailed explanation
- **Skills**: Multi-select chips from first 20 skills
- **Date & Time**: DateTimePicker (iOS/Android compatible)
- **Duration**: Minutes (default: 60)
- **Type**: Toggle between:
  - En ligne (Online)
  - Présentiel (In-person) - shows location field
- **Location**: Required for presential sessions
- **Price**: In MAD (Moroccan Dirham)
- **Max Participants**: Default: 1

**Validation**:
- All fields required except location (online sessions)
- Location required for presential sessions
- Date must be in future (backend)

#### View My Sessions
**Location**: Profile → "Mes sessions" → "Mes sessions" tab

**Display**:
- Session title
- Online/Presential badge
- Stats row:
  - Réservations: Booking count
  - Intéressés: Interest count (placeholder)
  - Likes: Like count (placeholder)
- Date and price
- Tap to view details

#### Session Management
- **Update**: Edit session details (if no bookings)
- **Delete**: Remove session (blocked if has bookings)
- Sessions can't be modified once booked

### For Clients

#### Browse Sessions
**Location**: Sessions tab (bottom navigation)

**Features**:
- **Search Bar**: Real-time search in:
  - Session title
  - Description
  - Skills
- **Filter Buttons**:
  - Tout (All)
  - En ligne (Online only)
  - Présentiel (In-person only)
- **Session Count**: Updates dynamically
- **Pull-to-Refresh**: Reload sessions
- **Empty State**: Message when no sessions match

**Session Card Display**:
- Title
- Description (truncated to 2 lines)
- Type badge (Online/Presential)
- Skills chips (first 3 + count)
- Date and time
- Price in MAD (green, bold)
- Capacity: X/Y places
- Location (for presential)

#### Session Details
**Location**: Tap any session card

**Display**:
- Full title and type badge
- Complete description
- All skills (chip grid)
- Details section:
  - 📅 Date (full format with weekday)
  - ⏱️ Duration (minutes)
  - 📍 Location (if presential)
  - 👥 Capacity (X/Y places)
- Provider card:
  - Avatar (initials)
  - Name
  - Rating (if > 0)
- Price footer with "Réserver" button

**Button Logic**:
- Hidden if:
  - You own the session
  - Session has passed
- Disabled if:
  - Session is full
  - Booking in progress
- Shows "Complet" if full

#### Book Session
1. Tap "Réserver" on session detail
2. Confirm in dialog: "Voulez-vous réserver cette session pour X MAD?"
3. Booking created (auto-confirmed in MVP)
4. Success alert → Navigate back
5. View booking in "Mes sessions"

**Validations** (Backend):
- Can't book own session
- Can't book same session twice
- Can't book full session
- Can't book past session
- Session must exist

### API Endpoints
```
POST   /api/sessions                    # Create session
GET    /api/sessions                    # List all (with filters)
GET    /api/sessions/:id                # Get by ID
GET    /api/sessions/my-sessions        # Provider's sessions
PUT    /api/sessions/:id                # Update
DELETE /api/sessions/:id                # Delete
```

### Filters
- `skills`: Comma-separated
- `city`: Filter by location
- `isOnline`: true/false
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

---

## 4. Bookings System

### For Clients

#### My Bookings
**Location**: Profile → "Mes sessions" → "Mes réservations" tab

**Display**:
- Session title
- Provider info:
  - Avatar (initial)
  - Name
  - City
- Status badge:
  - 🟦 Confirmé (blue)
  - 🟩 Terminé (green)
  - 🟥 Annulé (red)
  - 🟨 En attente (yellow)
- Date and amount paid
- Action buttons (conditional)

**Actions**:
- **Cancel** (red outlined button):
  - Only for confirmed bookings
  - Only before session starts
  - Confirmation dialog
  - Updates status to "cancelled"

- **Rate** (yellow background button):
  - Only for completed bookings
  - Only if not already rated
  - Opens rating screen

#### Cancel Booking
1. Find booking in "Mes réservations"
2. Tap "Annuler"
3. Confirm: "Êtes-vous sûr de vouloir annuler cette réservation?"
4. Status updates to "Annulé"
5. Refresh list

**Validations**:
- Must be booking owner
- Session must not have started
- Only confirmed bookings can be cancelled

#### Rate Session
**Location**: Tap "⭐ Noter la session" on completed booking

**Form**:
- **Star Rating**: 1-5 stars (tap to select)
- **Review Text**: Optional textarea
- Submit button

**Process**:
1. Select stars (1-5, required)
2. Write review (optional)
3. Tap "Envoyer"
4. Updates booking with rating/review
5. Updates provider's overall rating:
   - Formula: `(oldRating * oldCount + newRating) / (oldCount + 1)`
   - Increments totalRatings count
6. Success → Navigate back

**Validations**:
- Must be booking owner
- Must be completed session
- Must not already be rated
- Rating 1-5 required

### For Providers

#### Provider Bookings
**Location**: Profile → "Mes sessions" → "Mes sessions" tab (shows session stats)

Or via API endpoint to see detailed bookings:

**Display** (when implemented in UI):
- Client info:
  - Name
  - Email
  - Phone
- Session details
- Booking status
- Payment status
- Amount

**Current Implementation**:
- Stats shown on session cards (booking count)
- Full booking details available via API

### API Endpoints
```
POST /api/bookings                      # Create booking
GET  /api/bookings/my-bookings          # Client's bookings
GET  /api/bookings/provider-bookings    # Provider's bookings
PUT  /api/bookings/:id/cancel           # Cancel booking
PUT  /api/bookings/:id/rate             # Rate session
```

---

## 5. Home Screen

### Features
- **Personalized Greeting**: "Bonjour, [FirstName] 👋"
- **Subtitle**: "Découvrez de nouvelles compétences"
- **Quick Actions Grid**
- **Featured Sessions**
- **Provider Stats** (for providers)
- **Pull-to-Refresh**

### Quick Actions
Four action cards:

1. **🔍 Explorer Sessions**
   - Always visible
   - Navigates to Sessions tab

2. **➕ Créer Session** (Providers only)
   - Only if `user.isProvider === true`
   - Navigates to CreateSessionScreen

3. **⭐ Devenir Provider** (Non-providers only)
   - Only if `user.isProvider === false`
   - Navigates to BecomeProviderScreen

4. **📅 Mes Sessions**
   - Always visible
   - Navigates to MySessionsScreen

### Featured Sessions
- **Section**: "Prochaines sessions" with "Tout voir" link
- **Logic**: Shows 5 upcoming sessions:
  - Filters: `date > now`
  - Sorts: By date ascending
  - Limits: First 5
- **Display**: Session cards same as Sessions tab
- **Tap**: Navigate to session details
- **Empty State**:
  - 📚 Icon
  - "Aucune session disponible"
  - "Créer une session" button (providers only)

### Provider Stats Card
**Visible**: Only if `user.isProvider === true`

**Display**:
- Three columns:
  - **Sessions**: Total created
  - **Réservations**: Total bookings
  - **Revenus**: Total revenue (MAD)
- Currently shows "-" (placeholders)
- Will be populated with real data from API

### Pull-to-Refresh
- Swipe down to refresh
- Reloads featured sessions
- Shows loading spinner

---

## 6. Profile Screen

### User Info Section
- **Avatar**: Circle with first initial (purple background)
- **Name**: Full name
- **Email**: User email
- **Phone**: If provided
- **Badges**: Role indicators
  - "Client" badge (purple)
  - "Provider" badge (purple) - if applicable

### Menu Items

#### Always Visible
1. **Modifier le profil** (Placeholder)
   - No navigation yet
   - Future: Edit user info

2. **Mes sessions**
   - Navigates to MySessionsScreen
   - Shows bookings and provider sessions

3. **Mes demandes** (Placeholder)
   - No navigation yet
   - Future: Requests & Offers

#### Conditional
4. **Devenir provider** (Non-providers only)
   - Only if `!user.isProvider`
   - Navigates to BecomeProviderScreen

5. **Créer une session** (Providers only)
   - Only if `user.isProvider`
   - Navigates to CreateSessionScreen

### Logout Button
- Red outlined button
- "Se déconnecter"
- Calls `logout()` from authStore
- Clears tokens
- Redirects to Landing

---

## 7. Navigation Structure

### Auth Flow (Not Logged In)
```
Stack Navigator:
├── Landing Screen
├── Login Screen
└── Register Screen
```

### Main App (Logged In)
```
Tab Navigator (Bottom):
├── Home Tab → HomeScreen
├── Sessions Tab → SessionsListScreen
└── Profile Tab → ProfileScreen

Stack Navigator (Overlays):
├── BecomeProviderScreen
├── CreateSessionScreen
├── SessionDetailScreen
├── MySessionsScreen
└── RateSessionScreen
```

### Navigation Helpers
- `navigation.navigate('ScreenName')`
- `navigation.goBack()`
- Automatic navigation after actions (register, logout, etc.)

---

## 8. State Management

### AuthStore (Zustand)
**Location**: `mobile/src/store/authStore.ts`

**State**:
```typescript
{
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Actions**:
- `login(email, password)`: Authenticate user
- `register(data)`: Create account
- `logout()`: Clear session
- `loadTokens()`: Auto-load from AsyncStorage on app start
- `setUser(user)`: Update user data

**Persistence**:
- Tokens saved to AsyncStorage on login/register
- Auto-loaded on app start
- Cleared on logout

### Token Refresh
- Axios interceptor watches for 401 errors
- Automatically calls `/api/auth/refresh`
- Updates access token
- Retries original request
- If refresh fails → Logout

---

## 9. Constants & Data

### Skills (100+)
**Location**: `mobile/src/constants/skills.ts`

**Categories**:
1. Matières Scolaires (17 skills)
2. Programmation (20 skills)
3. Design (10 skills)
4. Business & Management (8 skills)
5. Langues (10 skills)
6. Marketing & Communication (8 skills)
7. Santé & Bien-être (8 skills)
8. Art & Musique (10 skills)
9. Sports & Fitness (8 skills)
10. Cuisine & Pâtisserie (8 skills)
11. Vie Pratique (6 skills)
12. Préparation aux Concours (5 skills)

**Exports**:
- `SKILLS_CATEGORIES`: Object with categories
- `ALL_SKILLS`: Flat array of all skills

### Moroccan Cities (20)
**Location**: `mobile/src/constants/moroccanCities.ts`

**Cities**:
Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kenitra, Tétouan, Safi, Temara, Mohammedia, Khouribga, Beni Mellal, El Jadida, Nador, Taza, Settat, Ksar El Kébir

---

## 10. Error Handling

### Network Errors
- Axios catches all API errors
- Shows Alert with error message
- Falls back to generic message

### Validation Errors
- Frontend: Immediate feedback (e.g., bio length)
- Backend: DTO validation with class-validator
- Returns 400 with error details

### Authentication Errors
- 401: Token expired → Auto-refresh or logout
- 403: Forbidden → Alert user
- 404: Not found → Navigate back with alert

### Booking Errors
Common validations:
- "You cannot book your own session"
- "Session is fully booked"
- "Cannot book a session that has already passed"
- "You have already booked this session"

---

## 11. Provider Discovery

### Features
- **Browse Providers**: List all providers with pagination
- **Search**: Real-time search by name or skills
- **Filter by City**: Horizontal scroll through all Moroccan cities
- **Provider Cards**: Rich preview with key info
- **Provider Details**: Complete profile view
- **Provider Sessions**: See all sessions from a provider

### Browse Providers
**Location**: Providers tab (bottom navigation)

**Display**:
- Search bar at top
- City filter (horizontal scroll chips)
- Provider cards showing:
  - Avatar with initial
  - Name, city
  - Rating with review count
  - Bio preview (2 lines)
  - Skills (first 4 + count)
  - Education level
  - Hourly rate (if set)
  - Years of experience (if set)

**Search**:
- Searches in: provider name, bio, skills
- Real-time filtering as you type
- Shows result count

**City Filter**:
- "Toutes" chip to show all
- Scroll through 20 Moroccan cities
- Active city highlighted in purple
- Updates list instantly

### Provider Detail Screen
**Location**: Tap any provider card

**Sections**:
1. **Header**:
   - Large avatar (80px)
   - Full name
   - City
   - Rating (if > 0)

2. **À propos**:
   - Complete bio text

3. **Compétences**:
   - All skills in grid layout
   - Purple chip design

4. **Informations**:
   - Education level
   - Years of experience
   - Hourly rate (MAD/h)

5. **Langues**:
   - All languages in chips
   - Purple background

6. **Certifications** (if set):
   - Full text

7. **Disponibilité** (if set):
   - Availability info

8. **Sessions**:
   - All sessions from this provider
   - Session count in title
   - Tap to view session details
   - Empty state if no sessions

**Navigation**:
- Tap session → Navigate to SessionDetail
- Back button → Return to providers list

### API Endpoints
```
GET /api/provider-profiles              # List all
GET /api/provider-profiles/:userId      # Get by user ID
```

### Filters (API)
- `city`: Filter by Moroccan city
- `skills`: Comma-separated skill names
- `level`: Education level

---

## 12. Future Features

### Planned (Not Yet Implemented)

#### Requests & Offers
- Clients post requests (needs)
- Providers respond with offers
- Matching algorithm
- Negotiation system

#### Feed & Posts
- Social feed for knowledge sharing
- Create posts with text/images
- Like, comment, share
- Follow providers

#### Messaging
- Real-time chat
- Client-provider conversations
- Booking-related messages
- Notifications

#### Notifications
- Booking confirmations
- Session reminders (1 hour before)
- New messages
- Booking cancellations
- Reviews received

#### Advanced Features
- Photo upload (profile, sessions)
- Payment integration (Stripe/PayPal)
- Calendar view for sessions
- Analytics dashboard for providers
- Reviews & testimonials display
- Video session integration (Zoom/Meet)
- Certificates after completed sessions
- Provider verification badges

---

## 12. Design System

### Colors
- Primary: `#6366f1` (Indigo)
- Success: `#10b981` (Green)
- Error: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)
- Gray scale: `#f9fafb` → `#1f2937`

### Typography
- Headers: 24-28px, bold
- Titles: 16-18px, semi-bold
- Body: 14-16px, regular
- Small: 11-13px, regular

### Components
- **Buttons**: Rounded (12px), padding 16px
- **Cards**: Rounded (16px), shadow, white background
- **Inputs**: Rounded (12px), border, padding 16px
- **Chips**: Rounded (8px), small padding
- **Badges**: Rounded (8-12px), colored backgrounds

### Spacing
- Section: 16-20px horizontal padding
- Cards: 12px gap
- Form fields: 16px vertical gap
- Small gaps: 6-8px

---

## 13. Navigation Updates

### Tab Navigation (Bottom)
- **Home**: Dashboard with quick actions and featured sessions
- **Providers**: Browse and search providers (was "Sessions")
- **Profile**: User settings and account management

### Stack Screens (Overlays)
- **SessionsList**: Browse all sessions (accessible via Home quick action)
- **SessionDetail**: View session details and book
- **ProviderDetail**: View provider profile and sessions
- **CreateSession**: Create new session (providers only)
- **BecomeProvider**: Provider onboarding wizard
- **MySessions**: View bookings and provider sessions
- **RateSession**: Rate completed sessions

The app now has dual discovery paths:
1. **Provider-first**: Browse providers → View their sessions
2. **Session-first**: Browse sessions directly → See provider

---

## 14. Notifications System

### Features
- **Real-time Notifications**: Database-backed notification system
- **Unread Badge**: Shows unread count on Home screen bell icon
- **Notification Types**: booking, reminder, rating, update, message
- **Mark as Read**: Individual or bulk "mark all as read"
- **Delete Notifications**: Swipe-friendly delete button
- **Visual Indicators**: Color-coded by type with emoji icons
- **Relative Timestamps**: "Il y a 30 min", "Il y a 2h", etc.
- **Navigation**: Tap notification to navigate to related session/booking
- **Pull to Refresh**: Refresh notifications list

### Notification Types & Colors
- **Booking** (📅): Green `#10b981` - New session bookings for providers
- **Reminder** (⏰): Amber `#f59e0b` - Upcoming session reminders
- **Rating** (⭐): Purple `#8b5cf6` - New ratings received
- **Update** (🎉): Blue `#3b82f6` - Platform updates and announcements
- **Message** (📢): Gray `#6b7280` - Future messaging feature

### User Flows

#### View Notifications
1. Home Screen → Tap bell icon (🔔)
2. See all notifications sorted by newest first
3. Unread notifications have:
   - Left border accent (indigo)
   - Blue dot next to title
   - Count shown in header

#### Mark as Read
- **Individual**: Tap notification → Auto-marks as read + navigates
- **Bulk**: Tap "Tout marquer comme lu" button in header
- Unread count updates instantly

#### Delete Notification
1. Tap ✕ button on notification card
2. Removed from list immediately
3. Action is permanent (no undo)

### API Endpoints
```
GET    /api/notifications              # Get all user notifications
GET    /api/notifications/unread-count # Get unread count
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/mark-all-read # Mark all as read
DELETE /api/notifications/:id          # Delete notification
```

### Database Schema
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // booking, reminder, rating, update, message
  title     String
  message   String
  read      Boolean  @default(false)
  sessionId String?  // Optional link to session
  bookingId String?  // Optional link to booking
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Service Methods
The `NotificationsService` provides helper methods for creating notifications:
- `notifyProviderOfBooking()` - When someone books provider's session
- `notifyClientOfUpcomingSession()` - 1 hour before session starts
- `notifyProviderOfRating()` - When client rates a session
- `createNotification()` - Generic notification creator

### Integration Points
Notifications are automatically created when:
- ✅ **Bookings**: Provider receives notification when session is booked
- ⏳ **Reminders**: Scheduled task sends reminder 1 hour before session (future)
- ⏳ **Ratings**: Provider receives notification when rated (future integration)
- ✅ **Updates**: Manual admin notifications for announcements

### UI/UX Details
- **Empty State**: Bell icon with "Aucune notification" message
- **Unread Count**: Red badge shows number (hidden when 0)
- **Card Layout**: Icon + Content + Delete button
- **Timestamp Format**:
  - < 60 min: "Il y a X min"
  - < 24h: "Il y a Xh"
  - < 7 days: "Il y a Xj"
  - > 7 days: "12 nov" (French short date)

---

## 15. In-App Messaging System

### Features
- **One-to-One Conversations**: Direct messaging between users
- **Real-Time Updates**: Polling every 5 seconds for new messages
- **Read/Unread Status**: Track message read status
- **Unread Badges**: Visual indicators for unread messages
- **Last Message Preview**: See latest message in conversations list
- **Profile Integration**: Display user photos in conversations
- **Date Separators**: Group messages by date
- **Auto-Scroll**: Automatically scroll to latest messages
- **Message Notifications**: Get notified when receiving new messages

### User Flows

#### View Conversations
1. Tap "Messages" tab in bottom navigation
2. See list of all conversations sorted by most recent
3. Each conversation shows:
   - Other user's profile photo
   - Name
   - Last message preview
   - Timestamp (30m, 2h, 3j format)
   - Unread count badge (if any)

#### Start/Continue Conversation
1. From conversations list → Tap any conversation
2. Opens chat screen with full message history
3. Messages grouped by date with separators
4. Your messages appear on right (blue bubbles)
5. Their messages appear on left (white bubbles)

#### Send Message
1. Type message in text input at bottom
2. Tap send button (arrow icon)
3. Message appears immediately
4. Other user receives notification
5. Auto-scrolls to show sent message

#### Receive Messages
1. Polling checks for new messages every 5 seconds
2. New messages appear automatically
3. Auto-scrolls to show new messages
4. Messages marked as read when conversation is viewed

### API Endpoints
```
GET    /api/messages/conversations           # List all conversations
GET    /api/messages/conversations/:userId   # Get/create conversation with user
GET    /api/messages/:conversationId         # Get messages in conversation
POST   /api/messages                          # Send message
GET    /api/messages/unread/count            # Get unread count
```

### Database Schema
```prisma
model Conversation {
  id              String   @id @default(uuid())
  user1Id         String
  user2Id         String
  lastMessageText String?
  lastMessageAt   DateTime?
  messages        Message[]

  @@unique([user1Id, user2Id])
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  receiverId     String
  text           String
  read           Boolean  @default(false)
  createdAt      DateTime @default(now())
}
```

### UI Components

**ConversationsScreen**:
- List of conversations
- Profile photos with avatars
- Unread badges (red circle with count)
- Last message preview
- Relative timestamps
- Pull-to-refresh
- Empty state ("Aucune conversation")

**ChatScreen**:
- Message bubbles (WhatsApp-style)
- Date separators
- Sender avatars (for received messages)
- Message timestamps (HH:MM)
- Text input with send button
- Keyboard-aware scrolling
- Loading state while sending
- Auto-scroll to bottom
- Empty state ("Commencez la conversation")

### Technical Implementation
- **Polling Interval**: 5 seconds for message updates
- **Message Limit**: 1000 characters per message
- **User Ordering**: Conversations use consistent user ordering (smaller ID first)
- **Auto-Mark Read**: Messages marked as read when conversation is opened
- **Notification Integration**: Creates notification on message send
- **Photo Integration**: Uses getImageUrl helper for profile photos

### Future Enhancements
- WebSocket integration for true real-time messaging
- Typing indicators
- Online/offline status
- Message delivery receipts
- Image/file sharing
- Voice messages
- Group messaging
- Message search

---

## 16. Testing Guide

### Manual Testing Checklist

#### Authentication
- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout
- [ ] Close app and reopen (should stay logged in)
- [ ] Test invalid credentials

#### Provider Onboarding
- [ ] Complete 4-step wizard
- [ ] Validate all steps
- [ ] Check "Provider" badge appears
- [ ] Verify "Créer une session" button shows

#### Sessions
- [ ] Create session as provider
- [ ] View in Sessions tab
- [ ] Search for session
- [ ] Filter by type
- [ ] Book session with different account
- [ ] Verify can't book own session

#### Bookings
- [ ] View booking in "Mes réservations"
- [ ] Cancel booking
- [ ] Complete session (manually change DB status)
- [ ] Rate completed session
- [ ] Verify provider rating updates

#### Navigation
- [ ] Test all quick actions
- [ ] Navigate between tabs
- [ ] Back button on all screens
- [ ] Deep linking to session details

### API Testing
Use curl or Postman:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get sessions (with auth)
curl http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Summary

Skilli currently has a complete MVP with:
- ✅ Full authentication system with token refresh
- ✅ Provider profiles with onboarding
- ✅ Session creation and management (CRUD)
- ✅ Session browsing with advanced search/filters
- ✅ Booking system with validations
- ✅ Rating and review system
- ✅ Profile photo upload
- ✅ Provider dashboard with analytics
- ✅ Notifications system
- ✅ **In-app messaging system** (NEW)
- ✅ Dual-role support (client + provider)
- ✅ Beautiful, polished UI
- ✅ Persistent state
- ✅ Error handling

Next priorities:
1. Payment integration
2. Push notifications (Firebase/OneSignal)
3. Provider verification
4. Advanced analytics
5. Enhanced messaging (WebSocket, typing indicators)
