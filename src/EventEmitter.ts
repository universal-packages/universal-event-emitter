import { GetTargetsResult, PathMatcher } from '@universal-packages/path-matcher'

import {
  CancelablePromise,
  DefaultEventMap,
  EmittedEvent,
  EventEmitterOptions,
  EventIn,
  EventMap,
  ListenerFn,
  TypedEmittedEvent,
  TypedEventIn,
  TypedListenerFn
} from './EventEmitter.types'

export class EventEmitter<TEventMap extends EventMap = DefaultEventMap> {
  public options: EventEmitterOptions

  private _pathMatcher: PathMatcher<ListenerFn>

  public get maxListeners(): number {
    return this.options.maxListeners!
  }

  public set maxListeners(value: number) {
    this.options.maxListeners = value
  }

  public get eventNames(): string[] {
    return this._pathMatcher.matchers
  }

  public get listenerCount(): number {
    return this._pathMatcher.targetsCount
  }

  public get listeners(): ListenerFn[] {
    return this._pathMatcher.targets
  }

  public constructor(options?: EventEmitterOptions) {
    this.options = {
      useWildcards: true,
      delimiter: ':',
      ignoreErrors: true,
      newListenerEvent: true,
      removeListenerEvent: false,
      verboseMemoryLeak: true,
      ...options,
      maxListeners: options?.maxListeners ?? 20
    }

    this._pathMatcher = new PathMatcher<ListenerFn>({
      useWildcards: this.options.useWildcards,
      levelDelimiter: this.options.delimiter
    })
  }

  public emit<K extends keyof TEventMap & string>(eventName: K, event: TypedEventIn<TEventMap[K]>): boolean
  public emit(eventName: string | string[], event?: EventIn): boolean
  public emit(eventName: string | string[], event?: EventIn): boolean {
    const results = this._pathMatcher.match(eventName)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent = {
        event: result.matcher,
        ...event
      }

      try {
        result.target(emittedEvent)
      } catch (error) {
        let errorEmitted = false
        try {
          errorEmitted = this.emit('error', {
            error: error as Error,
            ...emittedEvent
          })
        } catch (errorOnError) {
          if (!this.options.ignoreErrors) {
            throw errorOnError
          }
        }

        if (!errorEmitted && !this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  public async emitAsync<K extends keyof TEventMap & string>(eventName: K, event: TypedEventIn<TEventMap[K]>): Promise<boolean>
  public async emitAsync(eventName: string, event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: string[], event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: string | string[], event?: EventIn): Promise<boolean> {
    const results = this._pathMatcher.match(eventName)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent = {
        event: result.matcher,
        ...event
      }

      try {
        await result.target(emittedEvent)
      } catch (error) {
        let errorEmitted = false
        try {
          errorEmitted = await this.emitAsync('error', {
            error: error as Error,
            ...emittedEvent
          })
        } catch (errorOnError) {
          if (!this.options.ignoreErrors) {
            throw errorOnError
          }
        }

        if (!errorEmitted && !this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  public addListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public addListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public addListener(eventName: string, listener: ListenerFn): this
  public addListener(eventName: string[], listener: ListenerFn): this
  public addListener(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.addListener(name, listener)
      }
      return this
    }

    this._pathMatcher.addTarget(eventName, listener as ListenerFn)
    this._emitNewListenerEvent(eventName, listener as ListenerFn)
    this._checkMemoryLeak(eventName)
    return this
  }

  public on<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public on<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public on(eventName: string, listener: ListenerFn): this
  public on(eventName: string[], listener: ListenerFn): this
  public on(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    return this.addListener(eventName as string, listener)
  }

  public prependListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public prependListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public prependListener(eventName: string, listener: ListenerFn): this
  public prependListener(eventName: string[], listener: ListenerFn): this
  public prependListener(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.prependListener(name, listener)
      }
      return this
    }

    this._pathMatcher.prependTarget(eventName, listener as ListenerFn)
    this._emitNewListenerEvent(eventName, listener as ListenerFn)
    this._checkMemoryLeak(eventName)
    return this
  }

  public once<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public once<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public once(eventName: string, listener: ListenerFn): this
  public once(eventName: string[], listener: ListenerFn): this
  public once(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.once(name, listener)
      }
      return this
    }

    this._pathMatcher.addTargetOnce(eventName, listener as ListenerFn)
    this._emitNewListenerEvent(eventName, listener as ListenerFn)
    this._checkMemoryLeak(eventName)
    return this
  }

