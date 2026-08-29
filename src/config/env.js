import 'dotenv/config'

// Fail fast on boot if required env vars are missing, rather than
// crashing confusingly later when a route first touches them.
const required = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']

const missing = required.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Where reset-password links point the user back to. Defaults to
  // corsOrigin since in dev that's the same app anyway.
  frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Brevo (formerly Sendinblue) transactional email. Optional on
  // purpose — if unset, emailService just logs and skips sending
  // instead of crashing signup/booking/etc. Get a free-tier key at
  // https://app.brevo.com/settings/keys/api
  brevoApiKey: process.env.BREVO_API_KEY || null,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'no-reply@skydesk.io',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'SkyDesk'
}

export const isProd = env.nodeEnv === 'production'
