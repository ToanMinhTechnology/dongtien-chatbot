import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from '../components/ChatMessage.jsx'

describe('ChatMessage', () => {
  it('renders user message with correct class', () => {
    const { container } = render(<ChatMessage chat={{ role: 'user', text: 'Hello' }} />)
    expect(container.querySelector('.user-message')).not.toBeNull()
    expect(container.querySelector('.bot-message')).toBeNull()
  })

  it('renders bot message with correct class', () => {
    const { container } = render(<ChatMessage chat={{ role: 'model', text: 'Hi there' }} />)
    expect(container.querySelector('.bot-message')).not.toBeNull()
  })

  it('renders message text content', () => {
    render(<ChatMessage chat={{ role: 'user', text: 'Test message content' }} />)
    expect(screen.getByText('Test message content')).toBeDefined()
  })

  it('renders empty text without crashing', () => {
    const { container } = render(<ChatMessage chat={{ role: 'user', text: '' }} />)
    expect(container.querySelector('.user-message')).not.toBeNull()
  })
})
