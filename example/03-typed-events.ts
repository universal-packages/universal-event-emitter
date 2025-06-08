import { EventEmitter } from '../src/EventEmitter'

// Define a strongly typed event map
interface UserEvents {
  'user:created': { id: string; name: string; email: string }
  'user:updated': { id: string; changes: Record<string, any> }
  'user:deleted': { id: string; reason: string }
  notification: string
  'status:changed': { from: string; to: string; timestamp: number }
}

export async function typedEventsExample() {
  console.log('🔒 Typed Events Example')
  console.log('='.repeat(40))

  // Create a typed event emitter
  const emitter = new EventEmitter<UserEvents>()

  // TypeScript provides autocompletion and type checking for event names
  emitter.on('user:created', (event) => {
    // event.payload is automatically typed as { id: string; name: string; email: string }
    console.log(`✅ User created: ${event.payload?.name} (${event.payload?.email})`)
    console.log(`   ID: ${event.payload?.id}`)
  })

  emitter.on('user:updated', (event) => {
    // event.payload is automatically typed as { id: string; changes: Record<string, any> }
    console.log(`📝 User ${event.payload?.id} updated:`)
    console.log(`   Changes:`, event.payload?.changes)
  })

  emitter.on('user:deleted', (event) => {
    // event.payload is automatically typed as { id: string; reason: string }
    console.log(`❌ User ${event.payload?.id} deleted`)
    console.log(`   Reason: ${event.payload?.reason}`)
  })

  emitter.on('notification', (event) => {
    // event.payload is automatically typed as string
    console.log(`📬 Notification: ${event.payload}`)
  })

  emitter.on('status:changed', (event) => {
    // event.payload is automatically typed as { from: string; to: string; timestamp: number }
    const date = new Date(event.payload?.timestamp || 0)
    console.log(`🔄 Status changed from "${event.payload?.from}" to "${event.payload?.to}" at ${date.toLocaleTimeString()}`)
  })

  // Emit events with full type safety
  console.log('\n📡 Emitting typed events:')

  emitter.emit('user:created', {
    message: 'New user registered',
    payload: {
      id: 'user-123',
      name: 'Alice Johnson',
      email: 'alice@example.com'
    }
  })

  emitter.emit('user:updated', {
    message: 'User profile updated',
    payload: {
      id: 'user-123',
      changes: {
        email: 'alice.johnson@example.com',
        lastLogin: new Date().toISOString()
      }
    }
  })

  emitter.emit('notification', {
    message: 'System notification',
    payload: 'Your profile has been updated successfully!'
  })

  emitter.emit('status:changed', {
    message: 'User status updated',
    payload: {
      from: 'offline',
      to: 'online',
      timestamp: Date.now()
    }
  })

  emitter.emit('user:deleted', {
    message: 'User account deleted',
    payload: {
      id: 'user-123',
      reason: 'Account closure requested by user'
    }
  })

  // Demonstrate type safety - these would cause TypeScript errors if uncommented:
  // emitter.emit('user:created', { payload: { id: 123 } }) // Error: id should be string
  // emitter.emit('nonexistent:event', { payload: {} }) // Error: event not in interface

  console.log('\n💡 Type safety ensures payload structure matches event definitions!')
  console.log()
}
