import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { formatCurrencyForEmail, formatDateForEmail } from '../utils/emailFormatters.js'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Every email in this app goes through here. Failures are always
// swallowed (logged, never thrown) — a broken email provider should
// never be the reason a signup, booking, or password reset fails.
// Email is a side effect of those flows, not a dependency of them.
async function send({ to, toName, subject, html }) {
  if (!env.brevoApiKey) {
    logger.warn({ to, subject }, 'BREVO_API_KEY not set — skipping email send')
    return
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': env.brevoApiKey
      },
      body: JSON.stringify({
        sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html
      })
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.warn({ status: res.status, body, to, subject }, 'Brevo email send failed')
    }
  } catch (err) {
    logger.warn({ err, to, subject }, 'Brevo email send threw')
  }
}

function wrapper(bodyHtml) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #2563eb; margin-bottom: 4px;">SkyDesk</h2>
      ${bodyHtml}
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        This is an automated message from SkyDesk. Please don't reply directly to this email.
      </p>
    </div>
  `
}

function describeBooking(booking) {
  if (booking.type === 'flight') {
    return `${booking.airline || 'Flight'} ${booking.flightNo || ''} — ${booking.from || '?'} → ${booking.to || '?'}`.trim()
  }
  if (booking.type === 'hotel') {
    return `${booking.hotelName || 'Hotel'} stay${booking.location ? ` in ${booking.location}` : ''}`
  }
  if (booking.type === 'cab') {
    return 'Cab booking'
  }
  return 'Booking'
}

export const emailService = {
  sendWelcomeEmail(user) {
    return send({
      to: user.email,
      toName: user.name,
      subject: 'Welcome to SkyDesk 🎉',
      html: wrapper(`
        <p>Hi ${user.name},</p>
        <p>Your account has been created successfully. You're all set to sign in and start managing your trips, expenses, and bookings.</p>
      `)
    })
  },

  sendPasswordResetEmail(user, resetUrl) {
    return send({
      to: user.email,
      toName: user.name,
      subject: 'Reset your SkyDesk password',
      html: wrapper(`
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      `)
    })
  },

  sendBookingConfirmedEmail(user, booking) {
    return send({
      to: user.email,
      toName: user.name,
      subject: `Booking confirmed — ${describeBooking(booking)}`,
      html: wrapper(`
        <p>Hi ${user.name},</p>
        <p>Your ${booking.type} booking is confirmed.</p>
        <table style="width:100%;font-size:14px;margin-top:12px;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#64748b;">Details</td><td style="text-align:right;font-weight:600;">${describeBooking(booking)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Date</td><td style="text-align:right;font-weight:600;">${formatDateForEmail(booking.date)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Amount</td><td style="text-align:right;font-weight:600;">${formatCurrencyForEmail(booking.price)}</td></tr>
        </table>
      `)
    })
  },

  sendBookingFailedEmail(user, attempted, reason) {
    return send({
      to: user.email,
      toName: user.name,
      subject: "We couldn't complete your booking",
      html: wrapper(`
        <p>Hi ${user.name},</p>
        <p>Unfortunately your ${attempted?.type || ''} booking could not be completed${reason ? `: ${reason}` : '.'}</p>
        <p>Please try again from the app, or reach out to support if this keeps happening.</p>
      `)
    })
  }
}
