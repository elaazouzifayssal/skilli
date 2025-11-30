# Provider Profile API Documentation

This document describes the enhanced Provider Profile system with profile status and verification fields.

## Overview

The Provider Profile system now includes:
- **Profile Status Management**: DRAFT → PENDING_REVIEW → APPROVED → SUSPENDED
- **Verification Fields**: Phone and email verification (read-only for users)
- **Scalable Data Model**: Many-to-many relationships for categories and skills
- **Backward Compatibility**: Legacy fields preserved for existing mobile app

## Data Model

### Enums

```typescript
enum TeachingFormat {
  ONLINE
  IN_PERSON
  BOTH
}

enum ExperienceLevel {
  STUDENT
  ENGINEERING_STUDENT
  JUNIOR_ENGINEER
  TEACHER
  FREELANCER
  EXPERT
}

enum HourlyRateType {
  BASIC       // 50-100 MAD
  STANDARD    // 100-200 MAD
  PREMIUM     // 200-500 MAD
  CUSTOM      // User-defined range
}

enum ProfileStatus {
  DRAFT            // Incomplete profile
  PENDING_REVIEW   // Complete, awaiting approval
  APPROVED         // Active and visible to clients
  SUSPENDED        // Temporarily disabled by admin
}
```

### ProviderProfile Model

Key fields:
- `profileStatus`: Automatically computed based on profile completeness
- `isPhoneVerified`: Read-only, set by admin/system
- `isEmailVerified`: Read-only, set by admin/system
- `teachingFormatNew`: New enum field (use instead of legacy `teachingFormat` string)
- `experienceLevelNew`: New enum field (use instead of legacy `experienceLevel` string)
- `cities`: Array of cities for in-person teaching
- `hourlyRateType`, `hourlyRateMin`, `hourlyRateMax`: New pricing structure

## API Endpoints

### User Endpoints

#### GET /api/provider-profiles/me
Get current user's provider profile (returns null if not created yet).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "bio": "Experienced developer teaching React and Node.js",
  "profileStatus": "APPROVED",
  "isPhoneVerified": true,
  "isEmailVerified": true,
  "teachingFormatNew": "BOTH",
  "cities": ["Casablanca", "Rabat"],
  "experienceLevelNew": "JUNIOR_ENGINEER",
  "hourlyRateType": "STANDARD",
  "hourlyRateMin": 100,
  "hourlyRateMax": 200,
  "skills": ["React", "Node.js", "TypeScript"],
  "categories": ["Programming", "Web Development"],
  "isComplete": true,
  "rating": 4.8,
  "totalRatings": 24,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-20T14:30:00Z",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+212600000000"
  }
}
```

#### POST /api/provider-profiles/me
Create or update current user's provider profile.

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bio": "Experienced developer with 5 years in web development",
  "teachingFormatNew": "BOTH",
  "cities": ["Casablanca", "Rabat"],
  "experienceLevelNew": "JUNIOR_ENGINEER",
  "hourlyRateType": "STANDARD",
  "skills": ["React", "Node.js", "TypeScript"],
  "categories": ["Programming", "Web Development"],
  "onboardingCompleted": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "profileStatus": "PENDING_REVIEW",  // Auto-computed
  "isPhoneVerified": false,            // Default false
  "isEmailVerified": false,            // Default false
  "...": "other fields"
}
```

#### PATCH /api/provider-profiles/me
Update current user's provider profile (partial update).

**Request Body (any subset of fields):**
```json
{
  "bio": "Updated bio text",
  "cities": ["Casablanca", "Marrakech"]
}
```

#### DELETE /api/provider-profiles/me
Delete current user's provider profile and remove provider status.

### Public Endpoints

#### GET /api/provider-profiles
Get all approved provider profiles (with optional filters).

**Query Parameters:**
- `city`: Filter by city (e.g., `?city=Casablanca`)
- `skills`: Comma-separated skills (e.g., `?skills=React,Node.js`)
- `level`: Education level filter
- `search`: Search in bio and name
- `status`: Filter by profile status (default: `APPROVED`)

**Example:**
```bash
curl "http://localhost:3000/api/provider-profiles?city=Casablanca&skills=React,TypeScript&status=APPROVED"
```

#### GET /api/provider-profiles/:userId
Get specific provider profile by user ID.

