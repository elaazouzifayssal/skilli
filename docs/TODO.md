# Skilli - TODO List

This document tracks all pending features, improvements, and tasks for future implementation.

---

## 🔴 High Priority (Critical)

### Photo Upload & Display
- [x] **Update mobile app to upload photo to backend API** ✅
  - Update `EditProfileScreen.tsx` `handleSave` to upload photo file
  - Use FormData to send multipart/form-data request
  - Call `POST /api/uploads/profile-photo` endpoint
  - Update user profile with returned photo URL

- [x] **Update auth endpoints to return profile photo** ✅
  - Modified auth service to include provider profile photo in user response
  - `GET /api/auth/me` returns photo URL (via JwtStrategy)
  - Login/register responses now include profile with photo

- [ ] **Test photo upload end-to-end**
  - Test camera photo upload
  - Test gallery photo selection
  - Verify photo displays in Profile screen
  - Verify photo displays in Providers list
  - Verify photo displays in Provider detail
  - Test photo persistence after app restart

---

## 🟡 Medium Priority (Important)

### Photo Management
- [ ] **Delete old photos when uploading new one**
  - Remove previous file from filesystem before uploading new one
  - Prevent disk space accumulation

- [ ] **Add photo validation on backend**
  - Check file size server-side
  - Validate image dimensions (min/max)
  - Scan for malicious files

- [ ] **Image optimization**
  - Compress images on upload
  - Generate thumbnails for list views
  - Serve different sizes based on use case

### Cloud Storage Migration
- [ ] **Migrate from local filesystem to cloud storage**
  - Options: AWS S3, Cloudinary, Google Cloud Storage
  - Update upload controller to use cloud provider
  - Update file URLs to use CDN
  - Add environment variables for cloud credentials

---

## 🟢 Low Priority (Nice to Have)

### Profile Features
- [ ] **Add profile completion percentage**
  - Calculate based on filled fields
  - Show progress bar in profile screen
  - Encourage users to complete profiles

- [ ] **Add profile cover photo**
  - Second photo upload for banner/cover
  - Display in provider detail header

- [ ] **Profile verification**
  - Upload ID documents
  - Admin verification workflow
  - Display verified badge

### Photo Features
- [ ] **Multiple photos per provider**
  - Photo gallery/portfolio
  - Up to 5-10 photos
  - Reorder photos

- [ ] **Photo cropping improvements**
  - Advanced cropping tools
  - Filters and effects
  - Rotate/flip options

---

## 📱 Mobile App Improvements

### Performance
- [ ] **Implement image caching**
  - Cache downloaded profile photos
  - Reduce network requests
  - Use react-native-fast-image

- [ ] **Optimize list rendering**
  - Implement virtualization for long lists
  - Lazy load images
  - Pagination for providers/sessions

### User Experience
- [ ] **Add loading skeletons**
  - Replace spinners with skeleton screens
  - Better perceived performance

- [ ] **Pull-to-refresh everywhere**
  - Add to all list screens
  - Consistent UX across app

- [ ] **Error handling improvements**
  - Better error messages
  - Retry mechanisms
  - Offline mode detection

---

## 🔧 Backend Improvements

### API Enhancements
- [ ] **Add pagination to all list endpoints**
  - Providers list
  - Sessions list
  - Bookings list
  - Include page, limit, total count

- [ ] **Add sorting options**
  - Sort providers by rating, experience, price
  - Sort sessions by date, price, popularity

- [ ] **Add advanced filters**
  - Price range sliders
  - Multiple city selection
  - Availability calendar

### Performance
- [ ] **Add database indexing**
  - Index frequently queried fields
  - Optimize search queries
  - Add full-text search

- [ ] **Implement caching**
  - Redis for frequently accessed data
  - Cache provider profiles
  - Cache session lists

### Security
- [ ] **Rate limiting**
  - Prevent API abuse
  - Limit requests per IP/user
  - Protect upload endpoints

- [ ] **Add file upload virus scanning**
  - Integrate with ClamAV or cloud scanner
  - Reject malicious files

---

## 📊 Analytics & Monitoring

- [ ] **Add analytics tracking**
  - Track user behavior
  - Session booking conversions
  - Popular skills/categories

- [ ] **Error monitoring**
  - Integrate Sentry or similar
  - Track crashes and errors
  - Monitor API performance

- [ ] **Logging improvements**
  - Structured logging
  - Log aggregation (ELK stack)
  - Audit trails for sensitive operations

---

## 💰 Payment Integration

- [ ] **Integrate payment gateway**
  - Options: Stripe, PayPal, local payment methods
  - Handle booking payments
  - Escrow system for security

- [ ] **Provider payouts**
  - Automated payout system
  - Commission calculation
  - Payment history

---

## 💬 Communication Features

### In-App Messaging
- [x] **One-to-one messaging system** ✅
  - Database-backed conversations
  - Real-time messaging with polling (5s)
  - Message notifications
  - Read/unread status
  - Unread count badges
  - Beautiful chat UI (WhatsApp-style)
  - Conversations list with last message preview
  - Profile photo integration
  - Date separators
  - Auto-scroll to bottom

