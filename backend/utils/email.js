/**
 * Email utility functions for Painting Manager
 * Handles email templates and sending logic
 */

/**
 * Generate HTML email for painting lending notification (Dutch)
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
  
  const formattedLentDate = lent_date ? new Date(lent_date).toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Niet gespecificeerd';
  
  const formattedDueDate = due_date ? new Date(due_date).toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Niet gespecificeerd';

  return `
<!DOCTYPE html>
<html lang="nl">
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
      min-width: 140px;
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
    <h1>🎨 Bevestiging Schilderij Uitgeleend</h1>
  </div>
  
  <div class="content">
    <p>Beste <strong>${lent_to}</strong>,</p>
    
    <p>Deze e-mail bevestigt dat je het volgende schilderij hebt geleend uit onze collectie:</p>
    
    <div class="painting-info">
      <h2 style="margin-top: 0; color: #667eea;">📋 Schilderij Details</h2>
      
      <div class="info-row">
        <span class="info-label">Titel:</span>
        <span class="info-value"><strong>${title}</strong></span>
      </div>
      
      ${category ? `
      <div class="info-row">
        <span class="info-label">Categorie:</span>
        <span class="info-value">${category}</span>
      </div>
      ` : ''}
      
      ${address ? `
      <div class="info-row">
        <span class="info-label">Locatie:</span>
        <span class="info-value">${address}</span>
      </div>
      ` : ''}
      
      <div class="info-row">
        <span class="info-label">Uitgeleend op:</span>
        <span class="info-value">${formattedLentDate}</span>
      </div>
      
      <div class="info-row">
        <span class="info-label">Inleverdatum:</span>
        <span class="info-value"><span class="highlight">${formattedDueDate}</span></span>
      </div>
      
      ${lent_phone ? `
      <div class="info-row">
        <span class="info-label">Jouw telefoon:</span>
        <span class="info-value">${lent_phone}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="important-note">
      <p style="margin: 0;"><strong>⚠️ Belangrijke Herinnering</strong></p>
      <p style="margin: 10px 0 0 0;">Lever het schilderij graag in vóór <strong>${formattedDueDate}</strong>. Behandel het kunstwerk met zorg en neem contact op als je vragen hebt.</p>
    </div>
    
    <p>Bedankt voor het lenen uit onze collectie!</p>
    
    <div class="footer">
      <p>Dit is een geautomatiseerd bericht van Painting Manager</p>
      <p>Bij vragen kun je contact opnemen met de eigenaar van de collectie.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for 1-week reminder before due date (Dutch)
 */
