# Buffer Dispatcher

[![npm version](https://badge.fury.io/js/@universal-packages%2Fevent-emitter.svg)](https://www.npmjs.com/package/@universal-packages/event-emitter)
[![Testing](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-event-emitter/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-event-emitter/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-event-emitter)

It extends [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)

## Install

```shell
npm install @universal-packages/event-emitter
```

## EventEmitter

It behaves exactly as [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2) but with wildcards enabled by default and emit to only emit on object following events convention for universal-packages.

```js
import { EventEmitter } from '@universal-packages/event-emitter'
import { startMEasurement() } from '@universal-packages/time-measurer'

const measurer = startMeasurement()

const emitter = new EventEmitter()

emitter.on('event', (event) => {
  console.log(event)
})

emitter.emit('event', { message: 'Hello World', measurement: measurer.finish(), payload: { foo: 'bar'} })
emitter.emit('error', { error: new Error('Something went wrong'), measurement: measurer.finish(), payload: { foo: 'bar'} })

```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
