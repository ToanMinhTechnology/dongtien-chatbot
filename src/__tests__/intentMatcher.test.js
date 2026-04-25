import { describe, it, expect } from 'vitest'
import { matchIntent } from '../utils/intentMatcher.js'

describe('matchIntent', () => {
  it('returns no match for empty string', () => {
    const result = matchIntent('')
    expect(result.match).toBe(false)
    expect(result.answer).toBeNull()
    expect(result.confidence).toBe(0)
  })

  it('returns no match for single-char input', () => {
    const result = matchIntent('a')
    expect(result.match).toBe(false)
  })

  it('returns no match for null input', () => {
    const result = matchIntent(null)
    expect(result.match).toBe(false)
    expect(result.confidence).toBe(0)
  })

  it('returns structured response shape for any query', () => {
    const result = matchIntent('test query')
    expect(result).toHaveProperty('match')
    expect(result).toHaveProperty('intent')
    expect(result).toHaveProperty('answer')
    expect(result).toHaveProperty('confidence')
  })
})
