import EE2, { CancelablePromise, ConstructorOptions, GeneralEventEmitter, OnOptions, OnceOptions, event, eventNS } from 'eventemitter2'

import { EventAndListener, EventIn, ListenToOptions, Listener, ListenerFn, WaitForFilter, WaitForOptions } from './EventEmitter.types'

export default class EventEmitter extends EE2 {
  public static defaultMaxListeners: number

  public constructor(options?: ConstructorOptions) {
    super({ wildcard: true, delimiter: ':', ignoreErrors: true, ...options })
  }

  public emit(eventName: event | eventNS, event?: EventIn): boolean {
    return super.emit(eventName, { event: eventName, ...event })
  }

  public async emitAsync(eventName: event | eventNS, event?: EventIn): Promise<any[]> {
    return super.emitAsync(eventName, event)
  }

  public addListener(eventName: event | eventNS, listener: ListenerFn): this | Listener {
    return super.addListener(eventName, listener)
  }

  public on(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.on(eventName, listener, options)
  }

  public prependListener(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependListener(eventName, listener, options)
  }

  public once(eventName: event | eventNS, listener: ListenerFn, options?: true | OnOptions): this | Listener {
    return super.once(eventName, listener, options)
  }

  public prependOnceListener(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependOnceListener(eventName, listener, options)
  }

  public many(eventName: event | eventNS, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.many(eventName, timesToListen, listener, options)
  }

  public prependMany(eventName: event | eventNS, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependMany(eventName, timesToListen, listener, options)
  }

  public onAny(listener: EventAndListener): this {
    return super.onAny(listener)
  }

  public prependAny(listener: EventAndListener): this {
    return super.prependAny(listener)
  }

  public offAny(listener: ListenerFn): this {
    return super.offAny(listener)
  }

  public removeListener(eventName: event | eventNS, listener: ListenerFn): this {
    return super.removeListener(eventName, listener)
  }

  public off(eventName: event | eventNS, listener: ListenerFn): this {
    return super.off(eventName, listener)
  }

  public removeAllListeners(event?: event | eventNS): this {
    return super.removeAllListeners(event)
  }

  public setMaxListeners(n: number): void {
    return super.setMaxListeners(n)
  }

  public getMaxListeners(): number {
    return super.getMaxListeners()
  }

  public eventNames(nsAsArray?: boolean): (event | eventNS)[] {
    return super.eventNames(nsAsArray)
  }

  public listenerCount(event?: event | eventNS): number {
    return super.listenerCount(event)
  }

  public listeners(event?: event | eventNS): ListenerFn[] {
    return super.listeners(event)
  }

  public listenersAny(): ListenerFn[] {
    return super.listenersAny()
  }

  public waitFor(eventName: event | eventNS, timeout?: number): CancelablePromise<any[]>
  public waitFor(eventName: event | eventNS, filter?: WaitForFilter): CancelablePromise<any[]>
  public waitFor(eventName: event | eventNS, options?: WaitForOptions): CancelablePromise<any[]>
  public waitFor(eventName: event | eventNS, right?: number | WaitForFilter | WaitForOptions): CancelablePromise<any[]> {
    return super.waitFor(eventName, right as any)
  }

  public listenTo(target: GeneralEventEmitter, events: event | eventNS, options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: event[], options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: Object, options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: event | eventNS | event[] | Object, options?: ListenToOptions): this {
    return super.listenTo(target, events, options)
  }

  public stopListeningTo(target?: GeneralEventEmitter, event?: event | eventNS): Boolean {
    return super.stopListeningTo(target, event)
  }

  public hasListeners(event?: String): Boolean {
    return super.hasListeners(event)
  }

  public static once(emitter: EventEmitter, event: event | eventNS, options?: OnceOptions): CancelablePromise<any[]> {
    return this.once(emitter, event, options)
  }

  public static onAny(emitter: EventEmitter, listener: EventAndListener): EventEmitter {
    return this.onAny(emitter, listener)
  }
}
