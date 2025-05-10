import EE2, { CancelablePromise, ConstructorOptions, OnOptions, OnceOptions, event, eventNS } from 'eventemitter2'

import {
  DefaultEventMap,
  EmittedEvent,
  EventAndListener,
  EventIn,
  EventMap,
  GeneralEventEmitter,
  ListenToOptions,
  Listener,
  ListenerFn,
  WaitForFilter,
  WaitForOptions
} from './EventEmitter.types'

export class EventEmitter<TEventMap extends EventMap = DefaultEventMap> extends EE2 {
  public static defaultMaxListeners: number

  public constructor(options?: ConstructorOptions) {
    super({ wildcard: true, delimiter: ':', ignoreErrors: true, ...options })
  }

  public emit<K extends keyof TEventMap & string>(eventName: K, event?: EventIn<TEventMap[K]>): boolean
  public emit(eventName: string, event?: EventIn): boolean
  public emit(eventName: event | eventNS, event?: EventIn): boolean {
    return super.emit(eventName, { event: eventName, ...event })
  }

  public async emitAsync<K extends keyof TEventMap & string>(eventName: K, event?: EventIn<TEventMap[K]>): Promise<any[]>
  public async emitAsync(eventName: string, event?: EventIn): Promise<any[]>
  public async emitAsync(eventName: event | eventNS, event?: EventIn): Promise<any[]> {
    return super.emitAsync(eventName, event)
  }

  public addListener<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>): this | Listener<TEventMap[K]>
  public addListener(eventName: string, listener: ListenerFn): this | Listener
  public addListener(eventName: event | eventNS, listener: ListenerFn): this | Listener {
    return super.addListener(eventName, listener)
  }

  public on<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>, options?: boolean | OnOptions): this | Listener<TEventMap[K]>
  public on(eventName: string, listener: ListenerFn, options?: boolean | OnOptions): this | Listener
  public on(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.on(eventName, listener, options)
  }

  public prependListener<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>, options?: boolean | OnOptions): this | Listener<TEventMap[K]>
  public prependListener(eventName: string, listener: ListenerFn, options?: boolean | OnOptions): this | Listener
  public prependListener(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependListener(eventName, listener, options)
  }

  public once<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>, options?: true | OnOptions): this | Listener<TEventMap[K]>
  public once(eventName: string, listener: ListenerFn, options?: true | OnOptions): this | Listener
  public once(eventName: event | eventNS, listener: ListenerFn, options?: true | OnOptions): this | Listener {
    return super.once(eventName, listener, options)
  }

  public prependOnceListener<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>, options?: boolean | OnOptions): this | Listener<TEventMap[K]>
  public prependOnceListener(eventName: string, listener: ListenerFn, options?: boolean | OnOptions): this | Listener
  public prependOnceListener(eventName: event | eventNS, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependOnceListener(eventName, listener, options)
  }

  public many<K extends keyof TEventMap & string>(
    eventName: K,
    timesToListen: number,
    listener: ListenerFn<TEventMap[K]>,
    options?: boolean | OnOptions
  ): this | Listener<TEventMap[K]>
  public many(eventName: string, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener
  public many(eventName: event | eventNS, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.many(eventName, timesToListen, listener, options)
  }

  public prependMany<K extends keyof TEventMap & string>(
    eventName: K,
    timesToListen: number,
    listener: ListenerFn<TEventMap[K]>,
    options?: boolean | OnOptions
  ): this | Listener<TEventMap[K]>
  public prependMany(eventName: string, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener
  public prependMany(eventName: event | eventNS, timesToListen: number, listener: ListenerFn, options?: boolean | OnOptions): this | Listener {
    return super.prependMany(eventName, timesToListen, listener, options)
  }

  public onAny(listener: EventAndListener<any>): this {
    return super.onAny(listener as any)
  }

  public prependAny(listener: EventAndListener<any>): this {
    return super.prependAny(listener as any)
  }

  public offAny(listener: ListenerFn): this {
    return super.offAny(listener)
  }

  public removeListener<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>): this
  public removeListener(eventName: string, listener: ListenerFn): this
  public removeListener(eventName: event | eventNS, listener: ListenerFn): this {
    return super.removeListener(eventName, listener)
  }

  public off<K extends keyof TEventMap & string>(eventName: K, listener: ListenerFn<TEventMap[K]>): this
  public off(eventName: string, listener: ListenerFn): this
  public off(eventName: event | eventNS, listener: ListenerFn): this {
    return super.off(eventName, listener)
  }

  public removeAllListeners<K extends keyof TEventMap & string>(event?: K): this
  public removeAllListeners(event?: string): this
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

  public listenerCount<K extends keyof TEventMap & string>(event?: K): number
  public listenerCount(event?: string): number
  public listenerCount(event?: event | eventNS): number {
    return super.listenerCount(event)
  }

  public listeners<K extends keyof TEventMap & string>(event?: K): ListenerFn<TEventMap[K]>[]
  public listeners(event?: string): ListenerFn[]
  public listeners(event?: event | eventNS): ListenerFn[] {
    return super.listeners(event)
  }

  public listenersAny(): ListenerFn[] {
    return super.listenersAny()
  }

  public waitFor<K extends keyof TEventMap & string>(eventName: K, timeout?: number): CancelablePromise<EmittedEvent<TEventMap[K]>[]>
  public waitFor<K extends keyof TEventMap & string>(eventName: K, filter?: WaitForFilter<TEventMap[K]>): CancelablePromise<EmittedEvent<TEventMap[K]>[]>
  public waitFor<K extends keyof TEventMap & string>(eventName: K, options?: WaitForOptions): CancelablePromise<EmittedEvent<TEventMap[K]>[]>
  public waitFor(eventName: string, timeout?: number): CancelablePromise<any[]>
  public waitFor(eventName: string, filter?: WaitForFilter): CancelablePromise<any[]>
  public waitFor(eventName: string, options?: WaitForOptions): CancelablePromise<any[]>
  public waitFor(eventName: event | eventNS, right?: number | WaitForFilter | WaitForOptions): CancelablePromise<any[]> {
    return super.waitFor(eventName, right as any)
  }

  public listenTo(target: GeneralEventEmitter, events: event | eventNS, options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: event[], options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: Object, options?: ListenToOptions): this
  public listenTo(target: GeneralEventEmitter, events: event | eventNS | event[] | Object, options?: ListenToOptions): this {
    return super.listenTo(target as any, events, options)
  }

  public stopListeningTo(target?: GeneralEventEmitter, event?: event | eventNS): Boolean {
    return super.stopListeningTo(target as any, event)
  }

  public hasListeners<K extends keyof TEventMap & string>(event?: K): Boolean
  public hasListeners(event?: String): Boolean {
    return super.hasListeners(event)
  }

  public static once(emitter: EventEmitter, event: event | eventNS, options?: OnceOptions): CancelablePromise<any[]> {
    return super.once(emitter, event, options)
  }
}
