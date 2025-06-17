import { EventEmitter } from './EventEmitter'
import { assert, assertEquals, runTest } from './utils.test'

export async function eventEmitterTest() {
  console.log('🧪 Running EventEmitter Tests')
  console.log('='.repeat(50))

  // Basic functionality tests
  await runTest('Basic event emission and listening', async () => {
    const emitter = new EventEmitter()
    let receivedEvent: any = null

    emitter.on('test', (event) => {
      receivedEvent = event
    })

    const result = emitter.emit('test', { payload: { foo: 'bar' } })

    assert(result === true, 'emit should return true when listeners exist')
    assert(receivedEvent !== null, 'listener should receive event')
    assertEquals(receivedEvent.event, 'test', 'event name should match')
    assertEquals(receivedEvent.payload.foo, 'bar', 'payload should match')
  })

  await runTest('No listeners emit returns false', async () => {
    const emitter = new EventEmitter()
    const result = emitter.emit('nonexistent', {})
    assert(result === false, 'emit should return false when no listeners exist')
  })

  // Wildcard tests
  await runTest('Wildcard * matches all events', async () => {
    const emitter = new EventEmitter({ newListenerEvent: false })
    let callCount = 0

    emitter.on('**', () => {
      callCount++
    })

    const result1 = emitter.emit('test1', {})
    const result2 = emitter.emit('test2', {})
    const result3 = emitter.emit('user:created', {})

    assertEquals(callCount, 3, 'wildcard should match all events')
    assertEquals(result1, true, 'test1 should return true')
    assertEquals(result2, true, 'test2 should return true')
    assertEquals(result3, true, 'user:created should return true')
  })

  await runTest('Pattern wildcards work correctly', async () => {
    const emitter = new EventEmitter()
    let userCallCount = 0
    let adminCallCount = 0

    emitter.on('user:*', () => {
      userCallCount++
    })
    emitter.on('admin:*', () => {
      adminCallCount++
    })

    emitter.emit('user:created', {})
    emitter.emit('user:updated', {})
    emitter.emit('admin:login', {})
    emitter.emit('other:event', {})

    assertEquals(userCallCount, 2, 'user:* should match user events')
    assertEquals(adminCallCount, 1, 'admin:* should match admin events')
  })

  // Multiple event names
  await runTest('Multiple event names as array', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.addListener(['event1', 'event2'], () => {
      callCount++
    })

    emitter.emit('event1', {})
    emitter.emit('event2', {})
    emitter.emit('event3', {})

    assertEquals(callCount, 2, 'should listen to multiple events')
  })

  await runTest('Emit to multiple event names', async () => {
    const emitter = new EventEmitter()
    let event1Count = 0
    let event2Count = 0

    emitter.on('event1', () => {
      event1Count++
    })
    emitter.on('event2', () => {
      event2Count++
    })

    const result1 = emitter.emit('event1', { payload: 'hello' })
    const result2 = emitter.emit('event2', { payload: 42 })
    const result = result1 && result2

    assert(result === true, 'emit to multiple events should return true')
    assertEquals(event1Count, 1, 'event1 should be emitted')
    assertEquals(event2Count, 1, 'event2 should be emitted')
  })

  await runTest('Emit with array of event names', async () => {
    const emitter = new EventEmitter()
    let event1Count = 0
    let event2Count = 0
    let event3Count = 0

    emitter.on('event1', () => {
      event1Count++
    })
    emitter.on('event2', () => {
      event2Count++
    })
    emitter.on('event3', () => {
      event3Count++
    })

    // Test emitting to multiple events with an array
    const result = emitter.emit(['event1', 'event2'], { payload: 'array-emit' })

    assert(result === true, 'emit with array should return true when any listener exists')
    assertEquals(event1Count, 1, 'event1 should be emitted')
    assertEquals(event2Count, 1, 'event2 should be emitted')
    assertEquals(event3Count, 0, 'event3 should not be emitted')

    // Test emitting to array with no listeners
    const noListenersResult = emitter.emit(['nonexistent1', 'nonexistent2'], {})
    assert(noListenersResult === false, 'emit with array should return false when no listeners exist')

    // Test emitting to array with partial listeners
    const partialResult = emitter.emit(['event1', 'nonexistent'], {})
    assert(partialResult === true, 'emit with array should return true when at least one listener exists')
    assertEquals(event1Count, 2, 'event1 should be emitted again')
  })

  // Once listeners
  await runTest('Once listeners are called only once', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.once('test', () => {
      callCount++
    })

    emitter.emit('test', {})
    emitter.emit('test', {})
    emitter.emit('test', {})

    assertEquals(callCount, 1, 'once listener should be called only once')
  })

  // Prepend listeners
  await runTest('Prepend listeners are called first', async () => {
    const emitter = new EventEmitter()
    const callOrder: string[] = []

    emitter.on('test', () => {
      callOrder.push('normal')
    })
    emitter.prependListener(['test', 'test2'], () => {
      callOrder.push('prepend')
    })

    emitter.emit('test', {})

    assertEquals(callOrder[0], 'prepend', 'prepend listener should be called first')
    assertEquals(callOrder[1], 'normal', 'normal listener should be called second')
  })

  await runTest('Prepend once listeners work correctly', async () => {
    const emitter = new EventEmitter()
    const callOrder: string[] = []
    let prependCallCount = 0

    emitter.on('test', () => {
      callOrder.push('normal')
    })
    emitter.prependOnceListener('test', () => {
      callOrder.push('prepend-once')
      prependCallCount++
    })

    emitter.prependOnceListener(['test2', 'test3'], () => {
      callOrder.push('prepend-once')
      prependCallCount++
    })

    emitter.emit('test', {})
    emitter.emit('test', {})

    assertEquals(prependCallCount, 1, 'prepend once should be called only once')
    assertEquals(callOrder[0], 'prepend-once', 'prepend once should be called first')
  })

  // Async emission
  await runTest('Async emission waits for promises', async () => {
    const emitter = new EventEmitter()
    let resolved: boolean = false

    emitter.on('test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      resolved = true
    })

    const result = await emitter.emitAsync('test', {})

    assert((resolved as boolean) === true, 'async listener should complete')
    assert(result === true, 'emitAsync should return true')
  })

  // Listener removal
  await runTest('Remove specific listener', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    const listener = () => {
      callCount++
    }
    emitter.on('test', listener)
    emitter.on('test', () => {
      callCount++
    })

    emitter.emit('test', {})
    assertEquals(callCount, 2, 'both listeners should be called initially')

    emitter.removeListener('test', listener)
    emitter.emit('test', {})
    assertEquals(callCount, 3, 'only remaining listener should be called')
  })

  await runTest('Remove all listeners', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.on('test', () => {
      callCount++
    })
    emitter.on('test', () => {
      callCount++
    })

    emitter.removeAllListeners('test')
    emitter.emit('test', {})

    assertEquals(callCount, 0, 'no listeners should be called after removeAll')
  })

  await runTest('Remove all listeners with no event name', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.on('test1', () => {
      callCount++
    })
    emitter.on('test2', () => {
      callCount++
    })

    emitter.removeAllListeners()
    emitter.emit('test1', {})
    emitter.emit('test2', {})

    assertEquals(callCount, 0, 'no listeners should remain')
  })

  // off method (alias for removeListener)
  await runTest('off method works as alias', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    const listener = () => {
      callCount++
    }
    emitter.on('test', listener)
    emitter.off('test', listener)
    emitter.emit('test', {})

    assertEquals(callCount, 0, 'off should remove listener')
  })

  // waitFor functionality
  await runTest('waitFor resolves when event is emitted', async () => {
    const emitter = new EventEmitter()

    const promise = emitter.waitFor('test')

    setTimeout(() => {
      emitter.emit('test', { payload: { data: 'test' } })
    }, 10)

    const event = await promise
    assertEquals(event.event, 'test', 'waitFor should resolve with correct event')
    assert(event.payload && event.payload.data === 'test', 'waitFor should include payload')
  })

  await runTest('waitFor can be cancelled', async () => {
    const emitter = new EventEmitter()

    const promise = emitter.waitFor('test')

    try {
      promise.cancel('Test cancelled')
      await promise
      assert(false, 'should have thrown error')
    } catch (error: any) {
      assert(error.message === 'Test cancelled', 'should throw cancellation error')
    }
  })

  // hasListeners method
  await runTest('hasListeners works correctly', async () => {
    const emitter = new EventEmitter()

    assert(emitter.hasListeners() === false, 'should have no listeners initially')
    assert(emitter.hasListeners('test') === false, 'should have no listeners for test event')

    emitter.on('test', () => {})

    assert(emitter.hasListeners() === true, 'should have listeners')
    assert(emitter.hasListeners('test') === true, 'should have listeners for test event')
    assert(emitter.hasListeners('other') === false, 'should not have listeners for other event')
    assert(emitter.hasListeners(['test', 'other']) === false, 'should not have listeners for multiple events')
  })

  await runTest('hasListeners with wildcards', async () => {
    const emitter = new EventEmitter()

    emitter.on('user:*', () => {})

    assertEquals(emitter.hasListeners('user:*'), true, 'should match wildcard pattern')
    assertEquals(emitter.hasListeners('admin:*'), false, 'should not match different pattern')
  })

  // Error handling
  await runTest('Error events with ignoreErrors=true', async () => {
    const emitter = new EventEmitter({ ignoreErrors: true })

    emitter.on('event', () => {
      throw new Error('test error')
    })

    let error: Error | undefined

    try {
      emitter.emit('event', {})
    } catch (err: unknown) {
      error = err as Error
    }

    assertEquals(error, undefined, 'should not throw error')
  })

  await runTest('Error events with ignoreErrors=false and a error listener is in place', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('error', (event) => {
      assert(event.error?.message === 'test error', 'should throw the provided error')
    })

    emitter.on('event', () => {
      throw new Error('test error')
    })

    emitter.emit('event', {})
  })

  await runTest('Error events with ignoreErrors=false but no error listener is in place', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('event', () => {
      throw new Error('test error')
    })

    let error: Error | undefined

    try {
      emitter.emit('event', {})
    } catch (err: unknown) {
      error = err as Error
    }

    assertEquals(error?.message, 'test error', 'should throw error')
  })

  await runTest('Listener exceptions are thrown at the moment of emitting', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('test', () => {
      throw new Error('listener error')
    })

    try {
      emitter.emit('test', {})
      assert(false, 'should have thrown listener error')
    } catch (error: any) {
      assert(error.message === 'listener error', 'should throw listener error')
    }
  })

  await runTest('Listener exceptions are thrown if the an error handler throws', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('test', () => {
      throw new Error('listener error')
    })

    emitter.on('error', () => {
      throw new Error('error handler error')
    })

    try {
      emitter.emit('test', {})
      assert(false, 'should have thrown listener error')
    } catch (error: any) {
      assert(error.message === 'error handler error', 'should throw error handler error')
    }
  })

  // Memory leak warning
  await runTest('Memory leak warning with verboseMemoryLeak=true', async () => {
    const emitter = new EventEmitter({ maxListeners: 2, verboseMemoryLeak: true })

    // Capture console.warn
    const originalWarn = console.warn
    let warnMessage = ''
    console.warn = (message: string) => {
      warnMessage = message
    }

    emitter.on('test', () => {})
    emitter.on('test', () => {})
    emitter.on('test', () => {}) // This should trigger warning

    console.warn = originalWarn

    assert(warnMessage.includes('memory leak'), 'should warn about memory leak')
    assert(warnMessage.includes('3 listeners'), 'should mention listener count')
  })

  await runTest('No memory leak warning when maxListeners is 0 (unlimited)', async () => {
    const emitter = new EventEmitter({ maxListeners: 0, verboseMemoryLeak: true })

    // Capture console.warn
    const originalWarn = console.warn
    let warnMessage = ''
    console.warn = (message: string) => {
      warnMessage = message
    }

    // Add many listeners - should not trigger warning when maxListeners = 0
    for (let i = 0; i < 100; i++) {
      emitter.on('test', () => {})
    }

    console.warn = originalWarn

    assertEquals(warnMessage, '', 'should not warn about memory leak when maxListeners is 0')
    assertEquals(emitter.maxListeners, 0, 'maxListeners should be 0')
    assertEquals(emitter.listenerCount, 100, 'should have 100 listeners')
  })

  // newListener and removeListener events
  await runTest('newListener event is emitted', async () => {
    const emitter = new EventEmitter({ newListenerEvent: true })
    let newListenerCalled = false

    emitter.on('emitter-new-listener', (event) => {
      newListenerCalled = true
      assert(event && event.payload && event.payload.eventName === 'test', 'should include event name')
      assert(event && event.payload && typeof event.payload.listener === 'function', 'should include listener function')
    })

    emitter.on('test', () => {})
    assertEquals(newListenerCalled, true, 'newListener event should be emitted')
  })

  await runTest('removeListener event is emitted', async () => {
    const emitter = new EventEmitter({ removeListenerEvent: true })
    let removeListenerCalled = false
    const testListener = () => {}

    emitter.on('emitter-remove-listener', (event) => {
      removeListenerCalled = true
      assert(event && event.payload && event.payload.eventName === 'test', 'should include event name')
      assert(event && event.payload && event.payload.listener === testListener, 'should include listener function')
    })

    emitter.on('test', testListener)
    emitter.removeListener('test', testListener)

    assertEquals(removeListenerCalled, true, 'removeListener event should be emitted')
  })

  // Property getters
  await runTest('eventNames getter returns correct names', async () => {
    const emitter = new EventEmitter()

    emitter.on('test1', () => {})
    emitter.on('test2', () => {})

    const names = emitter.eventNames
    assert(names.includes('test1'), 'should include test1')
    assert(names.includes('test2'), 'should include test2')
    assertEquals(names.length, 2, 'should have correct count')
  })

  await runTest('listenerCount getter returns correct count', async () => {
    const emitter = new EventEmitter()

    assertEquals(emitter.listenerCount, 0, 'should start with 0 listeners')

    emitter.on('test', () => {})
    emitter.on('test', () => {})

    assertEquals(emitter.listenerCount, 2, 'should count all listeners')
  })

  await runTest('listeners getter returns all listeners', async () => {
    const emitter = new EventEmitter()
    const listener1 = () => {}
    const listener2 = () => {}

    emitter.on('test', listener1)
    emitter.on('test', listener2)

    const listeners = emitter.listeners
    assertEquals(listeners.length, 2, 'should return all listeners')
    assert(listeners.includes(listener1), 'should include listener1')
    assert(listeners.includes(listener2), 'should include listener2')
  })

  await runTest('maxListeners setter and getter work', async () => {
    const emitter = new EventEmitter()

    assertEquals(emitter.maxListeners, 20, 'default maxListeners should be 20')

    emitter.maxListeners = 50
    assertEquals(emitter.maxListeners, 50, 'should update maxListeners')
  })

  await runTest('maxListeners setter works with 0 for unlimited', async () => {
    const emitter = new EventEmitter()

    emitter.maxListeners = 0
    assertEquals(emitter.maxListeners, 0, 'should accept 0 for unlimited listeners')

    // Capture console.warn
    const originalWarn = console.warn
    let warnMessage = ''
    console.warn = (message: string) => {
      warnMessage = message
    }

    // Add many listeners - should not trigger warning when maxListeners = 0
    for (let i = 0; i < 50; i++) {
      emitter.on('test', () => {})
    }

    console.warn = originalWarn

    assertEquals(warnMessage, '', 'should not warn about memory leak when maxListeners is set to 0')
  })

  // Wildcard disabled tests
  await runTest('Wildcard disabled works correctly', async () => {
    const emitter = new EventEmitter({ useWildcards: false })
    let callCount = 0

    emitter.on('*', () => {
      callCount++
    })
    emitter.on('user:*', () => {
      callCount++
    })

    emitter.emit('user:created', {})
    emitter.emit('*', {})

    assertEquals(callCount, 1, 'only exact match should work when wildcard disabled')
  })

  // Complex wildcard patterns
  await runTest('Complex wildcard patterns work', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.on('user:*:created', () => {
      callCount++
    })

    emitter.emit('user:admin:created', {})
    emitter.emit('user:guest:created', {})
    emitter.emit('user:created', {})

    assertEquals(callCount, 2, 'should match complex patterns correctly')
  })

  // Edge cases
  await runTest('Empty event name works', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.on('', () => {
      callCount++
    })
    emitter.emit('', {})

    assertEquals(callCount, 1, 'empty event name should work')
  })

  await runTest('Removing non-existent listener is safe', async () => {
    const emitter = new EventEmitter()
    const listener = () => {}

    // Should not throw
    emitter.removeListener('nonexistent', listener)
    assert(true, 'should not throw when removing non-existent listener')
  })

  await runTest('Once listeners are removed after single call in async', async () => {
    const emitter = new EventEmitter()
    let callCount = 0

    emitter.once(['test', 'test2'], () => {
      callCount++
    })

    await emitter.emitAsync('test', {})
    await emitter.emitAsync('test', {})

    assertEquals(callCount, 1, 'once listener should only be called once in async')
  })

  // Configuration options
  await runTest('Custom delimiter option', async () => {
    const emitter = new EventEmitter({ delimiter: '.' })

    // Test delimiter is stored correctly
    assertEquals(emitter.options.delimiter, '.', 'should store custom delimiter')

    // Test delimiter-based pattern matching
    let userCount = 0
    let adminCount = 0
    let deepEventCount = 0

    emitter.on('user.*', () => {
      userCount++
    })
    emitter.on('admin.*', () => {
      adminCount++
    })
    emitter.on('*.created', () => {
      deepEventCount++
    })

    // Test single level wildcard matching with custom delimiter
    emitter.emit('user.login', {})
    emitter.emit('user.logout', {})
    emitter.emit('admin.login', {})
    emitter.emit('user.profile.created', {}) // This should NOT match user.*
    emitter.emit('other.created', {})

    assertEquals(userCount, 2, 'user.* should match user.login and user.logout')
    assertEquals(adminCount, 1, 'admin.* should match admin.login')
    assertEquals(deepEventCount, 1, '*.created should match other.created but not user.profile.created')

    // Test with recursive wildcard
    const emitter2 = new EventEmitter({ delimiter: '.' })
    let recursiveCount = 0

    emitter2.on('user.**', () => {
      recursiveCount++
    })

    emitter2.emit('user.login', {})
    emitter2.emit('user.profile.created', {})
    emitter2.emit('user.settings.privacy.updated', {})
    emitter2.emit('admin.login', {}) // Should not match

    assertEquals(recursiveCount, 3, 'user.** should match all user events at any depth')
  })

  await runTest('All default options are set correctly', async () => {
    const emitter = new EventEmitter()
    assertEquals(emitter.options.useWildcards, true, 'useWildcards should default to true')
    assertEquals(emitter.options.ignoreErrors, true, 'ignoreErrors should default to true')
    assertEquals(emitter.options.verboseMemoryLeak, true, 'verboseMemoryLeak should default to true')
    assertEquals(emitter.options.newListenerEvent, true, 'newListenerEvent should default to true')
    assertEquals(emitter.options.removeListenerEvent, false, 'removeListenerEvent should default to false')
    assertEquals(emitter.options.delimiter, ':', 'delimiter should default to ":"')
    assertEquals(emitter.options.maxListeners, 20, 'maxListeners should default to 20')
  })

  // Additional tests for 100% coverage
  await runTest('emitAsync with array of event names', async () => {
    const emitter = new EventEmitter()
    let event1Count = 0
    let event2Count = 0

    emitter.on('event1', () => {
      event1Count++
    })
    emitter.on('event2', () => {
      event2Count++
    })

    const result = await emitter.emitAsync(['event1', 'event2'], {})
    assertEquals(result, true, 'should return true when listeners exist')
    assertEquals(event1Count, 1, 'event1 should be emitted')
    assertEquals(event2Count, 1, 'event2 should be emitted')

    // Test with no listeners for one event
    const result2 = await emitter.emitAsync(['event1', 'nonexistent'], {})
    assertEquals(result2, true, 'should return true if at least one event has listeners')
  })

  await runTest('removeListener with array of event names', async () => {
    const emitter = new EventEmitter()
    let callCount = 0
    const listener = () => {
      callCount++
    }

    emitter.on(['event1', 'event2'], listener)
    emitter.emit('event1', {})
    emitter.emit('event2', {})
    assertEquals(callCount, 2, 'both events should trigger listener')

    emitter.removeListener(['event1', 'event2'], listener)
    emitter.emit('event1', {})
    emitter.emit('event2', {})
    assertEquals(callCount, 2, 'listener should be removed from both events')
  })

  await runTest('removeAllListeners with array of event names', async () => {
    const emitter = new EventEmitter()
    let event1Count = 0
    let event2Count = 0

    emitter.on('event1', () => {
      event1Count++
    })
    emitter.on('event2', () => {
      event2Count++
    })
    emitter.on('event3', () => {
      // This should not be removed
    })

    emitter.removeAllListeners(['event1', 'event2'])
    emitter.emit('event1', {})
    emitter.emit('event2', {})
    emitter.emit('event3', {}) // This should still work

    assertEquals(event1Count, 0, 'event1 listeners should be removed')
    assertEquals(event2Count, 0, 'event2 listeners should be removed')
    assertEquals(emitter.hasListeners('event3'), true, 'event3 listeners should remain')
  })

  await runTest('removeAllListeners with wildcard patterns', async () => {
    const emitter = new EventEmitter()
    let userCreatedCount = 0
    let userUpdatedCount = 0
    let adminLoginCount = 0

    emitter.on('user:created', () => {
      userCreatedCount++
    })
    emitter.on('user:created', () => {
      userCreatedCount++
    })
    emitter.on('user:updated', () => {
      userUpdatedCount++
    })
    emitter.on('user:updated', () => {
      userUpdatedCount++
    })
    emitter.on('admin:login', () => {
      adminLoginCount++
    })

    // Remove all user events from array
    emitter.removeAllListeners(['user:created', 'user:updated'])

    emitter.emit('user:created', {})
    emitter.emit('user:updated', {})
    emitter.emit('admin:login', {})

    assertEquals(userCreatedCount, 0, 'user:created listeners should be removed')
    assertEquals(userUpdatedCount, 0, 'user:updated listeners should be removed')
    assertEquals(adminLoginCount, 1, 'admin:login listeners should remain')
  })

  await runTest('removeAllListeners emits removeListener event', async () => {
    const emitter = new EventEmitter({ removeListenerEvent: true })
    let removeListenerCalled = false

    emitter.on('user:created', () => {})
    emitter.on('user:updated', () => {})

    emitter.on('emitter-remove-listener', () => {
      removeListenerCalled = true
    })

    emitter.removeAllListeners(['user:created', 'user:updated'])

    assertEquals(removeListenerCalled, true, 'removeListener event should be emitted')
  })

  await runTest('emitAsync with no listeners returns false', async () => {
    const emitter = new EventEmitter()
    const result = await emitter.emitAsync('nonexistent', {})
    assertEquals(result, false, 'should return false when no listeners exist')

    // Test with array where none have listeners
    const result2 = await emitter.emitAsync(['event1', 'event2'], {})
    assertEquals(result2, false, 'should return false when no listeners exist for any event')
  })

  await runTest('Async error events with ignoreErrors=true', async () => {
    const emitter = new EventEmitter({ ignoreErrors: true })

    emitter.on('event', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      throw new Error('test error')
    })

    let error: Error | undefined

    try {
      await emitter.emitAsync('event', {})
    } catch (err: unknown) {
      error = err as Error
    }

    assertEquals(error, undefined, 'should not throw error')
  })

  await runTest('Async error events with ignoreErrors=false and a error listener is in place', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('error', async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      assert(event.error?.message === 'test error', 'should throw the provided error')
    })

    emitter.on('event', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      throw new Error('test error')
    })

    await emitter.emitAsync('event', {})
  })

  await runTest('Async error events with ignoreErrors=false but no error listener is in place', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('event', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      throw new Error('test error')
    })

    let error: Error | undefined

    try {
      await emitter.emitAsync('event', {})
    } catch (err: unknown) {
      error = err as Error
    }

    assertEquals(error?.message, 'test error', 'should throw error')
  })

  await runTest('Async listener exceptions are thrown at the moment of emitting', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      throw new Error('listener error')
    })

    try {
      await emitter.emitAsync('test', {})
      assert(false, 'should have thrown listener error')
    } catch (error: any) {
      assert(error.message === 'listener error', 'should throw listener error')
    }
  })

  await runTest('Async listener exceptions are thrown if the an error handler throws', async () => {
    const emitter = new EventEmitter({ ignoreErrors: false })

    emitter.on('test', () => {
      throw new Error('listener error')
    })

    emitter.on('error', () => {
      throw new Error('error handler error')
    })

    try {
      await emitter.emitAsync('test', {})
      assert(false, 'should have thrown listener error')
    } catch (error: any) {
      assert(error.message === 'error handler error', 'should throw error handler error')
    }
  })

  await runTest('maxListeners handles 0 and undefined correctly', async () => {
    const emitter = new EventEmitter({ maxListeners: 0 })
    assertEquals(emitter.maxListeners, 0, 'should accept 0 when maxListeners is 0 (unlimited)')

    const emitter2 = new EventEmitter({ maxListeners: undefined })
    assertEquals(emitter2.maxListeners, 20, 'should fallback to 20 when maxListeners is undefined')
  })

  await runTest('Default delimiter hierarchical pattern matching', async () => {
    const emitter = new EventEmitter() // Uses default delimiter ':'
    let userCount = 0
    let allCreatedCount = 0
    let deepUserCount = 0
    let deepCreatedCount = 0

    emitter.on('user:*', () => {
      userCount++
    })
    emitter.on('*:created', () => {
      allCreatedCount++
    })
    emitter.on('user:**', () => {
      deepUserCount++
    })
    emitter.on('**:created', () => {
      deepCreatedCount++
    })

    // Test single level matching with default delimiter
    emitter.emit('user:login', {})
    emitter.emit('user:logout', {})
    emitter.emit('admin:created', {})
    emitter.emit('user:profile:created', {}) // Should not match user:* or *:created (wrong level), but should match user:** and **:created
    emitter.emit('other:updated', {})

    assertEquals(userCount, 2, 'user:* should match single level user events')
    assertEquals(allCreatedCount, 1, '*:created should only match admin:created (2 parts)')
    assertEquals(deepUserCount, 3, 'user:** should match all user events at any depth')
    assertEquals(deepCreatedCount, 2, '**:created should match admin:created and user:profile:created')
  })

  await runTest('Partial wildcard matching within delimiter segments', async () => {
    const emitter = new EventEmitter() // Uses default delimiter ':'
    let userEventCount = 0
    let createdEventCount = 0

    emitter.on('user:*:login', () => {
      userEventCount++
    })
    emitter.on('*:created', () => {
      createdEventCount++
    })

    // Test partial wildcards within segments
    emitter.emit('user:normal:login', {}) // Should match user:*:login
    emitter.emit('user:admin:login', {}) // Should match user:*:login
    emitter.emit('admin:normal:login', {}) // Should NOT match user:*:login
    emitter.emit('admin:created', {}) // Should match *:created
    emitter.emit('user:created', {}) // Should match *:created
    emitter.emit('admin:updated', {}) // Should NOT match *:created

    assertEquals(userEventCount, 2, 'user:*:login should match user:normal:login and user:admin:login')
    assertEquals(createdEventCount, 2, '*:created should match admin:created and user:created')
  })

  await runTest('Double star wildcard patterns (**)', async () => {
    const emitter = new EventEmitter()
    let recursiveCount = 0
    let specificCount = 0

    emitter.on('**:login', () => {
      recursiveCount++
    })
    emitter.on('user:**', () => {
      specificCount++
    })

    // Test recursive matching
    emitter.emit('user:login', {}) // Should match both patterns
    emitter.emit('admin:profile:login', {}) // Should match **:login
    emitter.emit('user:profile:settings:update', {}) // Should match user:**
    emitter.emit('user:logout', {}) // Should match user:**
    emitter.emit('other:event', {}) // Should match neither

    assertEquals(recursiveCount, 2, '**:login should match recursive patterns')
    assertEquals(specificCount, 3, 'user:** should match all user patterns')
  })

  await runTest('Wildcard non-matching patterns to ensure branch coverage', async () => {
    const emitter = new EventEmitter()
    let matchCount = 0

    emitter.on('user:profile:*', () => {
      matchCount++
    })

    // Test patterns with different number of parts (should not match)
    emitter.emit('user', {}) // Too few parts
    emitter.emit('user:profile', {}) // Too few parts
    emitter.emit('user:profile:settings:extra', {}) // Too many parts
    emitter.emit('admin:profile:settings', {}) // Wrong prefix
    emitter.emit('user:settings:profile', {}) // Wrong middle part

    assertEquals(matchCount, 0, 'none of these patterns should match user:profile:*')

    // Now test one that should match
    emitter.emit('user:profile:settings', {})
    assertEquals(matchCount, 1, 'user:profile:settings should match')
  })

  console.log('\n✅ All EventEmitter tests completed!')
}
