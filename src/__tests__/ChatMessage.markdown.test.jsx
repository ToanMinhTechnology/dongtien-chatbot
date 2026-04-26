// Tests for ChatMessage markdown rendering paths
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from '../components/ChatMessage.jsx'

describe('ChatMessage — markdown rendering', () => {
  it('renders bold markdown as strong element', () => {
    const { container } = render(
      <ChatMessage chat={{ role: 'model', text: '**bold text**' }} />
    )
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong.textContent).toBe('bold text')
  })

  it('renders a markdown link', () => {
    const { container } = render(
      <ChatMessage chat={{ role: 'user', text: '[Vani](https://tiembanhvani.com)' }} />
    )
    const anchor = container.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor.getAttribute('href')).toBe('https://tiembanhvani.com')
  })

  it('renders a markdown unordered list with custom class', () => {
    const { container } = render(
      <ChatMessage chat={{ role: 'model', text: '- item 1\n- item 2' }} />
    )
    const ul = container.querySelector('ul.my-list')
    expect(ul).not.toBeNull()
    expect(ul.querySelectorAll('li').length).toBe(2)
  })

  it('renders multiline text correctly', () => {
    render(
      <ChatMessage chat={{ role: 'model', text: 'Line 1\n\nLine 2' }} />
    )
    expect(screen.getByText('Line 1')).toBeDefined()
    expect(screen.getByText('Line 2')).toBeDefined()
  })

  it('bot message includes ChatbotIcon (svg or img wrapper)', () => {
    const { container } = render(
      <ChatMessage chat={{ role: 'model', text: 'Hello' }} />
    )
    // ChatbotIcon renders inside bot-message — confirm the icon wrapper exists
    expect(container.querySelector('.bot-message')).not.toBeNull()
    // The outer div should have more than just the message-text div
    const botMsg = container.querySelector('.bot-message')
    expect(botMsg.children.length).toBeGreaterThanOrEqual(2)
  })

  it('user message does NOT include ChatbotIcon', () => {
    const { container } = render(
      <ChatMessage chat={{ role: 'user', text: 'Hey' }} />
    )
    const userMsg = container.querySelector('.user-message')
    // User messages only have the message-text div, not the icon
    expect(userMsg.children.length).toBe(1)
  })
})
