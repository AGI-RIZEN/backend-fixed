// Mints a JWT locally using the same JWT_SECRET the running server uses,
// so you can test protected routes before the real login endpoint exists.
// This is a DEV-ONLY convenience — it must never exist in production,
// since it lets anyone with the secret impersonate any user id/role.
//
// Usage:
//   node scripts/generate-test-token.js
//   node scripts/generate-test-token.js --sub 00000000-0000-0000-0000-000000000001 --role admin
//   node scripts/generate-test-token.js --role employee

import 'dotenv/config'
import jwt from 'jsonwebtoken'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : fallback
}

const sub = getArg('sub', '00000000-0000-0000-0000-000000000001')
const role = getArg('role', 'admin')
const quiet = args.includes('--quiet')

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set — copy .env.example to .env first.')
  process.exit(1)
}

const token = jwt.sign({ sub, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

if (quiet) {
  // Scripting mode: print ONLY the token, nothing else, so it's safe
  // to capture with $(...) in other scripts.
  console.log(token)
} else {
  console.log('\nTest token (valid 7 days):\n')
  console.log(token)
  console.log('\nUse it like:\n')
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4000/api/v1/trips\n`)
  console.log(`Payload: { sub: "${sub}", role: "${role}" }`)
  console.log(`\nNote: the user id "${sub}" must exist in the User table for`)
  console.log('most endpoints to work — run "npm run seed:demo" first if you haven\'t.\n')
}
