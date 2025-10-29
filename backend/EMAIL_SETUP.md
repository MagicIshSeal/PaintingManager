# 📧 Email Setup with Resend

This application uses [Resend](https://resend.com) for sending emails.

## 🔑 Getting Your API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Copy the key (starts with `re_`)

## ⚙️ Configuration

Add to your `.env` file:

```env
# Required: Your Resend API key
RESEND_API_KEY=re_your_api_key_here

# Optional: Custom "from" address (must be verified in Resend)
# If not set, defaults to 'onboarding@resend.dev'
RESEND_FROM_EMAIL=your-verified-email@yourdomain.com
```

### Verifying a Domain (Optional)

To use a custom "from" address:

1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain
3. Add the DNS records shown
4. Wait for verification (usually a few minutes)
5. Use any email address at your verified domain (e.g., `noreply@yourdomain.com`)

> **Note**: Without a verified domain, you can only send to your own email address. The default `onboarding@resend.dev` can send to any address.

## 🧪 Testing Email Functionality

### Method 1: Browser Console (while logged in)

Open browser console and run:

```javascript
// Make sure to use the backend API URL (port 8080)
fetch('http://85.10.134.143:8080/api/test-email', {
  method: 'POST',
  credentials: 'include', // Important: include cookies for authentication
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test from Painting Manager',
    message: '<p>This is a <strong>test email</strong>!</p>'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

> **Important**: The request must go to the **backend API port (8080)**, not the frontend port (5173). Use `credentials: 'include'` to send your session cookie for authentication.

### Method 2: cURL (from terminal)

```bash
# Login first to get session cookie
curl -c cookies.txt -X POST http://YOUR_SERVER_IP:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"yourusername","password":"yourpassword"}'

# Send test email
curl -b cookies.txt -X POST http://YOUR_SERVER_IP:8080/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "message": "<p>Hello from Painting Manager!</p>"
  }'
```

### Request Body Parameters

All parameters are optional:

- `to`: Recipient email address (defaults to `maxvaneikeren@gmail.com`)
- `subject`: Email subject line (defaults to "Test Email from Painting Manager")
- `message`: Email HTML content (defaults to test message)

### Success Response

```json
{
  "success": true,
  "message": "Email sent successfully!",
  "data": {
    "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
  }
}
```

### Error Response

```json
{
  "error": "Error message here",
  "details": "Additional error details"
}
```

## 🔒 Security Notes

- The test endpoint requires authentication (must be logged in)
- API key is stored in environment variables (never in code)
- Emails are sent server-side only (API key never exposed to client)

## 🎨 Automatic Lending Notifications

The application automatically sends email notifications when a painting is lent out!

### How It Works

When you create or update a painting with lending information:
- **Name** (`lent_to`) is filled in
- **Email** (`lent_email`) is provided
- The painting wasn't previously lent (for updates)

An automatic email is sent to the borrower with:
- ✅ Painting title and details (in Dutch)
- ✅ Category and location
- ✅ Lending date
- ✅ **Due date** (highlighted)
- ✅ Borrower's contact information
- ✅ Professional HTML-formatted email

### 📧 Three Types of Emails

#### 1. **Lending Confirmation** (Immediate)
Sent when a painting is lent out:
- Purple gradient header
- All painting details
- Yellow highlighted due date
- Red reminder box

**Subject**: `Bevestiging Schilderij Lenen: [Title]`

#### 2. **Reminder Email** (7 Days Before Due Date)
Automatically sent 1 week before the painting is due:
- Orange gradient header
- Countdown showing days remaining
- All painting details
- Call to action for timely return

**Subject**: `⏰ Herinnering: [Title] moet binnenkort worden ingeleverd`

**Sent**: Exactly 7 days before due date at 9:00 AM

#### 3. **Overdue Email** (After Due Date)
Automatically sent when a painting is overdue:
- Red gradient header
- Shows days overdue in bold
- Urgent tone and messaging
- Request for immediate action

**Subject**: `🚨 URGENT: [Title] is te laat ingeleverd`

**Sent**: 
- 1 day after due date
- Then every 7 days (7, 14, 21, 28 days overdue, etc.)

### 📅 Email Scheduler

The application runs an automated scheduler that:
- ✅ Checks for paintings needing reminders (7 days before due)
- ✅ Checks for overdue paintings
- ✅ Runs daily at **9:00 AM**
- ✅ Runs immediately on server startup
- ✅ Logs all email activity to console

### Email Content Example

**Lending Confirmation:**
```
🎨 Bevestiging Schilderij Uitgeleend

Beste [Naam],

Deze e-mail bevestigt dat je het volgende schilderij hebt geleend...

📋 Schilderij Details
Titel: [Titel]
Categorie: [Categorie]
Locatie: [Adres]
Uitgeleend op: [Datum]
Inleverdatum: [Datum] ⚠️
Jouw telefoon: [Telefoon]

⚠️ Belangrijke Herinnering
Lever het schilderij graag in vóór [Datum].
```

**Reminder (7 days before):**
```
⏰ Herinnering: Inleverdatum Nadert

Nog 7 dagen tot inleverdatum

Dit is een vriendelijke herinnering dat de inleverdatum 
van het geleende schilderij binnenkort aanstaande is.
```

**Overdue:**
```
🚨 URGENT: Schilderij Te Laat Ingeleverd

X dagen te laat

Het geleende schilderij had al ingeleverd moeten zijn. 
We verzoeken je dringend om het kunstwerk zo spoedig 
mogelijk terug te brengen.
```

### Behavior Notes

- Emails are only sent when a painting is **newly lent** (not already lent)
- If email sending fails, the painting update still succeeds (error is logged)
- No email is sent if `RESEND_API_KEY` is not configured
- You can see email send confirmations in the backend logs
- All emails are in **Dutch** language
- Scheduler respects server timezone for 9 AM scheduling

## 🚀 Production Usage

The email system is production-ready with:

1. ✅ Professional HTML email templates in `backend/utils/email.js` (Dutch language)
2. ✅ Automatic notifications on lending events
3. ✅ **Automated reminder emails** (7 days before due date)
4. ✅ **Automated overdue notifications** (1 day + every 7 days after)
5. ✅ Daily scheduler running at 9:00 AM
6. ✅ Error handling (email failures don't break the app)
7. ✅ Environment variable configuration
8. ✅ Console logging for debugging

### Scheduler Details

The email scheduler (`backend/utils/scheduler.js`):
- Runs on server startup
- Checks daily at 9:00 AM for:
  - Paintings with due dates in exactly 7 days → sends reminder
  - Paintings overdue by 1 day → sends first overdue email
  - Paintings overdue by 7, 14, 21+ days → sends follow-up overdue emails
- Logs all activity to console
- Gracefully handles errors without crashing

### Manual Trigger (Optional)

You can manually trigger email checks by adding a test endpoint or running checks from the console. Currently, checks run:
1. On server startup (immediate)
2. Daily at 9:00 AM (scheduled)

### Future Enhancements

Consider adding:
- ✅ ~~Return reminder emails~~ **IMPLEMENTED**
- ✅ ~~Overdue notifications~~ **IMPLEMENTED**
- Return confirmation emails (when painting is returned)
- Email preferences for borrowers
- Customizable reminder timing (e.g., 3 days, 1 week, 2 weeks)
- Admin notification emails (cc owner on all emails)
- Rate limiting for email endpoints

## 📚 Resend Documentation

- [Resend Docs](https://resend.com/docs)
- [Node.js SDK](https://resend.com/docs/send-with-nodejs)
- [API Reference](https://resend.com/docs/api-reference/emails/send-email)
