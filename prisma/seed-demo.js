// ⚠️  DEV/TEST ONLY — creates a fake login and demo data. Do NOT run
// this against a production database. It exists so you (or an
// automated test) can exercise every endpoint — including a real
// signup/login flow — without registering a fresh account first.
// Safe to re-run in dev — it upserts, so running it twice won't create
// duplicates.
//
// Usage: npm run seed:demo
// Test login: arjun@skydesk.io / password123

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { env, isProd } from '../src/config/env.js'

const prisma = new PrismaClient()

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const TEST_EMAIL = 'arjun@skydesk.io'
const TEST_PASSWORD = 'password123'

async function main() {
  // Hard stop — this script must never touch a production database,
  // even if someone runs it there by mistake.
  if (isProd) {
    console.error(
      'Refusing to run seed:demo with NODE_ENV=production. ' +
        'This creates a fake login and fake data — use "npm run seed:reference" in production instead.'
    )
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    update: {},
    create: {
      id: TEST_USER_ID,
      name: 'Arjun Mehta',
      email: TEST_EMAIL,
      passwordHash,
      role: 'admin'
    }
  })

  const trip = await prisma.trip.upsert({
    where: { id: '00000000-0000-0000-0000-00000000000a' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-00000000000a',
      userId: user.id,
      title: 'Delhi Kickoff',
      destination: 'Delhi',
      startDate: new Date('2026-06-30'),
      endDate: new Date('2026-07-02'),
      status: 'Completed'
    }
  })

  await prisma.booking.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000b1' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000b1',
      userId: user.id,
      tripId: trip.id,
      type: 'flight',
      status: 'Confirmed',
      price: 4820,
      date: new Date('2026-07-18'),
      airline: 'IndiGo',
      flightNo: '6E 2291',
      from: 'DEL',
      to: 'BOM',
      depart: '06:15',
      arrive: '08:20',
      pnr: 'X7QK9L'
    }
  })

  await prisma.expense.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000e1' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000e1',
      userId: user.id,
      tripId: trip.id,
      date: new Date('2026-06-30'),
      category: 'flight',
      merchant: 'IndiGo · 6E 0873',
      description: 'Patna to Delhi, client kickoff',
      amount: 3410
    }
  })

  await prisma.advance.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000a1' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000a1',
      userId: user.id,
      tripId: trip.id,
      purpose: 'Delhi Kickoff — cash advance',
      amount: 4000,
      adjusted: 0,
      status: 'Pending'
    }
  })

  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, balance: 18450 }
  })

  await prisma.savedCard.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000c1' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000c1',
      userId: user.id,
      type: 'Visa',
      last4: '4471',
      expiry: '08/28',
      holder: 'ARJUN MEHTA',
      primary: true
    }
  })

  await prisma.wishlistItem.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000f1' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000f1',
      userId: user.id,
      destination: 'Paris, France',
      code: 'PAR',
      price: 35600,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
      reason: 'Dream vacation',
      priceDropped: true,
      dropAmount: 4200
    }
  })

  await prisma.savedFlight.upsert({
    where: { id: '00000000-0000-0000-0000-0000000000f2' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-0000000000f2',
      userId: user.id,
      airline: 'IndiGo',
      flightNo: '6E 2291',
      from: 'DEL',
      to: 'BOM',
      depart: '06:15',
      arrive: '08:20',
      duration: '2h 05m',
      stops: 'Non-stop',
      price: 4820,
      cabin: 'Economy'
    }
  })

  console.log('Demo data seeded (dev/test only).')
  console.log('Test login:', TEST_EMAIL, '/', TEST_PASSWORD)
  console.log('Test user id:', user.id)
  console.log(`(Frontend expected at: ${env.frontendUrl})`)
}

main()
  .catch((err) => {
    console.error('Demo seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
