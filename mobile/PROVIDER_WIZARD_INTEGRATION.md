# Provider Wizard Integration - Implementation Summary

This document describes the mobile app integration with the backend Provider Profile API.

## Overview

The provider onboarding wizard has been successfully connected to the backend `/api/provider-profiles/me` endpoints with:
- Centralized state management using Zustand
- Type-safe enums matching backend definitions
- React Query for API data fetching and mutations
- Support for both creating new profiles and editing existing ones
- Automatic profile loading when editing
- Proper enum conversions between legacy UI and new backend types

## Files Created

### 1. `/mobile/src/types/providerProfile.ts`
**Purpose**: TypeScript type definitions matching backend enums and DTOs

**Key Types**:
- `TeachingFormat` enum (ONLINE, IN_PERSON, BOTH)
- `ExperienceLevel` enum (STUDENT, ENGINEERING_STUDENT, etc.)
- `HourlyRateType` enum (BASIC, STANDARD, PREMIUM, CUSTOM)
- `ProfileStatus` enum (DRAFT, PENDING_REVIEW, APPROVED, SUSPENDED)
- `ProviderProfile` interface - Complete profile response
- `CreateProviderProfilePayload` interface - API request payload
- Wizard step state interfaces (WizardStep1State, WizardStep2State, etc.)

**Important**: These enums MUST stay in sync with backend definitions in:
`/backend/src/provider-profiles/dto/create-provider-profile.dto.ts`

### 2. `/mobile/src/store/providerOnboardingStore.ts`
**Purpose**: Centralized Zustand store for wizard state management

**Features**:
- Separate state for each of the 5 wizard steps
- `loadFromProfile()` - Loads existing profile for editing
- `buildPayloadForApi()` - Converts wizard state to API payload
- `isStepComplete()` - Validation logic for each step
- `reset()` - Clears wizard state
- Convenience hooks: `useWizardStep()`, `useWizardActions()`

**State Structure**:
```typescript
{
  step1: { teachingFormat, cities },           // Teaching format & location
  step2: { experienceLevel, categories, skills, studyYear },  // Categories, skills & experience
  step3: { hourlyRateType, hourlyRateMin, hourlyRateMax },   // Pricing
  step4: { availability },                      // Availability (optional)
  step5: { bio, photo }                        // Bio & photo
}
```

### 3. `/mobile/src/services/providerProfiles.ts`
**Purpose**: API client functions and React Query hooks

**API Functions**:
- `getMyProviderProfile()` - GET /api/provider-profiles/me
- `upsertMyProviderProfile(payload)` - POST /api/provider-profiles/me
- `updateMyProviderProfile(payload)` - PATCH /api/provider-profiles/me
- `deleteMyProviderProfile()` - DELETE /api/provider-profiles/me
- `getProviderProfiles(filters)` - GET /api/provider-profiles (public)
- `getProviderProfileByUserId(userId)` - GET /api/provider-profiles/:userId

**React Query Hooks**:
- `useMyProviderProfileQuery()` - Fetch current user's profile
- `useUpsertMyProviderProfileMutation()` - Create/update profile
- `useUpdateMyProviderProfileMutation()` - Partial update
- `useDeleteMyProviderProfileMutation()` - Delete profile
- `useProviderProfilesQuery(filters)` - Fetch public provider list
- `useProviderProfileQuery(userId)` - Fetch specific provider

**Cache Management**:
- Automatically updates React Query cache after mutations
- Invalidates relevant queries to keep UI in sync

## Files Modified

### `/mobile/src/screens/provider/BecomeProviderScreen.tsx`
**Changes Made**:

1. **Added Profile Fetching**:
   - Uses `useMyProviderProfileQuery()` to fetch existing profile
   - Shows loading state while fetching
   - Automatically loads existing data into wizard for editing

2. **Connected to Centralized Store**:
   - Replaced local `useState` with Zustand store
   - All step data now flows through store
   - Validation uses `isStepComplete()` from store

3. **Enum Conversion Helpers**:
   - `formatToLegacy()` / `legacyToFormat()` - TeachingFormat conversions
   - `experienceToLegacy()` / `legacyToExperience()` - ExperienceLevel conversions
   - `rateTypeToLegacy()` / `legacyToRateType()` - HourlyRateType conversions
   - Ensures compatibility between legacy UI components and new backend enums

