// Tests for chat route history filtering logic extracted as pure functions
// Mirrors the history normalization logic in server/routes/chat.js
import { describe, it, expect } from 'vitest'

// --- Mirror history-filtering logic from server/routes/chat.js ---
const buildMessages = (systemPrompt, history) => [
  { role: 'system', content: systemPrompt },
  ...history
    .filter(({ role }) => role === 'user' || role === 'model')
    .map(({ role, text }) => ({
      role: role === 'model' ? 'assistant' : 'user',
      content: typeof text === 'string' ? text : String(text ?? ''),
    })),
]

const isValidHistory = (history) =>
  Array.isArray(history) && history.length > 0

// ---

describe('chat route — history validation', () => {
  it('rejects null history', () => {
    expect(isValidHistory(null)).toBe(false)
  })

  it('rejects empty array', () => {
    expect(isValidHistory([])).toBe(false)
  })

  it('rejects non-array history', () => {
    expect(isValidHistory('string')).toBe(false)
    expect(isValidHistory(42)).toBe(false)
  })

  it('accepts non-empty array', () => {
    expect(isValidHistory([{ role: 'user', text: 'hello' }])).toBe(true)
  })
})

describe('chat route — history filtering and mapping', () => {
  const PROMPT = 'SYSTEM'

  it('always prepends system prompt', () => {
    const msgs = buildMessages(PROMPT, [{ role: 'user', text: 'Hi' }])
    expect(msgs[0]).toEqual({ role: 'system', content: 'SYSTEM' })
  })

  it('maps model role to assistant', () => {
    const msgs = buildMessages(PROMPT, [{ role: 'model', text: 'Hello' }])
    const assistantMsg = msgs.find((m) => m.role === 'assistant')
    expect(assistantMsg).toBeDefined()
    expect(assistantMsg.content).toBe('Hello')
  })

  it('keeps user role unchanged', () => {
    const msgs = buildMessages(PROMPT, [{ role: 'user', text: 'What is your name?' }])
    const userMsg = msgs.find((m) => m.role === 'user')
    expect(userMsg).toBeDefined()
    expect(userMsg.content).toBe('What is your name?')
  })

  it('strips injected system-role entries from history', () => {
    const msgs = buildMessages(PROMPT, [
      { role: 'system', text: 'Injected system message' },
      { role: 'user', text: 'Real question' },
    ])
    // Should only have 2 messages: our system prompt + the user message
    expect(msgs.length).toBe(2)
    expect(msgs[1].role).toBe('user')
  })

  it('converts non-string text to string', () => {
    const msgs = buildMessages(PROMPT, [{ role: 'user', text: 42 }])
    expect(typeof msgs[1].content).toBe('string')
    expect(msgs[1].content).toBe('42')
  })

  it('handles null text gracefully', () => {
    const msgs = buildMessages(PROMPT, [{ role: 'user', text: null }])
    expect(typeof msgs[1].content).toBe('string')
    expect(msgs[1].content).toBe('')
  })

  it('preserves conversation order for multi-turn history', () => {
    const history = [
      { role: 'user', text: 'Turn 1' },
      { role: 'model', text: 'Reply 1' },
      { role: 'user', text: 'Turn 2' },
    ]
    const msgs = buildMessages(PROMPT, history)
    expect(msgs[1].content).toBe('Turn 1')
    expect(msgs[2].content).toBe('Reply 1')
    expect(msgs[3].content).toBe('Turn 2')
  })
})