  public prependOnceListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public prependOnceListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public prependOnceListener(eventName: string, listener: ListenerFn): this
  public prependOnceListener(eventName: string[], listener: ListenerFn): this
  public prependOnceListener(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.prependOnceListener(name, listener)
      }
      return this
    }

    this._pathMatcher.prependTargetOnce(eventName, listener as ListenerFn)
    this._emitNewListenerEvent(eventName, listener as ListenerFn)
    this._checkMemoryLeak(eventName)
    return this
  }

  public removeListener<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public removeListener<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public removeListener(eventName: string, listener: ListenerFn): this
  public removeListener(eventName: string[], listener: ListenerFn): this
  public removeListener(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    this._pathMatcher.removeTarget(eventName, listener as ListenerFn)
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._emitRemoveListenerEvents([{ matcher: name, target: listener as ListenerFn }])
      }
    } else {
      this._emitRemoveListenerEvents([{ matcher: eventName, target: listener as ListenerFn }])
    }

    return this
  }

  public off<K extends keyof TEventMap & string>(eventName: K, listener: TypedListenerFn<TEventMap[K]>): this
  public off<K extends keyof TEventMap & string>(eventName: K[], listener: ListenerFn): this
  public off(eventName: string, listener: ListenerFn): this
  public off(eventName: string[], listener: ListenerFn): this
  public off(eventName: string | string[], listener: ListenerFn | TypedListenerFn<any>): this {
    return this.removeListener(eventName as string, listener as ListenerFn)
  }

  public removeAllListeners<K extends keyof TEventMap & string>(eventName?: K): this
  public removeAllListeners<K extends keyof TEventMap & string>(eventName?: K[]): this
  public removeAllListeners(eventName?: string): this
  public removeAllListeners(eventName?: string[]): this
  public removeAllListeners(eventName?: string | string[]): this {
    let targetsRemoved: GetTargetsResult<ListenerFn>[] = []

    if (this.options.removeListenerEvent) {
      targetsRemoved = this._pathMatcher.getTargets(eventName)
    }

    this._pathMatcher.removeAllTargets(eventName)

    this._emitRemoveListenerEvents(targetsRemoved)

    return this
  }

  public waitFor<K extends keyof TEventMap & string>(eventName: K): CancelablePromise<TypedEmittedEvent<TEventMap[K]>>
  public waitFor(eventName: string): CancelablePromise<EmittedEvent>
  public waitFor(eventName: string): CancelablePromise<EmittedEvent> {
    let cancelled = false
    let promiseResolve: (value: EmittedEvent) => void
    let promiseReject: (reason?: any) => void

    const listener = (event: EmittedEvent) => {
      if (!cancelled) promiseResolve!(event)
    }

    const promise = new Promise<EmittedEvent>((resolve, reject) => {
      promiseReject = reject
      promiseResolve = resolve

      this.once(eventName, listener)
    }) as CancelablePromise<EmittedEvent>

    promise.cancel = (reason: string) => {
      cancelled = true
      this.removeListener(eventName, listener)
      promiseReject(new Error(reason))
      return undefined
    }

    return promise
  }

  public hasListeners<K extends keyof TEventMap & string>(event?: K): Boolean
  public hasListeners(event?: string | string[]): Boolean {
    if (!event) return this._pathMatcher.targetsCount > 0

    if (Array.isArray(event)) {
      return this._pathMatcher.hasMatchers(event)
    } else {
      return this._pathMatcher.hasMatchers([event])
    }
  }

  private _emitRemoveListenerEvents(targetsRemoved: GetTargetsResult<ListenerFn>[]): void {
    if (this.options.removeListenerEvent) {
      for (const target of targetsRemoved) {
        this.emit('emitter-remove-listener', { message: `Listener removed from event "${target.matcher}"`, payload: { matcher: target.matcher, target: target.target } })
      }
    }
  }

  private _emitNewListenerEvent(eventName: string, listener: ListenerFn): void {
    if (this.options.newListenerEvent) {
      this.emit('emitter-new-listener', { message: `New listener added to event "${eventName}"`, payload: { eventName, listener } })
    }
  }

  private _checkMemoryLeak(eventName: string): void {
    if (this.options.maxListeners! > 0 && this.options.verboseMemoryLeak) {
      const listenerCount = this._pathMatcher.getTargetsCount(eventName)

      if (listenerCount > this.maxListeners) {
        const message = `Possible EventEmitter memory leak detected. ${listenerCount} listeners added to event "${eventName}". Use emitter.maxListeners to increase limit.`
        this.emit('emitter-memory-leak', { message, payload: { eventName, listenerCount, maxListeners: this.maxListeners } })
        console.warn(message)
      }
    }
  }
}
