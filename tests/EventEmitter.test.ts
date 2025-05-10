import { EventEmitter } from '../src'

describe('EventEmitter TypeScript Support', (): void => {
  it('supports strict event typing with generics', (): void => {
    // Define event map with typed payloads
    interface MyEvents {
      'user:created': { id: string; name: string }
      'user:updated': { id: string; changes: Record<string, any> }
      numbers: number[]
      message: string
    }

    // Create a typed event emitter
    const emitter = new EventEmitter<MyEvents>()

    // Type checking happens at compile time
    // TypeScript will error if the payload type is incorrect
    let userCreatedCalled = false
    let numbersCalled = false

    // Register listeners with typed events - checking payload type inference
    emitter.on('user:created', (event) => {
      userCreatedCalled = true
      // If TypeScript properly infers the type, this should compile
      const id: string = event.payload!.id
      const name: string = event.payload!.name
      expect(typeof id).toBe('string')
      expect(typeof name).toBe('string')
    })

    emitter.on('numbers', (event) => {
      numbersCalled = true
      // If TypeScript properly infers the type, this should compile
      const numbers: number[] = event.payload!
      expect(Array.isArray(numbers)).toBe(true)
      numbers.forEach((num) => expect(typeof num).toBe('number'))
    })

    // Emit events with correct payload types
    emitter.emit('user:created', {
      payload: { id: '123', name: 'John' }
    })

    emitter.emit('numbers', {
      payload: [1, 2, 3, 4, 5]
    })

    // Verify the listeners were called
    expect(userCreatedCalled).toBe(true)
    expect(numbersCalled).toBe(true)
  })

  it('supports dynamic events alongside typed events', (): void => {
    interface MyEvents {
      'typed:event': { data: string }
    }

    const emitter = new EventEmitter<MyEvents>()

    // Track if the listeners were called
    let typedEventCalled = false
    let dynamicEventCalled = false
    let wildcardCalled = 0

    // Typed event
    emitter.on('typed:event', (event) => {
      typedEventCalled = true
      // Type checking - TypeScript should infer this correctly
      const data: string = event.payload!.data
      expect(typeof data).toBe('string')
    })

    // Dynamic event
    emitter.on('dynamic:event', (event) => {
      dynamicEventCalled = true
      // For dynamic events, we can use any type
      const anything: any = event.payload!.anything
      expect(anything).toBe('goes')
    })

    // Wildcard
    emitter.onAny((eventName, event) => {
      wildcardCalled++
      // With wildcards, we get the event name
      expect(typeof eventName).toBe('string')
    })

    // Emit both types of events
    emitter.emit('typed:event', { payload: { data: 'test' } })
    emitter.emit('dynamic:event', { payload: { anything: 'goes' } })

    // Check that all listeners were called appropriately
    expect(typedEventCalled).toBe(true)
    expect(dynamicEventCalled).toBe(true)
    expect(wildcardCalled).toBe(2)
  })

  it('supports extending the EventEmitter with typed events', (): void => {
    interface MyEvents {
      'counter:increment': number
      'counter:reset': void
    }

    // Create a custom typed EventEmitter subclass
    class Counter extends EventEmitter<MyEvents> {
      private count = 0

      public increment(): void {
        this.count++
        this.emit('counter:increment', { payload: this.count })
      }

      public reset(): void {
        this.count = 0
        this.emit('counter:reset')
      }

      public getCount(): number {
        return this.count
      }
    }

    const counter = new Counter()

    let incrementCalled = 0
    let resetCalled = false

    counter.on('counter:increment', (event) => {
      incrementCalled++
      // TypeScript should infer this is a number
      const count: number = event.payload!
      expect(typeof count).toBe('number')
      expect(count).toBe(incrementCalled)
    })

    counter.on('counter:reset', (event) => {
      resetCalled = true
      // No payload for this event
      expect(event.payload).toBeUndefined()
    })

    counter.increment()
    counter.increment()
    counter.reset()

    expect(incrementCalled).toBe(2)
    expect(resetCalled).toBe(true)
    expect(counter.getCount()).toBe(0)
  })

  it('supports waiting for typed events', async (): Promise<void> => {
    interface MyEvents {
      'async:event': { result: string }
    }

    const emitter = new EventEmitter<MyEvents>()

    // This should be properly typed by TypeScript
    const waitPromise = emitter.waitFor('async:event')

    // Emit the event after a small delay
    setTimeout(() => {
      emitter.emit('async:event', { payload: { result: 'success' } })
    }, 10)

    const events = await waitPromise

    expect(events.length).toBe(1)
    // TypeScript should infer the correct type for the events
    const result: string = events[0].payload!.result
    expect(result).toBe('success')
  })
})
