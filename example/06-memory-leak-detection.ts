import { EventEmitter } from '../src/EventEmitter'

export async function memoryLeakDetectionExample() {
  console.log('🧠 Memory Leak Detection Example')
  console.log('='.repeat(40))

  // Create an emitter with custom memory leak settings
  const emitter = new EventEmitter({
    maxListeners: 5, // Lower threshold for demonstration
    verboseMemoryLeak: true
  })

  // Listen for memory leak warnings
  emitter.on('emitter-memory-leak', (event) => {
    console.log(`⚠️  MEMORY LEAK WARNING: ${event.message}`)
    console.log(`   Event: ${event.payload?.eventName}`)
    console.log(`   Listeners: ${event.payload?.listenerCount}`)
    console.log(`   Max allowed: ${event.payload?.maxListeners}`)
  })

  // Listen for new listener events
  emitter.on('emitter-new-listener', (event) => {
    console.log(`➕ New listener added: ${event.message}`)
  })

  console.log('\n📊 Current emitter stats:')
  console.log(`   Max listeners: ${emitter.maxListeners}`)
  console.log(`   Current listener count: ${emitter.listenerCount}`)
  console.log(`   Event names: [${emitter.eventNames.join(', ')}]`)

  console.log('\n1️⃣ Adding listeners within limit:')

  // Add listeners within the limit
  for (let i = 1; i <= 3; i++) {
    emitter.on('safe:event', (event) => {
      console.log(`   Listener ${i}: Received ${event.message}`)
    })
    console.log(`✅ Added listener ${i}/5`)
  }

  console.log(`\n📈 Stats after adding 3 listeners:`)
  console.log(`   Listener count: ${emitter.listenerCount}`)
  console.log(`   Has listeners for 'safe:event': ${emitter.hasListeners('safe:event')}`)

  // Test the safe event
  console.log('\n📡 Testing safe event:')
  emitter.emit('safe:event', { message: 'Hello from safe event!' })

  console.log('\n2️⃣ Adding listeners to trigger memory leak warning:')

  // Add more listeners to trigger the warning
  for (let i = 4; i <= 7; i++) {
    emitter.on('risky:event', (event) => {
      console.log(`   Risky listener ${i}: ${event.message}`)
    })
    console.log(`⚡ Added risky listener ${i}/5`)
  }

  console.log('\n3️⃣ Demonstrating listener removal:')

  // Create some listeners we can remove
  const removableListener1 = (event: any) => {
    console.log(`🗑️  Removable listener 1: ${event.message}`)
  }

  const removableListener2 = (event: any) => {
    console.log(`🗑️  Removable listener 2: ${event.message}`)
  }

  emitter.on('cleanup:test', removableListener1)
  emitter.on('cleanup:test', removableListener2)

  console.log(`📊 Listeners before cleanup: ${emitter.listenerCount}`)

  // Test before removal
  console.log('\n📡 Testing before removal:')
  emitter.emit('cleanup:test', { message: 'Before cleanup' })

  // Remove specific listeners
  console.log('\n🧹 Removing specific listeners:')
  emitter.removeListener('cleanup:test', removableListener1)
  console.log('   Removed listener 1')

  emitter.emit('cleanup:test', { message: 'After removing listener 1' })

  emitter.removeListener('cleanup:test', removableListener2)
  console.log('   Removed listener 2')

  emitter.emit('cleanup:test', { message: 'After removing all listeners' })

  console.log('\n4️⃣ Bulk listener management:')

  // Add multiple listeners to different events
  emitter.on('bulk:test1', () => console.log('   Bulk listener 1'))
  emitter.on('bulk:test1', () => console.log('   Bulk listener 2'))
  emitter.on('bulk:test2', () => console.log('   Bulk listener 3'))
  emitter.on('bulk:test2', () => console.log('   Bulk listener 4'))

  console.log(`📊 Total listeners: ${emitter.listenerCount}`)
  console.log(`📊 Event names: [${emitter.eventNames.join(', ')}]`)

  // Test bulk removal
  console.log('\n📡 Testing before bulk removal:')
  emitter.emit('bulk:test1', { message: 'Test 1' })
  emitter.emit('bulk:test2', { message: 'Test 2' })

  console.log('\n🧹 Removing all listeners for bulk:test1:')
  emitter.removeAllListeners('bulk:test1')

  console.log('📡 Testing after bulk removal:')
  emitter.emit('bulk:test1', { message: 'Should not be heard' })
  emitter.emit('bulk:test2', { message: 'Should still be heard' })

  console.log('\n5️⃣ Dynamic max listeners adjustment:')

  const originalMax = emitter.maxListeners
  console.log(`📊 Original max listeners: ${originalMax}`)

  // Increase the limit
  emitter.maxListeners = 10
  console.log(`📊 New max listeners: ${emitter.maxListeners}`)

  // Add more listeners without warning
  console.log('\n➕ Adding more listeners with increased limit:')
  for (let i = 1; i <= 3; i++) {
    emitter.on('increased:limit', () => {
      console.log(`   High limit listener ${i}`)
    })
  }

  console.log(`📊 Final listener count: ${emitter.listenerCount}`)
  console.log(`📊 Final event names: [${emitter.eventNames.join(', ')}]`)

  // Test hasListeners method
  console.log('\n6️⃣ Checking listener existence:')
  console.log(`   Has listeners for 'increased:limit': ${emitter.hasListeners('increased:limit')}`)
  console.log(`   Has listeners for 'nonexistent:event': ${emitter.hasListeners('nonexistent:event')}`)
  console.log(`   Has any listeners: ${emitter.hasListeners()}`)

  console.log('\n💡 Monitor memory leaks to prevent performance issues!')
  console.log('💡 Use removeListener() and removeAllListeners() for cleanup!')
  console.log('💡 Adjust maxListeners based on your application needs!')
  console.log()
}
