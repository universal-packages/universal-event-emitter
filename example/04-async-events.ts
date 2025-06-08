import { EventEmitter } from '../src/EventEmitter'

export async function asyncEventsExample() {
  console.log('⚡ Async Events Example')
  console.log('='.repeat(40))

  const emitter = new EventEmitter()

  // Add async listeners that take time to complete
  emitter.on('data:process', async (event) => {
    console.log(`🔄 Processing started for: ${event.payload?.id}`)
    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100))
    console.log(`✅ Processing completed for: ${event.payload?.id}`)
  })

  emitter.on('data:process', async (event) => {
    console.log(`📊 Analytics processing for: ${event.payload?.id}`)
    // Simulate different async work duration
    await new Promise((resolve) => setTimeout(resolve, 50))
    console.log(`📈 Analytics completed for: ${event.payload?.id}`)
  })

  emitter.on('data:process', async (event) => {
    console.log(`💾 Saving to database: ${event.payload?.id}`)
    // Simulate database save
    await new Promise((resolve) => setTimeout(resolve, 75))
    console.log(`💿 Database save completed for: ${event.payload?.id}`)
  })

  // Add a listener that might throw an error
  emitter.on('data:risky', async (event) => {
    console.log(`⚠️  Risky operation for: ${event.payload?.id}`)
    await new Promise((resolve) => setTimeout(resolve, 30))

    if (event.payload?.shouldFail) {
      throw new Error(`Simulated error for ${event.payload.id}`)
    }

    console.log(`✨ Risky operation succeeded for: ${event.payload?.id}`)
  })

  // Handle errors that occur in async listeners
  emitter.on('error', (event) => {
    console.log(`❌ Error caught: ${event.error?.message}`)
    console.log(`   Original event: ${event.event}`)
  })

  console.log('\n📡 Emitting async events:')

  // Sequential async emissions
  console.log('\n1️⃣ Sequential processing:')
  const start1 = Date.now()

  await emitter.emitAsync('data:process', {
    message: 'Processing item 1',
    payload: { id: 'item-1', data: 'some data' }
  })

  await emitter.emitAsync('data:process', {
    message: 'Processing item 2',
    payload: { id: 'item-2', data: 'more data' }
  })

  const duration1 = Date.now() - start1
  console.log(`⏱️  Sequential processing took: ${duration1}ms`)

  // Parallel async emissions using Promise.all
  console.log('\n2️⃣ Parallel processing:')
  const start2 = Date.now()

  await Promise.all([
    emitter.emitAsync('data:process', {
      message: 'Processing item 3',
      payload: { id: 'item-3', data: 'parallel data 1' }
    }),
    emitter.emitAsync('data:process', {
      message: 'Processing item 4',
      payload: { id: 'item-4', data: 'parallel data 2' }
    })
  ])

  const duration2 = Date.now() - start2
  console.log(`⏱️  Parallel processing took: ${duration2}ms`)

  // Demonstrate error handling in async events
  console.log('\n3️⃣ Error handling:')

  // This will succeed
  await emitter.emitAsync('data:risky', {
    message: 'Safe operation',
    payload: { id: 'safe-item', shouldFail: false }
  })

  // This will fail and trigger error event
  await emitter.emitAsync('data:risky', {
    message: 'Risky operation',
    payload: { id: 'risky-item', shouldFail: true }
  })

  console.log('\n💡 emitAsync waits for all listeners to complete!')
  console.log('💡 Errors in async listeners are caught and emit error events!')
  console.log()
}