export function generateReminderEmail(painting) {
  const { title, lent_to, due_date, address, category, lent_phone } = painting;
  
  const formattedDueDate = due_date ? new Date(due_date).toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Niet gespecificeerd';
  
  const daysRemaining = due_date ? Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return `
<!DOCTYPE html>
<html lang="nl">
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
      border-left: 4px solid #f59e0b;
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
      min-width: 140px;
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
    .reminder-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .days-countdown {
      background: #f59e0b;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⏰ Herinnering: Inleverdatum Nadert</h1>
  </div>
  
  <div class="content">
    <p>Beste <strong>${lent_to}</strong>,</p>
    
    <p>Dit is een vriendelijke herinnering dat de inleverdatum van het geleende schilderij binnenkort aanstaande is.</p>
    
    <div class="days-countdown">
      Nog ${daysRemaining} dag${daysRemaining !== 1 ? 'en' : ''} tot inleverdatum
    </div>
    
    <div class="painting-info">
      <h2 style="margin-top: 0; color: #f59e0b;">📋 Schilderij Details</h2>
      
      <div class="info-row">
        <span class="info-label">Titel:</span>
        <span class="info-value"><strong>${title}</strong></span>
      </div>
      
      ${category ? `
      <div class="info-row">
        <span class="info-label">Categorie:</span>
        <span class="info-value">${category}</span>
      </div>
      ` : ''}
      
      ${address ? `
      <div class="info-row">
        <span class="info-label">Locatie:</span>
        <span class="info-value">${address}</span>
      </div>
      ` : ''}
      
      <div class="info-row">
        <span class="info-label">Inleverdatum:</span>
        <span class="info-value"><span class="highlight">${formattedDueDate}</span></span>
      </div>
      
      ${lent_phone ? `
      <div class="info-row">
        <span class="info-label">Jouw telefoon:</span>
        <span class="info-value">${lent_phone}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="reminder-box">
      <p style="margin: 0;"><strong>📅 Actie Vereist</strong></p>
      <p style="margin: 10px 0 0 0;">Zorg ervoor dat je het schilderij inlevert vóór <strong>${formattedDueDate}</strong>. Neem contact op als je het schilderij langer nodig hebt of als er problemen zijn.</p>
    </div>
    
    <p>Bedankt voor het zorgvuldig omgaan met ons kunstwerk!</p>
    
    <div class="footer">
      <p>Dit is een geautomatiseerd bericht van Painting Manager</p>
      <p>Bij vragen kun je contact opnemen met de eigenaar van de collectie.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for overdue painting notification (Dutch)
 */
export function generateOverdueEmail(painting) {
  const { title, lent_to, due_date, address, category, lent_phone } = painting;
  
  const formattedDueDate = due_date ? new Date(due_date).toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Niet gespecificeerd';
  
  const daysOverdue = due_date ? Math.ceil((new Date() - new Date(due_date)) / (1000 * 60 * 60 * 24)) : 0;

  return `
<!DOCTYPE html>
<html lang="nl">
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
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
      border-left: 4px solid #dc2626;
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
      min-width: 140px;
    }
    .info-value {
      color: #1f2937;
    }
    .highlight-red {
      background: #fee2e2;
      color: #991b1b;
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
    .urgent-box {
      background: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .days-overdue {
      background: #dc2626;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 URGENT: Schilderij Te Laat Ingeleverd</h1>
  </div>
  
  <div class="content">
    <p>Beste <strong>${lent_to}</strong>,</p>
    
    <p>Het geleende schilderij had al ingeleverd moeten zijn. We verzoeken je dringend om het kunstwerk zo spoedig mogelijk terug te brengen.</p>
    
    <div class="days-overdue">
      ${daysOverdue} dag${daysOverdue !== 1 ? 'en' : ''} te laat
    </div>
    
    <div class="painting-info">
      <h2 style="margin-top: 0; color: #dc2626;">📋 Schilderij Details</h2>
      
      <div class="info-row">
        <span class="info-label">Titel:</span>
        <span class="info-value"><strong>${title}</strong></span>
      </div>
      
      ${category ? `
      <div class="info-row">
        <span class="info-label">Categorie:</span>
        <span class="info-value">${category}</span>
      </div>
      ` : ''}
      
      ${address ? `
      <div class="info-row">
        <span class="info-label">Locatie:</span>
        <span class="info-value">${address}</span>
      </div>
      ` : ''}
      
      <div class="info-row">
        <span class="info-label">Inleverdatum was:</span>
        <span class="info-value"><span class="highlight-red">${formattedDueDate}</span></span>
      </div>
      
      ${lent_phone ? `
      <div class="info-row">
        <span class="info-label">Jouw telefoon:</span>
        <span class="info-value">${lent_phone}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="urgent-box">
      <p style="margin: 0;"><strong>⚠️ DIRECTE ACTIE VEREIST</strong></p>
      <p style="margin: 10px 0 0 0;">Dit schilderij is <strong>${daysOverdue} dag${daysOverdue !== 1 ? 'en' : ''}</strong> over tijd. Neem direct contact op met de eigenaar om een afspraak te maken voor het inleveren. Bij schade of andere problemen, laat het ons onmiddellijk weten.</p>
    </div>
    
    <p style="color: #dc2626; font-weight: 600;">We verwachten spoedig van je te horen.</p>
    
    <div class="footer">
      <p>Dit is een geautomatiseerd bericht van Painting Manager</p>
      <p>Neem direct contact op met de eigenaar van de collectie.</p>
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
    subject: `Bevestiging Schilderij Lenen: ${painting.title}`,
    html: htmlContent
  });
}

/**
 * Send a reminder email (1 week before due date)
 * @param {Object} resend - Resend client instance
 * @param {Object} painting - The painting details
 * @returns {Promise<Object>} Resend API response
 */
export async function sendReminderNotification(resend, painting) {
  if (!resend) {
    throw new Error('Email service not configured');
  }
  
  if (!painting.lent_email) {
    throw new Error('No email address provided for borrower');
  }

  const htmlContent = generateReminderEmail(painting);
  
  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: painting.lent_email,
    subject: `⏰ Herinnering: ${painting.title} moet binnenkort worden ingeleverd`,
    html: htmlContent
  });
}

/**
 * Send an overdue notification email
 * @param {Object} resend - Resend client instance
 * @param {Object} painting - The painting details
 * @returns {Promise<Object>} Resend API response
 */
export async function sendOverdueNotification(resend, painting) {
  if (!resend) {
    throw new Error('Email service not configured');
  }
  
  if (!painting.lent_email) {
    throw new Error('No email address provided for borrower');
  }

  const htmlContent = generateOverdueEmail(painting);
  
  return await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: painting.lent_email,
    subject: `🚨 URGENT: ${painting.title} is te laat ingeleverd`,
    html: htmlContent
  });
}
