/**
 * Email scheduler for painting reminders and overdue notifications
 * Runs daily to check for paintings that need email notifications
 */

import { sendReminderNotification, sendOverdueNotification } from './email.js';

/**
 * Check for paintings that need reminder emails (7 days before due date)
 * @param {Object} db - Database instance
 * @param {Object} resend - Resend client instance
 * @param {string} baseUrl - Base URL for images in emails
 */
async function checkReminders(db, resend, baseUrl = '') {
  if (!resend) {
    console.log('⚠️  Resend not configured, skipping reminder check');
    return;
  }

  try {
    // Get all paintings that are currently lent out with a due date
    const paintings = await db.all(`
      SELECT * FROM paintings 
      WHERE lent_to IS NOT NULL 
      AND lent_email IS NOT NULL 
      AND due_date IS NOT NULL
    `);

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    let remindersSent = 0;

    for (const painting of paintings) {
      const dueDate = new Date(painting.due_date);
      
      // Check if due date is exactly 7 days from now (within a 1-day window)
      const daysDifference = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 7) {
        try {
          await sendReminderNotification(resend, painting, baseUrl);
          console.log(`✅ Reminder email sent to ${painting.lent_email} for painting: ${painting.title}`);
          remindersSent++;
        } catch (error) {
          console.error(`❌ Failed to send reminder for painting ${painting.title}:`, error.message);
        }
      }
    }

    if (remindersSent > 0) {
      console.log(`📧 Total reminder emails sent: ${remindersSent}`);
    }
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
  }
}

/**
 * Check for paintings that are overdue
 * @param {Object} db - Database instance
 * @param {Object} resend - Resend client instance
 * @param {string} baseUrl - Base URL for images in emails
 */
async function checkOverdue(db, resend, baseUrl = '') {
  if (!resend) {
    console.log('⚠️  Resend not configured, skipping overdue check');
    return;
  }

  try {
    // Get all paintings that are currently lent out with a due date
    const paintings = await db.all(`
      SELECT * FROM paintings 
      WHERE lent_to IS NOT NULL 
      AND lent_email IS NOT NULL 
      AND due_date IS NOT NULL
    `);

    const now = new Date();
    let overduesSent = 0;

    for (const painting of paintings) {
      const dueDate = new Date(painting.due_date);
      
      // Check if painting is overdue (due date has passed)
      if (dueDate < now) {
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        
        // Send overdue email every 7 days (on days 1, 7, 14, 21, etc.)
        if (daysOverdue === 1 || daysOverdue % 7 === 0) {
          try {
            await sendOverdueNotification(resend, painting, baseUrl);
            console.log(`🚨 Overdue email sent to ${painting.lent_email} for painting: ${painting.title} (${daysOverdue} days overdue)`);
            overduesSent++;
          } catch (error) {
            console.error(`❌ Failed to send overdue notification for painting ${painting.title}:`, error.message);
          }
        }
      }
    }

    if (overduesSent > 0) {
      console.log(`📧 Total overdue emails sent: ${overduesSent}`);
    }
  } catch (error) {
    console.error('❌ Error checking overdue paintings:', error);
  }
}

/**
 * Run all scheduled checks
 * @param {Object} db - Database instance
 * @param {Object} resend - Resend client instance
 * @param {string} baseUrl - Base URL for images in emails
 */
export async function runScheduledChecks(db, resend, baseUrl = '') {
  console.log('🔍 Running scheduled email checks...');
  await checkReminders(db, resend, baseUrl);
  await checkOverdue(db, resend, baseUrl);
  console.log('✅ Scheduled checks complete');
}

/**
 * Start the scheduler (runs daily at 9:00 AM)
 * @param {Object} db - Database instance
 * @param {Object} resend - Resend client instance
 * @param {string} baseUrl - Base URL for images in emails
 */
export function startScheduler(db, resend, baseUrl = '') {
  console.log('📅 Email scheduler started');
  
  // Run immediately on startup
  runScheduledChecks(db, resend, baseUrl);
  
  // Calculate time until next 9:00 AM
  const now = new Date();
  const next9AM = new Date();
  next9AM.setHours(9, 0, 0, 0);
  
  // If it's already past 9 AM today, schedule for tomorrow
  if (now.getHours() >= 9) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  const timeUntilNext9AM = next9AM - now;
  
  console.log(`⏰ Next scheduled check at: ${next9AM.toLocaleString('nl-NL')}`);
  
  // Schedule first run at 9 AM
  setTimeout(() => {
    runScheduledChecks(db, resend, baseUrl);
    
    // Then run every 24 hours
    setInterval(() => {
      runScheduledChecks(db, resend, baseUrl);
    }, 24 * 60 * 60 * 1000);
  }, timeUntilNext9AM);
}