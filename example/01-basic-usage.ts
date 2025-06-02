/**
 * Basic Event Emitter Usage Example
 *
 * This example demonstrates the fundamental features of the Universal Event Emitter:
 * - Creating an event emitter
 * - Adding listeners
 * - Emitting events
 * - Using wildcards
 * - Working with multiple event names
 */
import { EventEmitter } from '../src'

export function basicUsage() {
  console.log('🚀 Basic Event Emitter Usage Example\n')

  // Create a new event emitter
  const emitter = new EventEmitter()

  // Add basic listeners
  emitter.on('welcome', (event) => {
    console.log('📢 Welcome event received:', event?.message)
  })

  emitter.on('user:login', (event) => {
    console.log('👤 User logged in:', event?.payload)
  })

  emitter.on('user:logout', (event) => {
    console.log('👋 User logged out:', event?.payload)
  })

  // Listen to all user events using wildcards
  emitter.on('user:*', (event) => {
    console.log('🔍 Wildcard listener - Any user event:', event?.event, event?.payload)
  })

  // Listen to ALL events
  emitter.on('*', (event) => {
    console.log('🌍 Global listener - Event fired:', event?.event)
  })

  // Multiple event names in a single listener
  emitter.on(['task:start', 'task:complete'], (event) => {
    console.log('📋 Task event:', event?.event, '-', event?.message)
  })

  console.log('Adding listeners...\n')

  // Emit some events
  console.log('Emitting events:\n')

  emitter.emit('welcome', {
    message: 'Hello from the event emitter!'
  })

  emitter.emit('user:login', {
    payload: { userId: '123', username: 'alice' },
    message: 'User successfully logged in'
  })

  emitter.emit('user:logout', {
    payload: { userId: '123', username: 'alice' },
    message: 'User logged out'
  })

  emitter.emit('task:start', {
    message: 'Task processing started'
  })

  emitter.emit('task:complete', {
    message: 'Task completed successfully'
  })

  // Emit to multiple events at once using wildcards
  emitter.emit('user:*', {
    message: 'Broadcasting to all user event listeners'
  })

  console.log('\n✅ Basic usage example completed!')
}
