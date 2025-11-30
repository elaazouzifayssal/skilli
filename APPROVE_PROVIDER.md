# How to Approve Provider Profiles

Your provider list is empty because the backend only shows **APPROVED** providers by default.

When you create a provider profile through the wizard, it gets status `PENDING_REVIEW`.

## Steps to Approve a Provider:

### 1. Get Your User ID

First, you need to know your userId. You can find it in:
- The mobile app after login (check the user object in ProfileScreen)
- Or query the database directly

### 2. Use the Admin Endpoint

```bash
# Replace <userId> with your actual user ID
# Replace <adminAccessToken> with your JWT token

curl -X PATCH http://localhost:3000/api/provider-profiles/<userId>/status \
  -H "Authorization: Bearer <adminAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### 3. Example Using Your Own Access Token

If you're logged in on mobile, you can get your access token from AsyncStorage and use it:

```bash
# Get your access token from the mobile app
# Then approve your own profile:

curl -X PATCH http://localhost:3000/api/provider-profiles/YOUR_USER_ID/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### 4. Verify in Mobile App

After approval, refresh the Providers list:
1. Go to Providers tab
2. Pull to refresh
3. Your profile should now appear!

## Alternative: Show All Profiles (Development Only)

For testing purposes, you can modify the mobile app to show all profiles regardless of status.

Edit `/mobile/src/services/providerProfiles.ts`:

```typescript
// Change this line:
const params = new URLSearchParams();

// To this (to override the default APPROVED filter):
const params = new URLSearchParams();
// Don't filter by status during development
// params.append('status', 'APPROVED'); // Comment this out
```

**Note:** This is only for development. In production, you should keep the APPROVED filter.
