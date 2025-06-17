import { GetTargetsResult, PathMatcher } from '@universal-packages/path-matcher'

import {
  CancelablePromise,
  CombinedEventMap,
  ConditionalEmittedEvent,
  ConditionalEventIn,
  DefaultEventMap,
  EmittedEvent,
  EventEmitterOptions,
  EventIn,
  EventNames,
  EventPayload,
  ListenerFn,
  TypedListenerFn
} from './EventEmitter.types'

export class EventEmitter<TEventMap = DefaultEventMap> {
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

  // Overload for single event name
  public emit<TEventName extends EventNames<TEventMap>>(eventName: TEventName, event: ConditionalEventIn<EventPayload<TEventMap, TEventName>>): boolean
  // Overload for array of event names - payload is always EventIn<any>
  public emit<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], event: EventIn<any>): boolean
  public emit<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    event: ConditionalEventIn<EventPayload<TEventMap, TEventName>> | EventIn<any>
  ): boolean {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: ConditionalEmittedEvent<EventPayload<TEventMap, TEventName>> = {
        event: result.matcher,
        ...event
      } as ConditionalEmittedEvent<EventPayload<TEventMap, TEventName>>

      try {
        result.target(emittedEvent)
      } catch (error) {
        if (result.matcher === 'error') {
          if (!this.options.ignoreErrors) {
            throw error
          }
        }

        const errorEmitted = this._emitInternal('error', {
          error: error as Error,
          ...emittedEvent
        })

        if (!errorEmitted && !this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  // Overload for single event name
  public async emitAsync<TEventName extends EventNames<TEventMap>>(eventName: TEventName, event: ConditionalEventIn<EventPayload<TEventMap, TEventName>>): Promise<boolean>
  // Overload for array of event names - payload is always EventIn<any>
  public async emitAsync<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], event: EventIn<any>): Promise<boolean>
  public async emitAsync<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    event: ConditionalEventIn<EventPayload<TEventMap, TEventName>> | EventIn<any>
  ): Promise<boolean> {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: ConditionalEmittedEvent<EventPayload<TEventMap, TEventName>> = {
        event: result.matcher,
        ...event
      } as ConditionalEmittedEvent<EventPayload<TEventMap, TEventName>>

      try {
        await result.target(emittedEvent)
      } catch (error) {
        if (result.matcher === 'error') {
          if (!this.options.ignoreErrors) {
            throw error
          }
        }

        const errorEmitted = await this._emitAsyncInternal('error', {
          error: error as Error,
          ...emittedEvent
        })

        if (!errorEmitted && !this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  // Overload for single event name
  public addListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public addListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public addListener<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._pathMatcher.addTarget(name as string, listener as ListenerFn)
        this._emitNewListenerEvent(name as string, listener as ListenerFn)
        this._checkMemoryLeak(name as string)
      }
      return this
    }

    this._pathMatcher.addTarget(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  // Overload for single event name
  public on<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public on<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public on<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    return this.addListener(eventName as any, listener as any)
  }

  // Overload for single event name
  public prependListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public prependListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public prependListener<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._pathMatcher.prependTarget(name as string, listener as ListenerFn)
        this._emitNewListenerEvent(name as string, listener as ListenerFn)
        this._checkMemoryLeak(name as string)
      }
      return this
    }

    this._pathMatcher.prependTarget(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  // Overload for single event name
  public once<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public once<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public once<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._pathMatcher.addTargetOnce(name as string, listener as ListenerFn)
        this._emitNewListenerEvent(name as string, listener as ListenerFn)
        this._checkMemoryLeak(name as string)
      }
      return this
    }

    this._pathMatcher.addTargetOnce(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  // Overload for single event name
  public prependOnceListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public prependOnceListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public prependOnceListener<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._pathMatcher.prependTargetOnce(name as string, listener as ListenerFn)
        this._emitNewListenerEvent(name as string, listener as ListenerFn)
        this._checkMemoryLeak(name as string)
      }
      return this
    }

    this._pathMatcher.prependTargetOnce(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  // Overload for single event name
  public removeListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public removeListener<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public removeListener<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    this._pathMatcher.removeTarget(eventName as string, listener as ListenerFn)
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this._emitRemoveListenerEvents([{ matcher: name, target: listener as ListenerFn }])
      }
    } else {
      this._emitRemoveListenerEvents([{ matcher: eventName as string, target: listener as ListenerFn }])
    }

    return this
  }

  // Overload for single event name
  public off<TEventName extends EventNames<TEventMap>>(eventName: TEventName, listener: TypedListenerFn<TEventMap, TEventName>): this
  // Overload for array of event names - listener takes EmittedEvent<any>
  public off<TEventName extends EventNames<TEventMap>>(eventName: TEventName[], listener: (event: EmittedEvent<any>) => any | Promise<any>): this
  public off<TEventName extends EventNames<TEventMap>>(
    eventName: TEventName | TEventName[],
    listener: TypedListenerFn<TEventMap, TEventName> | ((event: EmittedEvent<any>) => any | Promise<any>)
  ): this {
    return this.removeListener(eventName as any, listener as any)
  }

  public removeAllListeners<TEventName extends EventNames<TEventMap>>(eventName?: TEventName | TEventName[]): this {
    let targetsRemoved: GetTargetsResult<ListenerFn>[] = []

    if (this.options.removeListenerEvent) {
      targetsRemoved = this._pathMatcher.getTargets(eventName as string)
    }

    this._pathMatcher.removeAllTargets(eventName as string)

    this._emitRemoveListenerEvents(targetsRemoved)

    return this
  }

  public waitFor<TEventName extends EventNames<TEventMap>>(eventName: TEventName): CancelablePromise<EmittedEvent<EventPayload<TEventMap, TEventName>>> {
    let cancelled = false
    let promiseResolve: (value: EmittedEvent<EventPayload<TEventMap, TEventName>>) => void
    let promiseReject: (reason?: any) => void

    const listener = (event: EmittedEvent<EventPayload<TEventMap, TEventName>>) => {
      if (!cancelled) promiseResolve!(event)
    }

    const promise = new Promise<EmittedEvent<EventPayload<TEventMap, TEventName>>>((resolve, reject) => {
      promiseReject = reject
      promiseResolve = resolve

      this.once(eventName, listener as TypedListenerFn<TEventMap, TEventName>)
    }) as CancelablePromise<EmittedEvent<EventPayload<TEventMap, TEventName>>>

    promise.cancel = (reason: string) => {
      cancelled = true
      this.removeListener(eventName, listener as TypedListenerFn<TEventMap, TEventName>)
      promiseReject(new Error(reason))
      return undefined
    }

    return promise
  }

  public hasListeners<TEventName extends EventNames<TEventMap>>(eventName?: TEventName | TEventName[]): boolean {
    if (!eventName) return this._pathMatcher.targetsCount > 0

    if (Array.isArray(eventName)) {
      return this._pathMatcher.hasMatchers(eventName as string[])
    } else {
      return this._pathMatcher.hasMatchers([eventName as string])
    }
  }

  // Internal method for emitting internal events
  private _emitInternal<TEventName extends EventNames<CombinedEventMap<TEventMap>>>(
    eventName: TEventName,
    event?: EventIn<EventPayload<CombinedEventMap<TEventMap>, TEventName>>
  ): boolean {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent<EventPayload<CombinedEventMap<TEventMap>, TEventName>> = {
        event: result.matcher,
        ...event
      }

      try {
        result.target(emittedEvent)
      } catch (error) {
        // For internal events, we don't want to recurse into error handling
        if (!this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  // Internal method for emitting internal events async
  private async _emitAsyncInternal<TEventName extends EventNames<CombinedEventMap<TEventMap>>>(
    eventName: TEventName,
    event?: EventIn<EventPayload<CombinedEventMap<TEventMap>, TEventName>>
  ): Promise<boolean> {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent<EventPayload<CombinedEventMap<TEventMap>, TEventName>> = {
        event: result.matcher,
        ...event
      }

      try {
        await result.target(emittedEvent)
      } catch (error) {
        // For internal events, we don't want to recurse into error handling
        if (!this.options.ignoreErrors) {
          throw error
        }
      }
    }

    return true
  }

  private _emitRemoveListenerEvents(targetsRemoved: GetTargetsResult<ListenerFn>[]): void {
    if (this.options.removeListenerEvent) {
      for (const target of targetsRemoved) {
        this._emitInternal('emitter-remove-listener', {
          message: `Listener removed from event "${target.matcher}"`,
          payload: { matcher: target.matcher, target: target.target } as any
        })
      }
    }
  }

  private _emitNewListenerEvent(eventName: string, listener: ListenerFn): void {
    if (this.options.newListenerEvent) {
      this._emitInternal('emitter-new-listener', {
        message: `New listener added to event "${eventName}"`,
        payload: { eventName, listener } as any
      })
    }
  }

  private _checkMemoryLeak(eventName: string): void {
    if (this.options.maxListeners! > 0 && this.options.verboseMemoryLeak) {
      const listenerCount = this._pathMatcher.getTargetsCount(eventName)

      if (listenerCount > this.maxListeners) {
        const message = `Possible EventEmitter memory leak detected. ${listenerCount} listeners added to event "${eventName}". Use emitter.maxListeners to increase limit.`
        this._emitInternal('emitter-memory-leak', {
          message,
          payload: { eventName, listenerCount, maxListeners: this.maxListeners } as any
        })
        console.warn(message)
      }
    }
  }
}
