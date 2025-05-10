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

    // Type checking for event listeners
    const userCreatedListener = jest.fn((event) => {
      // TypeScript should know these types
      const id: string = event.payload!.id
      const name: string = event.payload!.name
      expect(typeof id).toBe('string')
      expect(typeof name).toBe('string')
    })

    const numbersListener = jest.fn((event) => {
      // TypeScript should know this is a number array
      const numbers: number[] = event.payload!
      expect(Array.isArray(numbers)).toBe(true)
      numbers.forEach((num) => expect(typeof num).toBe('number'))
    })

    // Register listeners with typed events
    emitter.on('user:created', userCreatedListener)
    emitter.on('numbers', numbersListener)

    // Emit events with correct payload types
    emitter.emit('user:created', {
      payload: { id: '123', name: 'John' }
    })

    emitter.emit('numbers', {
      payload: [1, 2, 3, 4, 5]
    })

    // Check that listeners were called
    expect(userCreatedListener).toHaveBeenCalledTimes(1)
    expect(numbersListener).toHaveBeenCalledTimes(1)
  })

  it('supports dynamic events alongside typed events', (): void => {
    interface MyEvents {
      'typed:event': { data: string }
    }

    const emitter = new EventEmitter<MyEvents>()

    // TypeScript should allow both typed and dynamic events
    const typedListener = jest.fn()
    const dynamicListener = jest.fn()
    const wildcardListener = jest.fn()

    // Typed event
    emitter.on('typed:event', typedListener)

    // Dynamic event
    emitter.on('dynamic:event', dynamicListener)

    // Wildcard
    emitter.on('*:*', wildcardListener)

    // Emit both types of events
    emitter.emit('typed:event', { payload: { data: 'test' } })
    emitter.emit('dynamic:event', { payload: { anything: 'goes' } })

    // Check that all listeners were called appropriately
    expect(typedListener).toHaveBeenCalledTimes(1)
    expect(dynamicListener).toHaveBeenCalledTimes(1)
    expect(wildcardListener).toHaveBeenCalledTimes(2)
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

    const incrementListener = jest.fn((event) => {
      // TypeScript should know this is a number
      const count: number = event.payload!
      expect(typeof count).toBe('number')
    })

    const resetListener = jest.fn()

    counter.on('counter:increment', incrementListener)
    counter.on('counter:reset', resetListener)

    counter.increment()
    counter.increment()
    counter.reset()

    expect(incrementListener).toHaveBeenCalledTimes(2)
    expect(resetListener).toHaveBeenCalledTimes(1)
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
    expect(events[0].payload?.result).toBe('success')
  })
})
