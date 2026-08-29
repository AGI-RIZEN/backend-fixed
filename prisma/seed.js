// Seeds the database with one real test user (with a real, working
// login) plus a handful of realistic records, so you can test every
// endpoint — including a real signup/login flow — without needing to
// register a fresh account first. Safe to re-run — it upserts, so
// running it twice won't create duplicates.
//
// Usage: npm run seed
// Test login: arjun@skydesk.io / password123

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'
const TEST_EMAIL = 'arjun@skydesk.io'
const TEST_PASSWORD = 'password123'

async function main() {
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

  // Offers — global promo content, not tied to any one user.
  const offers = [
    {
      id: '00000000-0000-0000-0000-0000000000f3',
      title: '20% Off International Flights',
      description: 'Book any international flight and save 20% this season. Valid on all cabin classes.',
      code: 'INTL20',
      validUntil: new Date('2026-07-31'),
      badge: 'HOT',
      gradient: 'from-blue-600 to-blue-800',
      icon: 'Globe',
      discount: '20% OFF'
    },
    {
      id: '00000000-0000-0000-0000-0000000000f4',
      title: 'Weekend Getaway Deals',
      description: 'Fly out Friday, return Sunday. Special weekend pricing on select domestic routes.',
      code: 'WKND50',
      validUntil: new Date('2026-07-27'),
      badge: 'LIMITED',
      gradient: 'from-orange-500 to-red-500',
      icon: 'Sunset',
      discount: '₹500 OFF'
    },
    {
      id: '00000000-0000-0000-0000-0000000000f5',
      title: 'Student Discount Special',
      description: 'Verified students get exclusive discounts on all routes. Show your ID at check-in.',
      code: 'STUDENT15',
      validUntil: new Date('2026-08-31'),
      badge: 'NEW',
      gradient: 'from-purple-500 to-indigo-600',
      icon: 'GraduationCap',
      discount: '15% OFF'
    },
    {
      id: '00000000-0000-0000-0000-0000000000f6',
      title: 'HDFC Credit Card Offer',
      description: 'Get ₹1500 cashback on bookings above ₹10,000 with your HDFC credit card.',
      code: 'HDFC1500',
      validUntil: new Date('2026-07-20'),
      badge: 'BANK OFFER',
      gradient: 'from-teal-500 to-cyan-600',
      icon: 'CreditCard',
      discount: '₹1500 CB'
    }
  ]
  for (const offer of offers) {
    await prisma.offer.upsert({ where: { id: offer.id }, update: {}, create: offer })
  }

  // Flight listings — seeded inventory that /api/v1/flights/search queries
  // against, standing in for a live flight-pricing API.
  const flightListings = [
    {
      id: '00000000-0000-0000-0000-0000000000f7',
      airline: 'IndiGo',
      code: '6E 2291',
      from: 'DEL',
      to: 'BOM',
      depart: '06:15',
      arrive: '08:20',
      duration: '2h 05m',
      stops: 'Non-stop',
      price: 4820,
      cabin: 'Economy',
      international: false
    },
    {
      id: '00000000-0000-0000-0000-0000000000f8',
      airline: 'British Airways',
      code: 'BA 178',
      from: 'JFK',
      to: 'LHR',
      depart: '09:15',
      arrive: '21:30',
      duration: '7h 15m',
      stops: 'Non-stop',
      price: 33440,
      cabin: 'Economy',
      international: true,
      tag: 'Best Value'
    },
    {
      id: '00000000-0000-0000-0000-0000000000f9',
      airline: 'Virgin Atlantic',
      code: 'VS 026',
      from: 'JFK',
      to: 'LHR',
      depart: '11:10',
      arrive: '23:20',
      duration: '7h 10m',
      stops: 'Non-stop',
      price: 35600,
      cabin: 'Economy',
      international: true,
      tag: 'Fastest'
    },
    {
      id: '00000000-0000-0000-0000-0000000000fa',
      airline: 'American Airlines',
      code: 'AA 100',
      from: 'JFK',
      to: 'LHR',
      depart: '18:25',
      arrive: '06:35',
      duration: '7h 10m',
      stops: 'Non-stop',
      price: 31120,
      cabin: 'Economy',
      international: true,
      tag: 'Lowest Fare'
    }
  ]
  for (const flight of flightListings) {
    await prisma.flightListing.upsert({ where: { id: flight.id }, update: {}, create: flight })
  }

  console.log('Seed complete.')
  console.log('Test login:', TEST_EMAIL, '/', TEST_PASSWORD)
  console.log('Test user id:', user.id)
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
