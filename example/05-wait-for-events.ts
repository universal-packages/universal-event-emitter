import { EventEmitter } from '../src/EventEmitter'

export async function waitForEventsExample() {
  console.log('⏳ Wait For Events Example')
  console.log('='.repeat(40))

  const emitter = new EventEmitter()

  // Example 1: Basic waitFor usage
  console.log('\n1️⃣ Basic waitFor:')

  // Set up a promise to wait for an event
  const waitPromise = emitter.waitFor('task:completed')
  console.log('🔍 Waiting for task:completed event...')

  // Simulate some work then emit the event
  setTimeout(() => {
    emitter.emit('task:completed', {
      message: 'Task finished successfully',
      payload: { taskId: 'task-123', result: 'success' }
    })
  }, 1000)

  // Wait for the event
  const completedEvent = await waitPromise
  console.log(`✅ Received event: ${completedEvent.message}`)
  console.log(`📦 Payload:`, completedEvent.payload)

  // Example 2: waitFor with timeout and cancellation
  console.log('\n2️⃣ WaitFor with cancellation:')

  const cancelablePromise = emitter.waitFor('user:login')
  console.log('🔍 Waiting for user:login event (will be cancelled)...')

  // Cancel the wait after 500ms
  setTimeout(() => {
    console.log('❌ Cancelling wait operation')
    cancelablePromise.cancel('Wait operation timed out')
  }, 500)

  try {
    await cancelablePromise
    console.log('This should not be reached')
  } catch (error) {
    console.log(`🚫 Wait cancelled: ${(error as Error).message}`)
  }

  // Example 3: Multiple concurrent waits
  console.log('\n3️⃣ Multiple concurrent waits:')

  const promises = [emitter.waitFor('process:step1'), emitter.waitFor('process:step2'), emitter.waitFor('process:step3')]

  console.log('🔍 Waiting for multiple process steps...')

  // Emit events in sequence with delays
  setTimeout(() => {
    console.log('📤 Emitting process:step1')
    emitter.emit('process:step1', {
      message: 'Step 1 completed',
      payload: { step: 1, data: 'First step data' }
    })
  }, 300)

  setTimeout(() => {
    console.log('📤 Emitting process:step2')
    emitter.emit('process:step2', {
      message: 'Step 2 completed',
      payload: { step: 2, data: 'Second step data' }
    })
  }, 600)

  setTimeout(() => {
    console.log('📤 Emitting process:step3')
    emitter.emit('process:step3', {
      message: 'Step 3 completed',
      payload: { step: 3, data: 'Third step data' }
    })
  }, 900)

  // Wait for all steps to complete
  const results = await Promise.all(promises)
  console.log('🎉 All process steps completed:')
  results.forEach((result, index) => {
    console.log(`   Step ${index + 1}: ${result.message}`)
  })

  // Example 4: Race condition with waitFor
  console.log('\n4️⃣ Race condition example:')

  const racePromises = [emitter.waitFor('race:winner'), emitter.waitFor('race:timeout')]

  console.log('🏁 Starting race between winner and timeout...')

  // Emit winner or timeout randomly
  const winnerDelay = Math.random() * 1000
  const timeoutDelay = 800

  setTimeout(() => {
    console.log('🏆 Winner crossed the finish line!')
    emitter.emit('race:winner', {
      message: 'Race won!',
      payload: { time: winnerDelay, position: 1 }
    })
  }, winnerDelay)

  setTimeout(() => {
    console.log('⏰ Race timeout occurred!')
    emitter.emit('race:timeout', {
      message: 'Race timed out',
      payload: { reason: 'timeout' }
    })
  }, timeoutDelay)

  // Wait for whichever happens first
  const raceResult = await Promise.race(racePromises)
  console.log(`🏁 Race result: ${raceResult.message}`)

  // Example 5: waitFor with complex event patterns
  console.log('\n5️⃣ WaitFor with wildcards:')

  const wildcardWait = emitter.waitFor('notification:*')
  console.log('🔍 Waiting for any notification event...')

  setTimeout(() => {
    const notificationType = ['info', 'warning', 'error'][Math.floor(Math.random() * 3)]
    console.log(`📤 Emitting notification:${notificationType}`)
    emitter.emit(`notification:${notificationType}`, {
      message: `A ${notificationType} notification occurred`,
      payload: { type: notificationType, timestamp: Date.now() }
    })
  }, 500)

  const notificationEvent = await wildcardWait
  console.log(`📬 Received notification: ${notificationEvent.event} - ${notificationEvent.message}`)

  console.log('\n💡 waitFor is perfect for implementing async workflows!')
  console.log('💡 Use cancellation to implement timeouts and cleanup!')
  console.log()
}