4. **Updated Submission Logic**:
   - Uses `buildPayloadForApi()` to create request payload
   - Calls `useUpsertMyProviderProfileMutation()` for submission
   - Proper error handling and success messages
   - Differentiates between create and update in success message

5. **Improved UX**:
   - Header title changes to "Modifier mon profil" when editing
   - Loading screen while fetching existing profile
   - Reset wizard state after successful submission

## Wizard Flow

The wizard has 5 steps:

1. **Categories & Skills** (Step 1)
   - Select categories (Programming, Education, etc.)
   - Select at least 3 skills
   - Data stored in `step2` of store

2. **Teaching Format & Location** (Step 2)
   - Choose: Online, In-Person, or Both
   - Select city if In-Person or Both
   - Data stored in `step1` of store

3. **Experience Level** (Step 3)
   - Select experience level (Student, Engineer, Teacher, etc.)
   - Optionally add study year if Student
   - Data stored in `step2` of store

4. **Pricing** (Step 4)
   - Choose pricing tier: Basic, Standard, Premium, or Custom
   - If Custom, enter custom hourly rate
   - Data stored in `step3` of store

5. **Bio & Photo** (Step 5)
   - Write bio (minimum 50 characters)
   - Optionally upload photo
   - Data stored in `step5` of store

## API Payload Example

When the user completes the wizard, the following payload is sent to `POST /api/provider-profiles/me`:

```json
{
  "teachingFormatNew": "BOTH",
  "cities": ["Casablanca", "Rabat"],
  "experienceLevelNew": "JUNIOR_ENGINEER",
  "studyYear": null,
  "categories": ["Programming", "Web Development"],
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRateType": "STANDARD",
  "hourlyRateMin": null,
  "hourlyRateMax": null,
  "availability": null,
  "bio": "Passionate developer with 5 years of experience teaching React and Node.js to students...",
  "photo": null,
  "onboardingCompleted": true
}
```

## Backend Response Example

