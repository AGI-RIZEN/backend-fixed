import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import YAML from 'yaml'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import { notFoundHandler } from './middleware/notFound.middleware.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const app = express()

// Strict security headers everywhere EXCEPT /docs — Swagger UI's page
// needs an inline init script that the default Content-Security-Policy
// correctly blocks. The actual API (everything under /api/v1) keeps the
// full strict policy; only the docs viewer itself is relaxed.
app.use((req, res, next) => {
  if (req.path.startsWith('/docs')) return next()
  return helmet()(req, res, next)
})
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url?.startsWith('/health') } }))

// Interactive API docs — the contract every teammate (frontend, auth,
// database) integrates against. Open http://localhost:4000/docs in a
// browser to see and try every endpoint without reading source code.
const openapiDoc = YAML.parse(readFileSync(join(__dirname, '..', 'openapi.yaml'), 'utf8'))
app.use(
  '/docs',
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openapiDoc)
)

app.use(routes)

app.use(notFoundHandler)
app.use(errorHandler)
