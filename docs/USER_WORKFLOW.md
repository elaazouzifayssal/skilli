# Skilli User Workflow Guide

## Complete User Journey: From Booking to Review

This document explains the entire workflow for users booking and attending sessions on the Skilli platform.

---

## 📅 Step 1: Booking a Session

### As a Client (Attendee):

1. **Browse Sessions**
   - Navigate to Home screen or "Explore" tab
   - Sessions are displayed with:
     - Title, description, skills
     - Date & time
     - Price in MAD
     - Number of available spots
     - Provider rating

2. **View Session Details**
   - Tap on any session card
   - See full session information:
     - Complete description
     - Date, time, duration, location
     - Provider profile (tap to see full provider details)
     - Current bookings count
     - Reviews from previous attendees
     - Average rating

3. **Book the Session**
   - Tap "Réserver" button at bottom of screen
   - Confirm booking (shows price)
   - Booking is immediately confirmed
   - **You receive a notification:** "Réservation confirmée"

4. **What Happens After Booking**
   - Booking appears in "My Sessions" screen
   - Provider receives notification of your booking
   - Status: `PENDING` (waiting for session start)

---

## 🔔 Step 2: Session Reminders

### Before Session Starts:

**1 Hour Before Session:**
- **You receive a notification:** "Session dans 1 heure"
  - Message: "N'oubliez pas votre session [Title] qui commence bientôt"
  - Tap notification to view session details
  - Check location (if in-person) or meeting link (if online)

**Provider Also Gets Notified:**
- Provider receives reminder about their upcoming session
- Can see list of all attendees

---

## 🎓 Step 3: Attending the Session

### During the Session:

**For Online Sessions:**
- Join the virtual meeting (link provided by provider)
- Participate in the session

**For In-Person Sessions:**
- Go to the specified location
- Arrive a few minutes early

**Session Status Changes:**
- Status automatically updates to `COMPLETED` after session end time
- Booking record is updated

---

## ⭐ Step 4: Leaving a Review

### After Session Completion:

1. **Review Eligibility**
   - You can only review sessions you **attended** (completed booking)
   - Session status must be **"Terminé"** (completed) - this happens automatically after the session date/time passes
   - One review per session (cannot review the same session twice)
   - Cannot review your own sessions (if you're the provider)

2. **How to Leave a Review**

   **Step-by-Step:**
   1. Go to **Profile** tab (bottom navigation)
   2. Tap **"Mes sessions"** (My Sessions)
   3. You'll see two tabs:
      - **"Réservations"** (Bookings) - sessions you booked as a client
      - **"Mes sessions"** (My Sessions) - sessions you created as a provider
   4. In the **Bookings** tab, find sessions with status **"Terminé"** (green badge)
   5. Tap on the completed session
   6. You'll see **"✍️ Laisser un avis"** button in the Reviews section
   7. Tap to open the review form

3. **Writing Your Review**
   - **Select Rating:** 1-5 stars
     - 1 star = "Très décevant"
     - 2 stars = "Décevant"
     - 3 stars = "Moyen"
     - 4 stars = "Bien"
     - 5 stars = "Excellent"
   - **Add Comment (Optional):** Up to 500 characters
   - Tap "Envoyer mon avis"
   - Review submitted! ✅

4. **After Submitting Review**
   - Review appears on session detail page
   - Review appears on provider profile page
   - Provider's average rating recalculates automatically
   - Session's average rating updates
   - Provider receives notification: "Nouvelle note reçue"
   - "✍️ Laisser un avis" button disappears (already reviewed)

---

## 👤 Step 5: Viewing Provider Profiles

### From Any Session:

1. **Navigate to Provider**
   - In Session Detail screen
   - Tap on provider's name or avatar in "Provider" section
   - Opens full provider profile

2. **Provider Profile Includes:**
   - Provider photo and name
   - Location (city)
   - Overall rating (⭐ X.X with review count)
   - Bio/description
   - Skills offered
   - **All sessions by this provider**
   - **All reviews received** (from all sessions)
   - "Contact" button to message provider

3. **Contacting Providers**
   - Tap 💬 message button (on session detail or provider profile)
   - Opens chat conversation
   - Real-time messaging

---

## 📱 Notifications You'll Receive

### Booking Notifications:
- ✅ "Réservation confirmée" - When you book a session
- ⏰ "Session dans 1 heure" - 1 hour before session starts

### Provider Notifications (if you're a provider):
- 📌 "Nouvelle réservation" - When someone books your session
- ⭐ "Nouvelle note reçue" - When someone reviews your session
- ⏰ "Session dans 1 heure" - Reminder of your upcoming session

### Message Notifications:
- 💬 "Nouveau message" - When someone sends you a message

---

## 🔍 Finding Your Sessions

### My Sessions Screen:

Navigate to: **Profile** → **"Mes sessions"**

**Shows:**
- **Upcoming sessions** you booked
- **Past sessions** you attended
- **Sessions you created** (if you're a provider)

**For Each Session:**
- Title, date, time
- Status: PENDING, COMPLETED, CANCELLED
- "View Details" to see full info
- "Leave Review" button (if completed and not yet reviewed)

---

## ✏️ Editing/Cancelling Sessions

### As Session Owner (Provider):

**Edit Session:**
- From session detail screen
- Tap "✏️ Modifier la session" button
- Update any field (title, date/time, price, location, etc.)
- Use date/time pickers (no manual typing!)
- Tap "Enregistrer les modifications"

**Delete Session:**
- From edit screen
- Tap "Supprimer la session" (red button)
- Confirm deletion ⚠️ **This is irreversible!**

**Notes:**
- Cannot edit/delete past sessions
- Attendees are not automatically notified of changes
- Consider messaging attendees if you change important details

---

## 💡 Tips & Best Practices

### For Attendees:
1. ✅ Book early - sessions can fill up quickly
2. ⏰ Set personal reminders in addition to app notifications
3. 📱 Check the app 10 minutes before session for any last-minute updates
4. ⭐ Leave honest reviews to help the community
5. 💬 Message provider if you have questions before the session

### For Providers:
1. 📅 Set accurate dates and times
2. 📝 Write clear, detailed descriptions
3. 💰 Price competitively but fairly
4. 💬 Respond quickly to messages from attendees
5. 📢 Provide meeting links or location details well in advance
6. ⭐ Respond professionally to all reviews

---

## ⚠️ Current Limitations

1. **No Automatic Session Reminders Yet**
   - The notification system exists in code
   - Needs a cron job/scheduler to trigger 1-hour reminders
   - **Workaround:** Set personal phone reminders

2. **No Payment Integration**
   - Price is displayed but not enforced
   - Payments handled outside the app (cash, bank transfer, etc.)
   - Future feature: Online payment processing

3. **No Cancellation Policy**
   - Users can book but there's no formal cancellation process
   - Providers can delete sessions, which affects bookings
   - Consider adding booking cancellation feature

4. **No Review Editing**
   - Once submitted, reviews cannot be edited
   - Can only create one review per session
   - Contact support if you need to change a review

5. **Provider Responses to Reviews**
   - Providers cannot respond to reviews yet
   - One-way feedback system
   - Future enhancement planned

---

## 🐛 Troubleshooting

### "Can't book this session"
- Session may be full (maxParticipants reached)
- Session may be in the past
- You may be the session owner (can't book your own session)

### "Can't leave a review"
- You must have a **completed booking** for this session
- Session must be in the past
- You can only review once per session
- Cannot review your own sessions

### "Provider profile won't load"
- Check internet connection
- Provider may not have completed their profile
- Try refreshing the screen

### Notifications not appearing
- Check app notification permissions in phone settings
- Ensure background app refresh is enabled
- Automatic reminders require backend scheduler (not yet active)

---

## 📊 How Ratings Work

### Rating Calculation:

**Session Rating:**
- Average of all reviews for that specific session
- Displayed on session card and detail screen
- Recalculated instantly when new review added

**Provider Rating:**
- Average of **all reviews across all their sessions**
- Displayed on provider profile and session cards
- Updated automatically when any review is added/updated
- Formula: `SUM(all ratings) / COUNT(all ratings)`
- Rounded to 1 decimal place (e.g., 4.7)

**Total Ratings Count:**
- Shows number of reviews (e.g., "⭐ 4.7 (23 avis)")
- Helps users assess credibility

---

## 📈 Future Enhancements

Coming soon:
- [ ] Automated session reminder notifications (1 hour before)
- [ ] Payment integration (Stripe, PayPal, local payment methods)
- [ ] Booking cancellation with refund policy
- [ ] Provider responses to reviews
- [ ] Multi-category ratings (quality, communication, value)
- [ ] Photo/video attachments to reviews
- [ ] Session recording/materials sharing
- [ ] Attendance verification (QR code check-in)
- [ ] Wishlist/favorites system
- [ ] Search and filters for sessions

---

**Last Updated:** 2025-01-29
**Version:** 1.0
