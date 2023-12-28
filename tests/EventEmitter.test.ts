import { EventEmitter } from '../src'

describe(EventEmitter, (): void => {
  it('emits using an event standard descriptor', async (): Promise<void> => {
    const emitter = new EventEmitter()
    const someEmitter = { addEventListener: jest.fn(), removeEventListener: jest.fn() }

    emitter.listenTo(someEmitter, [])
    emitter.stopListeningTo(someEmitter)

    const eventListener = jest.fn()
    const eventListener_2 = jest.fn()
    const eventListener_3 = jest.fn()

    const eventListener2 = jest.fn()
    const eventListener2_2 = jest.fn()
    const eventListener2_3 = jest.fn()

    const eventListener3 = jest.fn()
    const eventListener3_2 = jest.fn()
    const eventListener3_3 = jest.fn()

    const eventListenerAll = jest.fn()
    const eventListenerAll2 = jest.fn()
    const eventListenerAll3 = jest.fn()

    emitter.setMaxListeners(100)

    emitter.on('test', eventListener)
    emitter.on('test2', eventListener2)
    emitter.on('test3', eventListener3)

    emitter.addListener('test', eventListener_2)
    emitter.prependListener('test', eventListener_3)

    emitter.once('test2', eventListener2_2)
    emitter.prependOnceListener('test2', eventListener2_3)

    emitter.many('test3', 1, eventListener3_2)
    emitter.prependMany('test3', 1, eventListener3_3)

    emitter.on('*', eventListenerAll)
    emitter.onAny(eventListenerAll2)
    emitter.prependAny(eventListenerAll3)

    expect(emitter.getMaxListeners()).toBe(100)

    expect(emitter.eventNames()).toEqual(['*', 'test3', 'test2', 'test'])

    expect(emitter.listenerCount('test')).toBe(4)
    expect(emitter.listenerCount('test2')).toBe(4)
    expect(emitter.listenerCount('test3')).toBe(4)
    expect(emitter.listenerCount('*')).toBe(10)

    expect(emitter.listeners('test')).toEqual([eventListener_3, eventListener, eventListener_2, eventListenerAll])
    expect(emitter.listenersAny()).toEqual([eventListenerAll3, eventListenerAll2])

    expect(emitter.hasListeners('test')).toBe(true)

    const waitForPromise = emitter.waitFor('test')
    const waitForPromise2 = EventEmitter.once(emitter, 'test2')

    emitter.emit('test', { message: 'test', payload: {} })
    emitter.emit('test2', { message: 'test2' })
    await emitter.emitAsync('test3', { message: 'test3' })
    emitter.emit('error', { message: 'error' })

    await waitForPromise
    await waitForPromise2

    emitter.off('test', eventListener)
    emitter.removeListener('test', eventListener_2)
    emitter.offAny(eventListenerAll)
    emitter.removeAllListeners()

    expect(eventListener).toHaveBeenCalledTimes(1)
    expect(eventListener_2).toHaveBeenCalledTimes(1)
    expect(eventListener_3).toHaveBeenCalledTimes(1)

    expect(eventListener2).toHaveBeenCalledTimes(1)
    expect(eventListener2_2).toHaveBeenCalledTimes(1)
    expect(eventListener2_3).toHaveBeenCalledTimes(1)

    expect(eventListener3).toHaveBeenCalledTimes(1)
    expect(eventListener3_2).toHaveBeenCalledTimes(1)
    expect(eventListener3_3).toHaveBeenCalledTimes(1)

    expect(eventListenerAll).toHaveBeenCalledTimes(4)
    expect(eventListenerAll2).toHaveBeenCalledTimes(4)
    expect(eventListenerAll3).toHaveBeenCalledTimes(4)
  })
})
