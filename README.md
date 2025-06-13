# Event Emitter

[![npm version](https://badge.fury.io/js/@universal-packages%2Fevent-emitter.svg)](https://www.npmjs.com/package/@universal-packages/event-emitter)
[![Testing](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-event-emitter/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-event-emitter)

Rich emitted event event emitter with typescript support.

# Getting Started

```shell
npm install @universal-packages/event-emitter
```

# Usage

## EventEmitter <small><small>`class`</small></small>

Just instantiate the class and start emitting events.

```ts
import { EventEmitter } from '@universal-packages/event-emitter'

const emitter = new EventEmitter()

emitter.on('event', (event) => {
  console.log(event)
})

emitter.emit('event', { payload: { foo: 'bar' } })
emitter.emit('error', { error: new Error('Something went wrong') })
```

### Constructor <small><small>`constructor`</small></small>

```ts
new EventEmitter(options?: EventEmitterOptions)
```

Creates a new EventEmitter instance.

#### Options

- **`delimiter`** `String` `default: ':'`
  The delimiter to use for event names.

- **`maxListeners`** `Number` `default: 20`
  The maximum number of listeners for an event before start considering it a memory leak.

- **`useWildcards`** `Boolean` `default: true`
  Whether to use wildcards for event names. ex: `'user:*` or even `*` for all events.

- **`newListenerEvent`** `Boolean` `default: true`
  Whether to emit a new listener event when a listener is added.

- **`removeListenerEvent`** `Boolean` `default: false`
  Whether to emit a remove listener event when a listener is removed.

- **`verboseMemoryLeak`** `Boolean` `default: true`
  Whether to log memory leaks (when a listener is added after the maxListeners limit is reached).

- **`ignoreErrors`** `Boolean` `default: true`
  If false when emitting an error and no error listener is added the error will be thrown.

### Getters/Setters

#### maxListeners

```ts
emitter.maxListeners
```

Returns the maximum number of listeners for an event before start considering it a memory leak.

#### eventNames

```ts
emitter.eventNames
```

Returns the event names that the emitter is listening to.

#### listenerCount

```ts
emitter.listenerCount
```

Returns the number of listeners for a given event.

#### listeners

```ts
emitter.listeners
```

Returns the listeners for a given event.

### Instance Methods

#### emit

```ts
emitter.emit(eventName: string | string[], event?: EventIn): boolean
```

Emits an event for the given event name or names. Or even wildcards.

```ts
// All event listeners that start with user like user:created, user:updated, user:deleted
emitter.emit('user:*', { payload: { foo: 'bar' } })

// All event listeners will receive the event
emitter.emit('*', { payload: { foo: 'bar' } })

// Specific event, just the user:created listeners will receive the event
emitter.emit('user:created', { payload: { foo: 'bar' } })
```

##### EventIn

The event object that is passed to the listener. It is packed with common and useful properties.

- **`error`** `Error` `optional`
  This can be set with the `error` event but you can also set errors for any reason you want.

  ```ts
  emitter.emit('task:done', { error: new Error('Something went wrong'), message: 'Task partially done, but with error' })
  ```

- **`measurement`** `Measurement` `optional`
  You may want processes to be measured. And share that when emitting an event.

  ```ts
  import { TimeMeasurer } from '@universal-packages/time-measurer'

  const measurer = TimeMeasurer.start()
  emitter.emit('task:done', { measurement: measurer.finish(), message: 'Task done' })
  ```

- **`message`** `String` `optional`
  A concise message to share with the listeners.

- **`payload`** `T` `optional`
  When the EventEmitter is event typed (a predefine number of event names and its payloads are defined) you set this to that predefine shape, other wise you can set any payload you want.

  ```ts
  emitter.emit('task:done', { payload: { foo: 'bar' } })
  emitter.emit('task:done', { payload: 66 })
  ```

#### emitAsync

```ts
emitter.emitAsync(eventName: string | string[], event?: EventIn): Promise<any[]>
```

Emits an event asynchronously returning a promise that resolves when all listeners are done.

#### addListener

```ts
emitter.addListener(eventName: string | string[], listener: ListenerFn): this
```

Adds a listener for a given event or events.

```ts
// Will be called when the event "event" is emitted
emitter.addListener('event', (event) => {
  console.log(event)
})

// Will be called when one level event is emitted
emitter.addListener('*', (event) => {
  console.log(event)
})

// Will be called when two levels event is emitted
emitter.addListener('*:*', (event) => {
  console.log(event)
})

// Will be called for all events
emitter.addListener('**', (event) => {
  console.log(event)
})

// Will be called when any 2event that starts with "user:" is emitted
emitter.addListener('user:*', (event) => {
  console.log(event)
})

// Will be called when any event that starts with "user:" is emitted
emitter.addListener('user:**', (event) => {
  console.log(event)
})

// Will be called when the event "users:created" or "users:updated" are emitted
emitter.addListener(['users:created', 'users:updated'], (event) => {
  console.log(event)
})

// Will be called when the event any of the 2 level events that start with "users:" or "tasks:" are emitted
emitter.addListener(['users:*', 'tasks:*'], (event) => {
  console.log(event)
})
```

##### ListenerFn

```ts
(event?: EmittedEvent<TPayload>): void | Promise<void>
```

The listener function that is called when an event is emitted. It receives all that was emitted in the #EventIn, for types events, the payload will be the shape it was types for the event.

#### on

```ts
emitter.on(eventName: string | string[], listener: ListenerFn): this
```

Adds a listener for a given event just like `addListener`,

```ts
emitter.on('event', (event) => {
  console.log(event)
})
```

#### prependListener

```ts
emitter.on(eventName: string | string[], listener: ListenerFn): this
```

Adds a listener for a given event just like `addListener`, but the listener will be called before the other listeners.

```ts
emitter.prependListener('event', (event) => {
  console.log(event)
})
```

#### once

```ts
emitter.once(eventName: string | string[], listener: ListenerFn): this
```

Adds a listener for a given event just like `addListener`, but the listener will be called only once.

```ts
emitter.once('event', (event) => {
  console.log(event)
})
```

#### prependOnceListener

```ts
emitter.prependOnceListener(eventName: string | string[], listener: ListenerFn): this
```

Adds a listener for a given event just like `once`, but the listener will be called before the other listeners.

```ts
emitter.prependOnceListener('event', (event) => {
  console.log(event)
})
```

#### removeListener

```ts
emitter.removeListener(eventName: string | string[], listener: ListenerFn): this
```

Removes a listener for a given event or events.

```ts
// Will remove the listeners for the event "event" only
emitter.removeListener('event', (event) => {
  console.log(event)
})

// Will remove the listeners for the events "users:created" and "users:updated"
emitter.removeListener(['users:created', 'users:updated'], (event) => {
  console.log(event)
})
```

#### off

```ts
emitter.off(eventName: string | string[], listener: ListenerFn): this
```

Removes a listener for a given event or events.

#### removeAllListeners

```ts
emitter.removeAllListeners(eventName?: string | string[]): this
```

Removes all listeners for a given event or events.

```ts
// Will remove all listeners for the event "event"
emitter.removeAllListeners('event')
```

#### waitFor

```ts
emitter.waitFor(eventName: string): CancelablePromise<EmittedEvent<TPayload>[]>
```

Waits for a given event to be emitted, it returns a cancelable promise that resolves with the emitted event.

```ts
const promise = emitter.waitFor('event')

promise.then((event) => {
  console.log(event)
})
```

#### hasListeners

```ts
emitter.hasListeners(eventName: string | string[]): Boolean
```

Returns true if there are listeners for a given event or events.

```ts
// Will return true if there are listeners for the event "event"
emitter.hasListeners('event')
```

### Type-Safe Events

This library provides full TypeScript support with generic event types. You can define your event names and their payload types for complete type safety:

```ts
import { EventEmitter } from '@universal-packages/event-emitter'

// Define your event map
interface MyEvents {
  'user:created': { id: string; name: string }
  'user:updated': { id: string; changes: Record<string, any> }
  numbers: number[]
  message: string
}

// Create a typed event emitter
const emitter = new EventEmitter<MyEvents>()

// TypeScript provides autocompletion for event names
emitter.on('user:created', (event) => {
  // event.payload is typed as { id: string; name: string }
  console.log(`User created: ${event.payload.id}, ${event.payload.name}`)
})

// Emit with type checking
emitter.emit('user:created', {
  payload: {
    id: '123',
    name: 'John'
  }
})

// TypeScript will catch type errors:
// emitter.emit('user:created', { payload: { id: 123 } }) // Error: Type 'number' is not assignable to type 'string'
// emitter.emit('user:created', { payload: {}) // Error: Type '{}' is not assignable to type '{ id: string; name: string; }'
```

### Mixed Typed and Dynamic Events

You can use both typed and dynamic events in the same emitter:

```ts
// Use your typed events with autocompletion
emitter.on('user:created', (event) => {
  // Fully typed payload
  const id: string = event.payload.id
})

// Use dynamic events when needed
emitter.on('custom:event', (event: EmittedEvent<{ custom: boolean }>) => {
  // Dynamic payload
  console.log(event.payload)
})

// Use wildcards
emitter.onAny((eventName, event) => {
  console.log(`Event fired: ${eventName}`)
})
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).

```

```
