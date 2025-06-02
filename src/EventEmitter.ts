import {
  CancelablePromise,
  DefaultEventMap,
  EmittedEvent,
  EventEmitterOptions,
  EventIn,
  EventMap,
  EventName,
  EventNames,
  ListenerFn,
  ListenerRecord,
  TypedEmittedEvent,
  TypedEventIn,
  TypedListenerFn
} from './EventEmitter.types'

export class EventEmitter<TEventMap extends EventMap = DefaultEventMap> {
  public readonly options: EventEmitterOptions

  private _maxListeners: number
  private _listeners: Map<string, ListenerRecord[]> = new Map()

  public get maxListeners(): number {
    return this._maxListeners
  }

  public set maxListeners(value: number) {
    this._maxListeners = value
  }

  public get eventNames(): EventNames {
    return Array.from(this._listeners.keys())
  }

  public get listenerCount(): number {
    let count = 0
    for (const listeners of this._listeners.values()) {
      count += listeners.length
    }
    return count
  }

  public get listeners(): ListenerFn[] {
    const allListeners: ListenerFn[] = []
    for (const listenerRecords of this._listeners.values()) {
      for (const record of listenerRecords) {
        allListeners.push(record.listener)
      }
    }
    return allListeners
  }

  public constructor(options?: EventEmitterOptions) {
    this.options = {
      wildcard: true,
      delimiter: ':',
      ignoreErrors: true,
      maxListeners: 20,
      newListenerEvent: true,
      removeListenerEvent: false,
      verboseMemoryLeak: true,
      ...options
    }
    this._maxListeners = this.options.maxListeners || 20
  }

  public emit<K extends keyof TEventMap & string>(eventName: K, event: TypedEventIn<TEventMap[K]>): boolean
  public emit(eventName: EventName | EventNames, event?: EventIn): boolean
  public emit(eventName: EventName | EventNames, event?: EventIn): boolean {
    if (Array.isArray(eventName)) {
      let emitted = false
      for (const name of eventName) {
        if (this.emitSingle(name, event)) {
          emitted = true
        }
      }
      return emitted
    }

    return this.emitSingle(eventName, event)
  }

  public async emitAsync<K extends keyof TEventMap & string>(eventName: K, event: TypedEventIn<TEventMap[K]>): Promise<boolean>
  public async emitAsync(eventName: string, event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: string[], event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: EventName | EventNames, event?: EventIn): Promise<boolean> {
    if (Array.isArray(eventName)) {
      let emitted = false
      for (const name of eventName) {
        if (await this.emitAsyncSingle(name, event)) {
          emitted = true
        }
      }
      return emitted
    }

    return this.emitAsyncSingle(eventName, event)
  }

  public addListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public addListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public addListener(eventName: string, listener: ListenerFn): this
  public addListener(eventName: string[], listener: ListenerFn): this
  public addListener(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListenerInternal(eventName, listener as ListenerFn, false, false)
  }

  public on<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public on<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public on(eventName: string, listener: ListenerFn): this
  public on(eventName: string[], listener: ListenerFn): this
  public on(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListener(eventName as any, listener as any)
  }

  public prependListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public prependListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public prependListener(eventName: string, listener: ListenerFn): this
  public prependListener(eventName: string[], listener: ListenerFn): this
  public prependListener(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListenerInternal(eventName, listener as ListenerFn, false, true)
  }

  public once<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public once<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public once(eventName: string, listener: ListenerFn): this
  public once(eventName: string[], listener: ListenerFn): this
  public once(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListenerInternal(eventName, listener as ListenerFn, true, false)
  }

  public prependOnceListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public prependOnceListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public prependOnceListener(eventName: string, listener: ListenerFn): this
  public prependOnceListener(eventName: string[], listener: ListenerFn): this
  public prependOnceListener(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListenerInternal(eventName, listener as ListenerFn, true, true)
  }

