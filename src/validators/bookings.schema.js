import { z } from 'zod'

const flightFields = z.object({
  type: z.literal('flight'),
  airline: z.string().trim().min(1),
  flightNo: z.string().trim().min(1),
  from: z.string().trim().length(3),
  to: z.string().trim().length(3),
  date: z.string(),
  depart: z.string(),
  arrive: z.string(),
  price: z.number().positive(),
  pnr: z.string().trim().min(1)
})

const hotelFields = z.object({
  type: z.literal('hotel'),
  hotelName: z.string().trim().min(1),
  location: z.string().trim().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
  roomType: z.string().trim().min(1),
  price: z.number().positive(),
  confirmationNo: z.string().trim().min(1)
})

const cabFields = z.object({
  type: z.literal('cab'),
  provider: z.string().trim().min(1),
  vehicle: z.string().trim().min(1),
  pickup: z.string().trim().min(1),
  drop: z.string().trim().min(1),
  date: z.string(),
  time: z.string(),
  price: z.number().positive(),
  bookingRef: z.string().trim().min(1)
})

export const createBookingSchema = z.discriminatedUnion('type', [
  flightFields,
  hotelFields,
  cabFields
]).and(
  z.object({
    tripId: z.string().uuid().nullable().optional()
  })
)

export const bookingIdParamSchema = z.object({
  id: z.string().uuid()
})
