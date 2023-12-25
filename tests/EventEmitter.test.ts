import { EventEmitter } from '../src'

describe(EventEmitter, (): void => {
  it('emits using an event standard descriptor', async (): Promise<void> => {
    const emitter = new EventEmitter()
    const eventListener = jest.fn()
    const eventListener2 = jest.fn()
    const eventListener3 = jest.fn()

    emitter.on('test', eventListener)
    emitter.on('test2', eventListener2)
    emitter.on('*', eventListener3)

    emitter.emit('test', { message: 'test', payload: {} })
    emitter.emit('test2', { message: 'test2' })
    emitter.emit('test3', { message: 'test3' })
    emitter.emit('error', { message: 'error' })

    expect(eventListener).toHaveBeenCalledTimes(1)
    expect(eventListener).toHaveBeenCalledWith({ event: 'test', message: 'test', payload: {} })
    expect(eventListener2).toHaveBeenCalledTimes(1)
    expect(eventListener2).toHaveBeenCalledWith({ event: 'test2', message: 'test2' })
    expect(eventListener3).toHaveBeenCalledTimes(4)
    expect(eventListener3).toHaveBeenCalledWith({ event: 'test', message: 'test', payload: {} })
    expect(eventListener3).toHaveBeenCalledWith({ event: 'test2', message: 'test2' })
    expect(eventListener3).toHaveBeenCalledWith({ event: 'test3', message: 'test3' })
    expect(eventListener3).toHaveBeenCalledWith({ event: 'error', message: 'error' })
  })
})
