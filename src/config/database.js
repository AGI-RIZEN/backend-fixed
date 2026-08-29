import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

// Single shared Prisma client instance for the whole app.
// NOTE: prisma/schema.prisma in this repo is a MINIMAL PLACEHOLDER —
// the real schema/migrations are owned by a teammate and will replace
// this file once finalized. This client is written against the model
// names/fields expected by the frontend so the API layer can be built
// and tested independently in the meantime.
export const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error']
})

export async function connectDatabase() {
  await prisma.$connect()
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
