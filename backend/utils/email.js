/**
 * Email utility functions for Painting Manager
 * Handles email templates and sending logic
 */

/**
 * Generate HTML email for painting lending notification
 * @param {Object} painting - The painting details
 * @param {string} painting.title - Title of the painting
 * @param {string} painting.lent_to - Name of the borrower
 * @param {string} painting.lent_date - Date the painting was lent
 * @param {string} painting.due_date - Due date for return
 * @param {string} painting.address - Location of the painting
 * @param {string} painting.category - Category of the painting
 * @param {string} painting.lent_phone - Phone number of the borrower
 * @returns {string} HTML email content
 */
export function generateLendingEmail(painting) {
  const { title, lent_to, lent_date, due_date, address, category, lent_phone } = painting;
  
  const formattedLentDate = lent_date ? new Date(lent_date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Not specified';
  
  const formattedDueDate = due_date ? new Date(due_date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Not specified';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .painting-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
      min-width: 120px;
    }
    .info-value {
      color: #1f2937;
    }
    .highlight {
      background: #fef3c7;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .important-note {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎨 Painting Lent Confirmation</h1>
  </div>
  
  <div class="content">
    <p>Hello <strong>${lent_to}</strong>,</p>
    
    <p>This email confirms that you have borrowed the following painting from our collection:</p>
    
    <div class="painting-info">
      <h2 style="margin-top: 0; color: #667eea;">📋 Painting Details</h2>
      
      <div class="info-row">
        <span class="info-label">Title:</span>
        <span class="info-value"><strong>${title}</strong></span>
      </div>
      
      ${category ? `
      <div class="info-row">
        <span class="info-label">Category:</span>
        <span class="info-value">${category}</span>
      </div>
      ` : ''}
      
      ${address ? `
      <div class="info-row">
        <span class="info-label">Location:</span>
        <span class="info-value">${address}</span>
      </div>
      ` : ''}
      
      <div class="info-row">
        <span class="info-label">Lent Date:</span>
        <span class="info-value">${formattedLentDate}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Due Date:</span>
        <span class="info-value"><span class="highlight">${formattedDueDate}</span></span>
      </div>
      
      ${lent_phone ? `
      <div class="info-row">
        <span class="info-label">Your Phone:</span>
        <span class="info-value">${lent_phone}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="important-note">
      <p style="margin: 0;"><strong>⚠️ Important Reminder</strong></p>
      <p style="margin: 10px 0 0 0;">Please return the painting by <strong>${formattedDueDate}</strong>. Take good care of the artwork and contact us if you have any questions.</p>
    </div>
    
    <p>Thank you for borrowing from our collection!</p>
    
    <div class="footer">
      <p>This is an automated message from Painting Manager</p>
      <p>If you have any questions, please contact the collection owner.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send a lending notification email
 * @param {Object} resend - Resend client instance
 * @param {Object} painting - The painting details
 * @param {string} painting.lent_email - Email address of the borrower
 * @returns {Promise<Object>} Resend API response
 */
export async function sendLendingNotification(resend, painting) {
  if (!resend) {
    throw new Error('Email service not configured');
  }
  
  if (!painting.lent_email) {
    throw new Error('No email address provided for borrower');
  }

  const htmlContent = generateLendingEmail(painting);
  
  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: painting.lent_email,
    subject: `Painting Loan Confirmation: ${painting.title}`,
    html: htmlContent
  });
}
