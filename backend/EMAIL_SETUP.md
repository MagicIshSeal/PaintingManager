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
fetch('/api/test-email', {
  method: 'POST',
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

## 🚀 Production Usage

For production email features:

1. Create dedicated email functions in `backend/utils/email.js`
2. Use environment variables for all email templates
3. Consider rate limiting for email endpoints
4. Log all email sends for auditing
5. Handle bounces and errors appropriately

## 📚 Resend Documentation

- [Resend Docs](https://resend.com/docs)
- [Node.js SDK](https://resend.com/docs/send-with-nodejs)
- [API Reference](https://resend.com/docs/api-reference/emails/send-email)
