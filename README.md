# Event Emitter

[![npm version](https://badge.fury.io/js/@universal-packages%2Fevent-emitter.svg)](https://www.npmjs.com/package/@universal-packages/event-emitter)
[![Testing](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-event-emitter/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-event-emitter)

It extends [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)

## Install

```shell
npm install @universal-packages/event-emitter
```

## EventEmitter

It behaves exactly as [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) but with wildcards enabled by default and following events convention for universal-packages.

### Basic Usage

```ts
import { EventEmitter } from '@universal-packages/event-emitter'
import { startMEasurement } from '@universal-packages/time-measurer'

const measurer = startMeasurement()

const emitter = new EventEmitter()

emitter.on('event', (event) => {
  console.log(event)
})

emitter.emit('event', { message: 'Hello World', measurement: measurer.finish(), payload: { foo: 'bar' } })
emitter.emit('error', { error: new Error('Something went wrong'), measurement: measurer.finish(), payload: { foo: 'bar' } })
```

### Type-Safe Events

This library provides full TypeScript support with generic event types. You can define your event names and their payload types for complete type safety:

```ts
import { EventEmitter } from '@universal-packages/event-emitter'

// Define your event map
interface MyEvents {
  'user:created': { id: string; name: string }
  'user:updated': { id: string; changes: Record<string, any> }
  'numbers': number[]
  'message': string
}

// Create a typed event emitter
const emitter = new EventEmitter<MyEvents>()

// TypeScript provides autocompletion for event names
emitter.on('user:created', (event) => {
  // event.payload is typed as { id: string; name: string }
  console.log(`User created: ${event.payload?.id}, ${event.payload?.name}`)
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
```

### Mixed Typed and Dynamic Events

You can use both typed and dynamic events in the same emitter:

```ts
// Use your typed events with autocompletion
emitter.on('user:created', (event) => {
  // Fully typed payload
  const id: string = event.payload!.id
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

### Extending with Type Safety

```ts
// Create a custom typed EventEmitter
class UserEvents extends EventEmitter<{
  'created': { id: string }
  'updated': { id: string; changes: object }
  'deleted': { id: string }
}> {
  createUser(name: string): string {
    const id = Math.random().toString(36).substring(2)
    this.emit('created', { payload: { id } })
    return id
  }
}

const users = new UserEvents()
users.on('created', (event) => {
  // Fully typed payload
  console.log(`User created with ID: ${event.payload!.id}`)
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
