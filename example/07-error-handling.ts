import { EventEmitter } from '../src/EventEmitter'

export async function errorHandlingExample() {
  console.log('🚨 Error Handling Example')
  console.log('='.repeat(40))

  console.log('\n1️⃣ Error handling with ignoreErrors: true (default):')

  const safeEmitter = new EventEmitter({ ignoreErrors: true })

  // Add an error listener
  safeEmitter.on('error', (event) => {
    console.log(`🛡️  Error caught safely: ${event.error?.message}`)
    console.log(`   Original event: ${event.event}`)
    console.log(`   Original payload:`, event.payload)
  })

  // Add a listener that throws an error
  safeEmitter.on('risky:operation', (event) => {
    console.log(`⚡ Processing risky operation: ${event.payload?.id}`)

    if (event.payload?.shouldFail) {
      throw new Error(`Operation failed for ${event.payload.id}`)
    }

    console.log(`✅ Operation succeeded for: ${event.payload?.id}`)
  })

  // Add another listener to the same event
  safeEmitter.on('risky:operation', (event) => {
    console.log(`📊 Analytics listener for: ${event.payload?.id}`)
  })

  console.log('\n📡 Emitting events that will cause errors:')

  // This will succeed
  safeEmitter.emit('risky:operation', {
    message: 'Safe operation',
    payload: { id: 'safe-op-1', shouldFail: false }
  })

  // This will fail but be handled gracefully
  safeEmitter.emit('risky:operation', {
    message: 'Failing operation',
    payload: { id: 'fail-op-1', shouldFail: true }
  })

  // This will succeed again
  safeEmitter.emit('risky:operation', {
    message: 'Another safe operation',
    payload: { id: 'safe-op-2', shouldFail: false }
  })

  console.log('\n2️⃣ Error handling with ignoreErrors: false:')

  const strictEmitter = new EventEmitter({ ignoreErrors: false })

  // Add error listener for strict emitter
  strictEmitter.on('error', (event) => {
    console.log(`🔥 Error in strict mode: ${event.error?.message}`)
  })

  // Add a failing listener
  strictEmitter.on('strict:operation', (event) => {
    console.log(`⚡ Strict operation for: ${event.payload?.id}`)
    throw new Error(`Strict operation failed for ${event.payload?.id}`)
  })

  console.log('\n📡 Testing strict error handling:')
  console.log('   (This will be handled by error listener)')

  // This will trigger error event and be handled
  strictEmitter.emit('strict:operation', {
    message: 'This will fail in strict mode',
    payload: { id: 'strict-op-1' }
  })

  console.log('\n3️⃣ Error handling without error listeners:')

  const noErrorListenerEmitter = new EventEmitter({ ignoreErrors: false })

  noErrorListenerEmitter.on('dangerous:operation', (event) => {
    console.log(`💥 This will throw an unhandled error`)
    throw new Error('Unhandled error - no error listener!')
  })

  console.log('   📡 Attempting operation without error listener (will catch):')

  try {
    noErrorListenerEmitter.emit('dangerous:operation', {
      message: 'This should throw',
      payload: { id: 'dangerous-op-1' }
    })
  } catch (error) {
    console.log(`🚫 Caught unhandled error: ${(error as Error).message}`)
  }

  console.log('\n4️⃣ Error propagation in async events:')

  const asyncEmitter = new EventEmitter({ ignoreErrors: true })

  asyncEmitter.on('error', (event) => {
    console.log(`⚡ Async error caught: ${event.error?.message}`)
    console.log(`   Event context: ${event.event}`)
  })

  asyncEmitter.on('async:task', async (event) => {
    console.log(`🔄 Starting async task: ${event.payload?.id}`)

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (event.payload?.shouldFail) {
      throw new Error(`Async task failed for ${event.payload.id}`)
    }

    console.log(`✅ Async task completed: ${event.payload?.id}`)
  })

  // Successful async operation
  await asyncEmitter.emitAsync('async:task', {
    message: 'Async operation',
    payload: { id: 'async-op-1', shouldFail: false }
  })

  // Failing async operation
  await asyncEmitter.emitAsync('async:task', {
    message: 'Failing async operation',
    payload: { id: 'async-op-2', shouldFail: true }
  })

  console.log('\n5️⃣ Complex error scenarios with multiple listeners:')

  const complexEmitter = new EventEmitter({ ignoreErrors: true })

  complexEmitter.on('error', (event) => {
    console.log(`🔧 Complex error handler: ${event.error?.message}`)
  })

  // First listener - will succeed
  complexEmitter.on('complex:event', (event) => {
    console.log(`✅ Listener 1 (success): Processing ${event.payload?.id}`)
  })

  // Second listener - will fail
  complexEmitter.on('complex:event', (event) => {
    console.log(`❌ Listener 2 (will fail): Processing ${event.payload?.id}`)
    throw new Error(`Listener 2 failed for ${event.payload?.id}`)
  })

  // Third listener - will succeed despite previous failure
  complexEmitter.on('complex:event', (event) => {
    console.log(`✅ Listener 3 (success): Processing ${event.payload?.id}`)
  })

  console.log('\n📡 Emitting to multiple listeners (some fail):')

  complexEmitter.emit('complex:event', {
    message: 'Complex multi-listener event',
    payload: { id: 'complex-op-1' }
  })

  console.log('\n6️⃣ Custom error handling with additional context:')

  const contextEmitter = new EventEmitter({ ignoreErrors: true })

  contextEmitter.on('error', (event) => {
    console.log(`🔍 Error with context:`)
    console.log(`   Error: ${event.error?.message}`)
    console.log(`   Event: ${event.event}`)
    console.log(`   Message: ${event.message}`)
    console.log(`   Payload:`, event.payload)
    console.log(`   Error occurred at:`, new Date().toISOString())
  })

  contextEmitter.on('context:operation', (event) => {
    console.log(`🔄 Context operation: ${event.payload?.operation}`)

    // Simulate different types of errors
    const errorTypes = ['validation', 'network', 'permission', 'timeout']
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]

    throw new Error(`${errorType.toUpperCase()}_ERROR: Context operation failed`)
  })

  console.log('\n📡 Emitting events with rich error context:')

  for (let i = 1; i <= 3; i++) {
    contextEmitter.emit('context:operation', {
      message: `Context operation ${i}`,
      payload: {
        operation: `operation-${i}`,
        userId: `user-${i}`,
        timestamp: Date.now()
      }
    })
  }

  console.log('\n💡 Always add error listeners to handle failures gracefully!')
  console.log('💡 Use ignoreErrors: false for strict error handling!')
  console.log('💡 Error events contain rich context for debugging!')
  console.log()
}
