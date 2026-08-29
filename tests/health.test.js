import test from 'node:test'
import assert from 'node:assert'
import request from 'supertest'
import { app } from '../src/app.js'

test('GET /health/live returns 200 ok', async () => {
  const res = await request(app).get('/health/live')
  assert.strictEqual(res.status, 200)
  assert.strictEqual(res.body.status, 'ok')
})

test('unknown route returns a consistent 404 JSON shape', async () => {
  const res = await request(app).get('/api/v1/does-not-exist')
  assert.strictEqual(res.status, 404)
  assert.strictEqual(res.body.error.code, 'NOT_FOUND')
})

test('protected route rejects request with no Authorization header', async () => {
  const res = await request(app).get('/api/v1/trips')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.error.code, 'UNAUTHORIZED')
})
