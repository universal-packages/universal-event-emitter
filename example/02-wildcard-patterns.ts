import { EventEmitter } from '../src/EventEmitter'

export function wildcardPatternsExample() {
  console.log('🌟 Wildcard Patterns Example')
  console.log('='.repeat(40))

  const emitter = new EventEmitter()

  // Listen to all user events
  emitter.on('user:*', (event) => {
    console.log(`👤 User event detected: ${event.event} - ${event.message}`)
  })

  // Listen to all order events
  emitter.on('order:*', (event) => {
    console.log(`🛒 Order event detected: ${event.event} - ${event.message}`)
  })

  // Listen to all events (catch-all)
  emitter.on('**', (event) => {
    console.log(`🌐 Global listener caught: ${event.event}`)
  })

  // Listen to any two-level event
  emitter.on('*:*', (event) => {
    console.log(`🔄 Two-level event: ${event.event}`)
  })

  // Emit various events to demonstrate pattern matching
  console.log('\n📡 Emitting user events:')
  emitter.emit('user:created', {
    message: 'New user registered',
    payload: { id: '123', name: 'Alice' }
  })

  emitter.emit('user:updated', {
    message: 'User profile updated',
    payload: { id: '123', field: 'email' }
  })

  emitter.emit('user:deleted', {
    message: 'User account deleted',
    payload: { id: '123' }
  })

  console.log('\n📡 Emitting order events:')
  emitter.emit('order:placed', {
    message: 'New order placed',
    payload: { orderId: 'ORD-001', amount: 99.99 }
  })

  emitter.emit('order:shipped', {
    message: 'Order has been shipped',
    payload: { orderId: 'ORD-001', trackingNumber: 'TRK123' }
  })

  console.log('\n📡 Emitting other events:')
  emitter.emit('system:startup', {
    message: 'System initialized',
    payload: { version: '1.0.0' }
  })

  emitter.emit('notification', {
    message: 'Single-level event',
    payload: { type: 'info' }
  })

  // Demonstrate wildcard emission
  console.log('\n🎯 Emitting to wildcard patterns:')
  emitter.emit('user:*', {
    message: 'Broadcasting to all user listeners',
    payload: { broadcast: true }
  })

  console.log()
}
