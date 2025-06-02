/**
 * TypeScript Type-Safe Events Example
 *
 * This example demonstrates how to use the Event Emitter with full TypeScript support:
 * - Defining event maps for type safety
 * - Using typed event emitters
 * - Autocompletion for event names
 * - Type-checked payloads
 * - Mixed typed and dynamic events
 */
import { EventEmitter } from '../src'

export function typescriptTypedEvents() {
  console.log('🎯 TypeScript Type-Safe Events Example\n')

  // Define your event map with event names and their payload types
  interface AppEvents {
    'user:created': { id: string; name: string; email: string }
    'user:updated': { id: string; changes: Partial<{ name: string; email: string }> }
    'user:deleted': { id: string }
    'task:assigned': { taskId: string; userId: string; priority: 'low' | 'medium' | 'high' }
    'task:completed': { taskId: string; completedBy: string; completionTime: Date }
    'system:startup': { version: string; environment: 'development' | 'production' }
    'metrics:updated': { cpu: number; memory: number; timestamp: Date }
  }

  // Create a typed event emitter
  const typedEmitter = new EventEmitter<AppEvents>()

  console.log('Creating typed event listeners...\n')

  // TypeScript provides autocompletion for event names and type checking for payloads
  typedEmitter.on('user:created', (event) => {
    // event.payload is automatically typed as { id: string; name: string; email: string }
    console.log('✨ User created:', {
      id: event.payload.id,
      name: event.payload.name,
      email: event.payload.email
    })
  })

  typedEmitter.on('user:updated', (event) => {
    // event.payload is typed as { id: string; changes: Partial<...> }
    console.log('📝 User updated:', event.payload.id, 'changes:', event.payload.changes)
  })

  typedEmitter.on('task:assigned', (event) => {
    // Full type safety including union types for priority
    console.log(`📋 Task ${event.payload.taskId} assigned to user ${event.payload.userId} with ${event.payload.priority} priority`)
  })

  typedEmitter.on('task:completed', (event) => {
    const payload = event.payload
    if (payload) {
      console.log(`✅ Task ${payload.taskId} completed by ${payload.completedBy} at ${payload.completionTime.toISOString()}`)
    }
  })

  // Wildcard listeners still work with typed emitters
  typedEmitter.on('user:*', (event) => {
    console.log('🔍 User event wildcard:', event.event)
  })

  // Listen to multiple typed events
  typedEmitter.on(['system:startup', 'metrics:updated'], (event) => {
    console.log('🖥️ System event:', event.event, event.payload)
  })

  console.log('Emitting typed events...\n')

  // Emit events with full type checking
  typedEmitter.emit('user:created', {
    payload: {
      id: 'usr_123',
      name: 'Alice Johnson',
      email: 'alice@example.com'
    },
    message: 'New user account created'
  })

  typedEmitter.emit('user:updated', {
    payload: {
      id: 'usr_123',
      changes: { email: 'alice.johnson@example.com' }
    },
    message: 'User email updated'
  })

  typedEmitter.emit('task:assigned', {
    payload: {
      taskId: 'task_456',
      userId: 'usr_123',
      priority: 'high'
    }
  })

  typedEmitter.emit('task:completed', {
    payload: {
      taskId: 'task_456',
      completedBy: 'usr_123',
      completionTime: new Date()
    }
  })

  typedEmitter.emit('system:startup', {
    payload: {
      version: '1.2.3',
      environment: 'production'
    },
    message: 'Application started successfully'
  })

  // Example of extending the EventEmitter with custom methods
  interface UserServiceEvents {
    created: { user: { id: string; name: string } }
    updated: { user: { id: string }; changes: object }
    deleted: { userId: string }
  }

  class UserService extends EventEmitter<UserServiceEvents> {
    private users: Map<string, { id: string; name: string }> = new Map()

    createUser(name: string): string {
      const user = { id: Math.random().toString(36).substring(2), name }
      this.users.set(user.id, user)

      // Emit with full type safety
      this.emit('created', {
        payload: { user },
        message: `User ${name} created successfully`
      })

      return user.id
    }

    updateUser(id: string, changes: Partial<{ name: string }>): boolean {
      const user = this.users.get(id)
      if (!user) return false

      Object.assign(user, changes)
      this.emit('updated', {
        payload: { user: { id }, changes },
        message: `User ${id} updated`
      })

      return true
    }

    deleteUser(id: string): boolean {
      if (this.users.delete(id)) {
        this.emit('deleted', {
          payload: { userId: id },
          message: `User ${id} deleted`
        })
        return true
      }
      return false
    }
  }

  console.log('\nTesting custom typed EventEmitter class...\n')

  const userService = new UserService()

  userService.on('created', (event) => {
    // Fully typed payload
    console.log('👤 User service - Created:', event.payload.user.name)
  })

  userService.on('updated', (event) => {
    console.log('📝 User service - Updated:', event.payload.user.id, event.payload.changes)
  })

  userService.on('deleted', (event) => {
    console.log('🗑️ User service - Deleted:', event.payload.userId)
  })

  // Use the service
  const userId = userService.createUser('Bob Smith')
  userService.updateUser(userId, { name: 'Robert Smith' })
  userService.deleteUser(userId)

  // Example of mixing typed and dynamic events
  console.log('\nMixing typed and dynamic events...\n')

  // You can still use dynamic events when needed
  typedEmitter.on('custom:dynamic', (event) => {
    console.log('🔧 Dynamic event:', event.payload)
  })

  // This works but you need to cast the emitter to bypass strict typing
  const dynamicEmitter = typedEmitter as EventEmitter<any>
  dynamicEmitter.emit('custom:dynamic', {
    payload: { data: 'This is a dynamic event' }
  })

  console.log('\n✅ TypeScript typed events example completed!')
}