- [ ] **Real-time messaging with WebSocket**
  - Socket.io integration for instant delivery
  - Typing indicators
  - Online/offline status
  - Message delivery receipts

- [ ] **Session discussion boards**
  - Q&A for each session
  - Pre-session communication

### Notifications
- [x] **In-app notifications system** ✅
  - Database-backed notifications
  - Unread count badge
  - Mark as read/delete functionality
  - Automatic notifications on bookings and ratings
  - Notification types: booking, reminder, rating, update

- [ ] **Push notifications**
  - Firebase Cloud Messaging (FCM)
  - Push on new bookings
  - Session reminders (1 hour before)
  - New messages
  - Payment confirmations

- [ ] **Email notifications**
  - Welcome emails
  - Booking confirmations
  - Session reminders
  - Monthly summaries

- [ ] **Scheduled reminders**
  - Cron job to check upcoming sessions
  - Send notifications 1 hour before session
  - Daily summary emails

---

## 🎓 Learning Management

### Sessions
- [ ] **Session recordings**
  - Record online sessions
  - Share with participants
  - Playback controls

- [ ] **Session materials**
  - Upload slides, documents
  - Resource library
  - Downloadable content

- [ ] **Certificates**
  - Generate completion certificates
  - PDF export
  - Verification system

### Reviews & Ratings
- [ ] **Detailed review system**
  - Multiple rating categories
  - Photo/video reviews
  - Helpful votes

- [ ] **Response to reviews**
  - Let providers respond
  - Public conversation

---

## 🔍 Search & Discovery

- [ ] **Advanced search**
  - Elasticsearch integration
  - Fuzzy matching
  - Search history

- [ ] **Recommendations engine**
  - ML-based recommendations
  - "Users also viewed"
  - Personalized suggestions

- [ ] **Categories & Tags**
  - Hierarchical categories
  - Tag system for skills
  - Browse by category

---

## 👥 Social Features

- [ ] **User profiles enhancement**
  - Bio/about section
  - Social media links
  - Education & certifications

- [ ] **Follow system**
  - Follow favorite providers
  - Get notified of new sessions
  - Activity feed

- [ ] **Referral program**
  - Invite friends
  - Rewards/credits
  - Tracking system

---

## 🛠️ Admin Panel

- [ ] **Admin dashboard**
  - User management
  - Session moderation
  - Analytics overview

- [ ] **Content moderation**
  - Review reports
  - Ban/suspend users
  - Remove inappropriate content

- [ ] **Financial dashboard**
  - Revenue tracking
  - Payout management
  - Commission settings

---

## 📱 Platform Expansion

- [ ] **Web application**
  - React web app
  - Responsive design
  - Share codebase with mobile

- [ ] **iOS app**
  - Currently React Native supports both
  - Test on iOS devices
  - App Store submission

---

## 🌍 Internationalization

- [ ] **Multi-language support**
  - English, French, Arabic
  - i18n implementation
  - Language switcher

- [ ] **Currency support**
  - Multiple currencies
  - Exchange rates
  - Local payment methods

---

## 📝 Documentation

- [ ] **Update API documentation**
  - Document photo upload endpoint: `POST /api/uploads/profile-photo`
  - Add example requests/responses
  - Document error codes

- [ ] **Create user guide**
  - How to use the app
  - Provider onboarding guide
  - FAQ section

- [ ] **Developer documentation**
  - Setup instructions
  - Architecture overview
  - Contributing guidelines

---

## 🧪 Testing

- [ ] **Unit tests**
  - Backend services
  - Mobile components
  - 80%+ coverage target

- [ ] **Integration tests**
  - API endpoints
  - Database operations
  - Authentication flows

- [ ] **E2E tests**
  - Critical user flows
  - Booking process
  - Payment flow

---

## 🚀 DevOps & Deployment

- [ ] **CI/CD pipeline**
  - Automated testing
  - Automated deployment
  - GitHub Actions or similar

- [ ] **Production deployment**
  - Deploy backend to cloud (AWS, DigitalOcean, etc.)
  - Set up database (PostgreSQL)
  - Configure SSL/HTTPS

- [ ] **Mobile app deployment**
  - Publish to Google Play Store
  - Publish to Apple App Store
  - App updates workflow

- [ ] **Monitoring & alerts**
  - Uptime monitoring
  - Performance metrics
  - Alert on critical errors

---

## 🔐 Compliance & Legal

- [ ] **Privacy policy**
  - GDPR compliance
  - Data collection disclosure
  - User rights

- [ ] **Terms of service**
  - User agreements
  - Provider terms
  - Cancellation policy

- [ ] **Cookie consent**
  - Cookie banner
  - Consent management
  - Cookie policy

---

## Notes

- Mark tasks as ✅ when completed
- Add new tasks as they're identified
- Prioritize based on user feedback and business needs
- Review this list monthly and update priorities

**Last updated:** 2025-01-27