After successful submission, the backend returns:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "profileStatus": "PENDING_REVIEW",
  "isPhoneVerified": false,
  "isEmailVerified": false,
  "teachingFormatNew": "BOTH",
  "cities": ["Casablanca", "Rabat"],
  "experienceLevelNew": "JUNIOR_ENGINEER",
  "hourlyRateType": "STANDARD",
  "categories": ["Programming", "Web Development"],
  "skills": ["React", "Node.js", "TypeScript"],
  "bio": "...",
  "onboardingCompleted": true,
  "isComplete": true,
  "rating": null,
  "totalRatings": 0,
  "createdAt": "2025-11-30T...",
  "updatedAt": "2025-11-30T...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+212..."
  }
}
```

## Profile Completion Logic

A profile is considered "complete" when it has:

1. ✅ At least one category
2. ✅ At least 3 skills
3. ✅ Teaching format specified
4. ✅ At least one city (if format is IN_PERSON or BOTH)
5. ✅ Pricing information (hourlyRateType or legacy pricingTier)
6. ✅ Bio with minimum 50 characters

**Profile Status Flow**:
- Incomplete profiles → `DRAFT`
- Complete profiles → `PENDING_REVIEW`
- Admin can manually set → `APPROVED` or `SUSPENDED`

## Enum Mapping

The UI components use legacy string values, which are converted to/from backend enums:

### TeachingFormat
| Legacy (UI) | Enum (Backend) |
|-------------|----------------|
| `"online"` | `TeachingFormat.ONLINE` |
| `"presential"` | `TeachingFormat.IN_PERSON` |
| `"both"` | `TeachingFormat.BOTH` |

### ExperienceLevel
| Legacy (UI) | Enum (Backend) |
|-------------|----------------|
| `"student"` | `ExperienceLevel.STUDENT` |
| `"engineering_student"` | `ExperienceLevel.ENGINEERING_STUDENT` |
| `"junior_engineer"` | `ExperienceLevel.JUNIOR_ENGINEER` |
| `"teacher"` | `ExperienceLevel.TEACHER` |
| `"freelance"` | `ExperienceLevel.FREELANCER` |
| `"expert"` | `ExperienceLevel.EXPERT` |

### HourlyRateType
| Legacy (UI) | Enum (Backend) |
|-------------|----------------|
| `"basic"` | `HourlyRateType.BASIC` |
| `"standard"` | `HourlyRateType.STANDARD` |
| `"premium"` | `HourlyRateType.PREMIUM` |
| `"custom"` | `HourlyRateType.CUSTOM` |

## Error Handling

The wizard handles errors at multiple levels:

1. **Step Validation**: Each step validates input before allowing "Next"
2. **API Validation**: Backend returns 400 with validation errors
3. **User-Friendly Messages**: Validation errors are displayed in alerts
4. **Network Errors**: Handled gracefully with error messages

## Edit Mode

When a user who already has a provider profile opens the wizard:

1. `useMyProviderProfileQuery()` fetches existing profile
2. Loading screen shown while fetching
3. `loadFromProfile(existingProfile)` populates wizard with existing data
4. User can modify any step
5. On submit, `POST /api/provider-profiles/me` performs upsert (update)
6. Success message says "Ton profil provider a été mis à jour"

## Future Improvements

1. **TODO**: Update Step components to use enums directly instead of legacy strings
2. **TODO**: Add photo upload functionality to Step 5
3. **TODO**: Add availability calendar UI to Step 4
4. **TODO**: Implement multi-city selection UI (currently only single city)
5. **TODO**: Add profile preview before final submission
6. **TODO**: Implement admin review workflow UI
7. **TODO**: Add phone/email verification UI

## Testing the Integration

### Create New Profile
1. Navigate to "Devenir Provider"
2. Complete all 5 steps
3. Submit on final step
4. Should see success message and redirect to main tabs
5. Profile should appear in backend with status `PENDING_REVIEW`

### Edit Existing Profile
1. User with existing profile navigates to wizard
2. Should see loading screen
3. Wizard should pre-fill with existing data
4. Modify any fields
5. Submit
6. Should see "mis à jour" success message
7. Changes should be reflected in backend

### Validation Testing
1. Try to go "Next" without filling required fields → Button disabled
2. Try bio with < 50 characters → Cannot proceed to submit
3. Try IN_PERSON without city → Cannot proceed
4. Try CUSTOM pricing without price → Cannot proceed

## API Endpoints Used

- **GET** `/api/provider-profiles/me` - Fetch current user's profile
- **POST** `/api/provider-profiles/me` - Create or update profile
- **PATCH** `/api/provider-profiles/me` - Partial update (not used in wizard)
- **DELETE** `/api/provider-profiles/me` - Delete profile (not used in wizard)

## Authentication

All API calls automatically include JWT token via axios interceptor in `/mobile/src/services/api.ts`:
- Token stored in AsyncStorage
- Automatically added to `Authorization: Bearer <token>` header
- Token refresh handled automatically on 401 errors

## Cache Management

React Query manages server state:
- Query key: `['providerProfiles', 'me']`
- Stale time: 5 minutes
- Automatic cache updates after mutations
- Manual invalidation of related queries

## Known Limitations

1. **Single City Only**: UI only supports selecting one city (backend supports multiple)
2. **No Photo Upload**: Photo field exists but upload UI not implemented
3. **Basic Availability**: Availability is just a text field, not a calendar
4. **No Category/Skill Management**: Categories and skills are hardcoded in UI
5. **No Admin Features**: Profile status/verification only changeable via API directly

## Backward Compatibility

The implementation maintains backward compatibility:
- Backend accepts both legacy fields (`teachingFormat`, `experienceLevel`, `pricingTier`) and new enum fields
- Mobile app sends new enum fields (`teachingFormatNew`, `experienceLevelNew`, `hourlyRateType`)
- Legacy mobile apps can continue to use old endpoints (`POST /api/provider-profiles`)
- New mobile app uses recommended `/me` endpoints

## Deployment Checklist

Before deploying to production:

- [ ] Verify all enum values match between mobile and backend
- [ ] Test create profile flow end-to-end
- [ ] Test edit profile flow end-to-end
- [ ] Test validation on all steps
- [ ] Test error scenarios (network failure, validation errors)
- [ ] Verify React Query cache invalidation works
- [ ] Test on both iOS and Android
- [ ] Verify JWT token refresh works during long sessions
- [ ] Test with slow network conditions
- [ ] Verify profile status transitions correctly

## Support

For questions or issues:
- Backend API docs: `/backend/PROVIDER_PROFILE_API.md`
- Type definitions: `/mobile/src/types/providerProfile.ts`
- Store implementation: `/mobile/src/store/providerOnboardingStore.ts`
- API client: `/mobile/src/services/providerProfiles.ts`
