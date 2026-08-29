// Seeds ONLY real, non-user reference content: promotional Offers and
// the FlightListing inventory that /api/v1/flights/search queries
// against. Safe to run in production — creates no user accounts, no
// fake trips, no demo data. Idempotent (upserts), so safe to re-run.
//
// Usage: npm run seed:reference

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Offers — global promo content, not tied to any one user. There's no
  // admin UI to manage these yet, so they're seeded directly, same
  // spirit as a CMS-driven promo banner. Replace/expand this list with
  // your actual current promotions before going live.
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

  // Flight listings — seeded inventory that /api/v1/flights/search
  // queries against, standing in for a live flight-pricing API. Replace
  // this with your real route/fare inventory (or a script that syncs
  // from a real provider) before going live — these four rows are
  // placeholder routes, not real fares.
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

  console.log('Reference data seeded: offers + flight listings. No user accounts created.')
}

main()
  .catch((err) => {
    console.error('Reference seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