  public removeListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public removeListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public removeListener(eventName: string, listener: ListenerFn): this
  public removeListener(eventName: string[], listener: ListenerFn): this
  public removeListener(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.removeListenerSingle(name, listener as ListenerFn)
      }
      return this
    }

    this.removeListenerSingle(eventName, listener as ListenerFn)
    return this
  }

  public off<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public off<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public off(eventName: string, listener: ListenerFn): this
  public off(eventName: string[], listener: ListenerFn): this
  public off(eventName: EventName | EventNames, listener: ListenerFn | TypedListenerFn<any>): this {
    return this.removeListener(eventName as any, listener as any)
  }

  public removeAllListeners<K extends keyof TEventMap & string>(event?: K): this
  public removeAllListeners<K extends keyof TEventMap & string>(event?: K[]): this
  public removeAllListeners(event?: string): this
  public removeAllListeners(event?: string[]): this
  public removeAllListeners(event?: EventName | EventNames): this {
    if (event === undefined) {
      this._listeners.clear()
      return this
    }

    if (Array.isArray(event)) {
      for (const name of event) {
        this.removeAllListenersSingle(name)
      }
      return this
    }

    this.removeAllListenersSingle(event)
    return this
  }

  public waitFor<K extends keyof TEventMap & string>(eventName: K): CancelablePromise<TypedEmittedEvent<TEventMap[K]>>
  public waitFor(eventName: string): CancelablePromise<EmittedEvent>
  public waitFor(eventName: EventName): CancelablePromise<EmittedEvent> {
    let cancelled = false
    let rejectPromise: (reason?: any) => void

    const promise = new Promise<EmittedEvent>((resolve, reject) => {
      rejectPromise = reject

      const listener = (event: EmittedEvent) => {
        if (!cancelled) {
          this.removeListenerSingle(eventName, listener as any)
          resolve(event)
        }
      }

      this.addOnceSingle(eventName, listener as any)
    }) as CancelablePromise<EmittedEvent>

    promise.cancel = (reason: string) => {
      cancelled = true
      this.removeAllListenersSingle(eventName)
      rejectPromise(new Error(reason))
      return undefined
    }

    return promise
  }

  public hasListeners<K extends keyof TEventMap & string>(event?: K): Boolean
  public hasListeners(event?: String): Boolean {
    if (event === undefined) {
      return this._listeners.size > 0
    }

    const eventNameStr = String(event)

    if (this.options.wildcard && eventNameStr.includes('*')) {
      for (const key of this._listeners.keys()) {
        if (this.matchesPattern(key, eventNameStr)) {
          const listeners = this._listeners.get(key)
          if (listeners && listeners.length > 0) {
            return true
          }
        }
      }
      return false
    }

    const listeners = this._listeners.get(eventNameStr)
    return Boolean(listeners && listeners.length > 0)
  }

  private emitSingle(eventName: EventName, event?: EventIn): boolean {
    const eventNameStr = String(eventName)
    const matchingListeners = this.getMatchingListeners(eventNameStr)

    if (matchingListeners.length === 0) {
      if (eventNameStr === 'error' && !this.options.ignoreErrors) {
        throw event?.error || new Error('Unhandled error event')
      }
      return false
    }

    const emittedEvent: EmittedEvent = {
      event: eventNameStr,
      ...event
    }

    // Create a copy to handle once listeners removal during iteration
    const listenersToCall = [...matchingListeners]

    for (const { listener, once, eventPattern } of listenersToCall) {
      try {
        listener(emittedEvent)
        if (once) {
          this.removeSpecificListener(eventPattern, listener)
        }
      } catch (error) {
        if (!this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  private async emitAsyncSingle(eventName: EventName, event?: EventIn): Promise<boolean> {
    const eventNameStr = String(eventName)
    const matchingListeners = this.getMatchingListeners(eventNameStr)

    if (matchingListeners.length === 0) {
      if (eventNameStr === 'error' && !this.options.ignoreErrors) {
        throw event?.error || new Error('Unhandled error event')
      }
      return false
    }

    const emittedEvent: EmittedEvent = {
      event: eventNameStr,
      ...event
    }

    const listenersToCall = [...matchingListeners]

    for (const { listener, once, eventPattern } of listenersToCall) {
      if (once) {
        this.removeSpecificListener(eventPattern, listener)
      }

      await listener(emittedEvent)
    }

    return listenersToCall.length > 0
  }

  private removeListenerSingle(eventName: EventName, listener: ListenerFn): void {
    const eventNameStr = String(eventName)
    this.removeSpecificListener(eventNameStr, listener)

    if (this.options.removeListenerEvent) {
      this.emitSingle('removeListener', { payload: { eventName: eventNameStr, listener } })
    }
  }

  private removeAllListenersSingle(event: EventName): void {
    const eventNameStr = String(event)

    if (this.options.wildcard && eventNameStr.includes('*')) {
      // Remove all listeners that match the wildcard pattern
      const keysToRemove: string[] = []
      for (const key of this._listeners.keys()) {
        if (this.matchesPattern(key, eventNameStr)) {
          keysToRemove.push(key)
        }
      }
      for (const key of keysToRemove) {
        this._listeners.delete(key)
      }
    } else {
      this._listeners.delete(eventNameStr)
    }
  }

  private addOnceSingle(eventName: EventName, listener: ListenerFn): void {
    const eventNameStr = String(eventName)

    if (!this._listeners.has(eventNameStr)) {
      this._listeners.set(eventNameStr, [])
    }

    const listeners = this._listeners.get(eventNameStr)!
    const listenerRecord: ListenerRecord = { listener, once: true }
    listeners.push(listenerRecord)
  }

  private addListenerInternal(eventName: EventName | EventNames, listener: ListenerFn, once: boolean, prepend: boolean): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.addListenerSingle(name, listener, once, prepend)
      }
      return this
    }

    this.addListenerSingle(eventName, listener, once, prepend)
    return this
  }

  private addListenerSingle(eventName: EventName, listener: ListenerFn, once: boolean, prepend: boolean): void {
    const eventNameStr = String(eventName)

    if (!this._listeners.has(eventNameStr)) {
      this._listeners.set(eventNameStr, [])
    }

    const listeners = this._listeners.get(eventNameStr)!
    const listenerRecord: ListenerRecord = { listener, once }

    if (prepend) {
      listeners.unshift(listenerRecord)
    } else {
      listeners.push(listenerRecord)
    }

    // Check memory leak
    if (listeners.length > this.maxListeners && this.options.verboseMemoryLeak) {
      console.warn(`Warning: Potential memory leak detected. ${listeners.length} listeners added for event "${eventNameStr}". Use setMaxListeners to increase limit.`)
    }

    if (this.options.newListenerEvent) {
      this.emitSingle('newListener', { payload: { eventName: eventNameStr, listener } })
    }
  }

  private removeSpecificListener(eventPattern: string, listener: ListenerFn): void {
    const listeners = this._listeners.get(eventPattern)
    if (!listeners) return

    for (let i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i].listener === listener) {
        listeners.splice(i, 1)
      }
    }

    if (listeners.length === 0) {
      this._listeners.delete(eventPattern)
    }
  }

  private getMatchingListeners(eventName: string): Array<{ listener: ListenerFn; once: boolean; eventPattern: string }> {
    const matchingListeners: Array<{ listener: ListenerFn; once: boolean; eventPattern: string }> = []

    for (const [pattern, listenerRecords] of this._listeners.entries()) {
      if (this.matchesPattern(eventName, pattern)) {
        for (const record of listenerRecords) {
          matchingListeners.push({
            listener: record.listener,
            once: record.once,
            eventPattern: pattern
          })
        }
      }
    }

    return matchingListeners
  }

  private matchesPattern(eventName: string, pattern: string): boolean {
    // Exact match
    if (eventName === pattern) {
      return true
    }

    // Wildcard support
    if (this.options.wildcard) {
      // Match all events with *
      if (pattern === '*') {
        return true
      }

      // Pattern matching with wildcards
      if (pattern.includes('*')) {
        return this.matchesWildcardPattern(eventName, pattern)
      }
    }

    return false
  }

  private matchesWildcardPattern(eventName: string, pattern: string): boolean {
    const delimiter = this.options.delimiter!

    // Handle ** for recursive matching (matches across multiple levels)
    if (pattern.includes('**')) {
      const regexPattern = pattern
        .split('**')
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*')

      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(eventName)
    }

    // Handle single * for single level matching
    if (pattern.includes('*')) {
      // Split both pattern and event name by delimiter
      const patternParts = pattern.split(delimiter)
      const eventParts = eventName.split(delimiter)

      // If pattern has more parts than event, it can't match
      if (patternParts.length !== eventParts.length) {
        return false
      }

      // Check each part
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i]
        const eventPart = eventParts[i]

        if (patternPart === '*') {
          // Wildcard matches any single part
          continue
        } else if (patternPart === eventPart) {
          // Exact match for this part
          continue
        } else if (patternPart.includes('*')) {
          // Partial wildcard within a part (e.g., "user*" matches "userAdmin")
          const regexPattern = patternPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')

          const regex = new RegExp(`^${regexPattern}$`)
          if (!regex.test(eventPart)) {
            return false
          }
        } else {
          // No match for this part
          return false
        }
      }

      return true
    }

    return false
  }
}
