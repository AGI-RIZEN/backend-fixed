import test from 'node:test'
import assert from 'node:assert'
import { createExpenseSchema } from '../src/validators/expenses.schema.js'

test('valid expense payload passes validation', () => {
  const result = createExpenseSchema.safeParse({
    date: '2026-07-18',
    category: 'meals',
    merchant: 'Team lunch',
    amount: 980
  })
  assert.strictEqual(result.success, true)
})

test('rejects negative amount', () => {
  const result = createExpenseSchema.safeParse({
    date: '2026-07-18',
    category: 'meals',
    merchant: 'Team lunch',
    amount: -50
  })
  assert.strictEqual(result.success, false)
})

test('rejects invalid category', () => {
  const result = createExpenseSchema.safeParse({
    date: '2026-07-18',
    category: 'shopping',
    merchant: 'Mall',
    amount: 500
  })
  assert.strictEqual(result.success, false)
})