**Example:**
```bash
curl http://localhost:3000/api/provider-profiles/123e4567-e89b-12d3-a456-426614174000
```

### Admin Endpoints

#### PATCH /api/provider-profiles/:userId/verification
Update verification status (admin only).

**Headers:**
```
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isPhoneVerified": true,
  "isEmailVerified": true
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/provider-profiles/uuid/verification \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"isPhoneVerified": true}'
```

#### PATCH /api/provider-profiles/:userId/status
Update profile status (admin only).

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/provider-profiles/uuid/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

## Profile Completion Logic

A profile is considered "complete" when it has:
1. ✅ At least one category
2. ✅ At least one skill
3. ✅ Teaching format specified
4. ✅ At least one city (if format is IN_PERSON or BOTH)
5. ✅ Pricing information (hourlyRateType or legacy pricingTier)
6. ✅ Bio with minimum 50 characters

### Profile Status Flow

```
DRAFT
  ↓ (when profile is complete)
PENDING_REVIEW
  ↓ (admin approval)
APPROVED
  ↓ (admin action)
SUSPENDED
```

**Rules:**
- Incomplete profiles → `DRAFT`
- Complete profiles → `PENDING_REVIEW`
- Admin can set `APPROVED` or `SUSPENDED`
- Once `APPROVED` or `SUSPENDED`, status is preserved unless changed by admin

## Example Usage

### 1. Create a Provider Profile

```bash
curl -X POST http://localhost:3000/api/provider-profiles/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Passionate educator with 10 years of experience teaching mathematics and physics to high school students.",
    "teachingFormatNew": "BOTH",
    "cities": ["Casablanca", "Rabat"],
    "experienceLevelNew": "TEACHER",
    "hourlyRateType": "PREMIUM",
    "hourlyRateMin": 200,
    "hourlyRateMax": 400,
    "skills": ["Mathematics", "Physics", "Chemistry"],
    "categories": ["Education", "Sciences"],
    "onboardingCompleted": true
  }'
```

### 2. Get My Profile

```bash
curl http://localhost:3000/api/provider-profiles/me \
  -H "Authorization: Bearer <token>"
```

### 3. Update Profile

```bash
curl -X PATCH http://localhost:3000/api/provider-profiles/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio with more details about my teaching experience",
    "cities": ["Casablanca", "Marrakech", "Rabat"]
  }'
```

### 4. Browse Providers (Public)

```bash
# All approved providers
curl http://localhost:3000/api/provider-profiles

# Filter by city and skills
curl "http://localhost:3000/api/provider-profiles?city=Casablanca&skills=React,Node.js"

# Search
curl "http://localhost:3000/api/provider-profiles?search=mathematics"
```

## Backward Compatibility

The system maintains backward compatibility with the existing mobile app:

- **Legacy string fields** are preserved:
  - `teachingFormat` (string: "online", "presential", "both")
  - `experienceLevel` (string: "student", "junior_engineer", etc.)
  - `pricingTier` (string: "basic", "standard", "premium", "custom")
  - `city` (single string)

- **New enum fields** are added alongside:
  - `teachingFormatNew` (enum: TeachingFormat)
  - `experienceLevelNew` (enum: ExperienceLevel)
  - `hourlyRateType` (enum: HourlyRateType)
  - `cities` (array of strings)

**TODO**: Migrate mobile app to use new enum fields, then deprecate legacy fields.

## Security Notes

1. **Verification Fields**: `isPhoneVerified` and `isEmailVerified` are NOT settable via user endpoints
2. **Profile Status**: Computed automatically; only admins can override to APPROVED/SUSPENDED
3. **Admin Endpoints**: Require admin authorization (TODO: implement AdminGuard)
4. **Future KYC**: Add hooks in verification endpoints for SMS/email verification flows

## Database Indexes

The following indexes are created for performance:
- `profileStatus` - Filter approved providers
- `experienceLevel` - Filter by experience
- `teachingFormat` - Filter by format
- `rating` - Sort by rating

## Next Steps

1. **Implement AdminGuard** for admin-only endpoints
2. **Add SMS verification** flow for phone verification
3. **Add email verification** flow
4. **Implement KYC document upload** for enhanced verification
5. **Create migration script** to convert existing data to new enum fields
6. **Update mobile app** to use new `/me` endpoints and enum fields
