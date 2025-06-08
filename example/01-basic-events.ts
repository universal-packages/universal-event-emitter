import { EventEmitter } from '../src/EventEmitter'

export function basicEventsExample() {
  console.log('🔥 Basic Events Example')
  console.log('='.repeat(40))

  const emitter = new EventEmitter()

  // Add a basic listener
  emitter.on('greeting', (event) => {
    console.log(`📢 Received: ${event.message}`)
    console.log(`📦 Payload:`, event.payload)
  })

  // Add multiple listeners to the same event
  emitter.on('greeting', (event) => {
    console.log(`🎉 Another listener heard: ${event.message}`)
  })

  // Emit some events
  emitter.emit('greeting', {
    message: 'Hello, World!',
    payload: { from: 'Basic Example', timestamp: new Date().toISOString() }
  })

  emitter.emit('greeting', {
    message: 'Welcome to EventEmitter!',
    payload: { users: ['Alice', 'Bob', 'Charlie'] }
  })

  // Demonstrate once listener
  emitter.once('farewell', (event) => {
    console.log(`👋 One-time listener: ${event.message}`)
  })

  // This will trigger the once listener
  emitter.emit('farewell', { message: 'Goodbye for now!' })

  // This won't trigger the once listener (already removed)
  emitter.emit('farewell', { message: "This won't be heard by the once listener" })

  console.log(`📊 Event names: ${emitter.eventNames.join(', ')}`)
  console.log(`👥 Listener count: ${emitter.listenerCount}`)
  console.log()
}
