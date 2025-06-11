import { GetTargetsResult, PathMatcher } from '@universal-packages/path-matcher'

import { CancelablePromise, EEMap, EmittedEvent, EventEmitterOptions, EventIn, ListenerFn, TypedEmittedEvent, TypedEventIn, TypedListenerFn } from './EventEmitter.types'

export class EventEmitter<EM extends EEMap = EEMap> {
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

  public emit<K extends keyof EM & string>(eventName: K, event?: TypedEventIn<EM[K]>): boolean
  public emit(eventName: (keyof EM)[], event?: EventIn): boolean
  public emit<K extends keyof EM>(eventName: K | keyof EM[], event?: EventIn | TypedEventIn<EM[K]>): boolean {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent = {
        event: result.matcher,
        ...event
      }

      try {
        result.target(emittedEvent)
      } catch (error) {
        if (result.matcher === 'error') {
          if (!this.options.ignoreErrors) {
            throw error
          }
        }

        const errorEmitted = this.emit('error' as any, {
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

  public async emitAsync<K extends keyof EM>(eventName: K, event: TypedEventIn<EM[K]>): Promise<boolean>
  public async emitAsync(eventName: (keyof EM)[], event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: string, event?: EventIn): Promise<boolean>
  public async emitAsync(eventName: string[], event?: EventIn): Promise<boolean>
  public async emitAsync<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], event?: EventIn | TypedEventIn<EM[K]>): Promise<boolean> {
    const results = this._pathMatcher.match(eventName as string)

    if (results.length === 0) return false

    for (const result of results) {
      const emittedEvent: EmittedEvent = {
        event: result.matcher,
        ...event
      }

      try {
        await result.target(emittedEvent)
      } catch (error) {
        if (result.matcher === 'error') {
          if (!this.options.ignoreErrors) {
            throw error
          }
        }

        const errorEmitted = await this.emitAsync('error' as any, {
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

  public addListener<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public addListener(eventName: (keyof EM)[], listener: ListenerFn): this
  public addListener(eventName: string, listener: ListenerFn): this
  public addListener(eventName: string[], listener: ListenerFn): this
  public addListener<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.addListener(name, listener as ListenerFn)
      }
      return this
    }

    this._pathMatcher.addTarget(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  public on<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public on(eventName: (keyof EM)[], listener: ListenerFn): this
  public on(eventName: string, listener: ListenerFn): this
  public on(eventName: string[], listener: ListenerFn): this
  public on<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    return this.addListener(eventName as string, listener as ListenerFn)
  }

  public prependListener<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public prependListener(eventName: (keyof EM)[], listener: ListenerFn): this
  public prependListener(eventName: string, listener: ListenerFn): this
  public prependListener(eventName: string[], listener: ListenerFn): this
  public prependListener<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.prependListener(name, listener as ListenerFn)
      }
      return this
    }

    this._pathMatcher.prependTarget(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  public once<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public once(eventName: (keyof EM)[], listener: ListenerFn): this
  public once(eventName: string, listener: ListenerFn): this
  public once(eventName: string[], listener: ListenerFn): this
  public once<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.once(name, listener as ListenerFn)
      }
      return this
    }

    this._pathMatcher.addTargetOnce(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  public prependOnceListener<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public prependOnceListener(eventName: (keyof EM)[], listener: ListenerFn): this
  public prependOnceListener(eventName: string, listener: ListenerFn): this
  public prependOnceListener(eventName: string[], listener: ListenerFn): this
  public prependOnceListener<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    if (Array.isArray(eventName)) {
      for (const name of eventName) {
        this.prependOnceListener(name, listener as ListenerFn)
      }
      return this
    }

    this._pathMatcher.prependTargetOnce(eventName as string, listener as ListenerFn)
    this._emitNewListenerEvent(eventName as string, listener as ListenerFn)
    this._checkMemoryLeak(eventName as string)
    return this
  }

  public removeListener<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public removeListener(eventName: (keyof EM)[], listener: ListenerFn): this
  public removeListener(eventName: string, listener: ListenerFn): this
  public removeListener(eventName: string[], listener: ListenerFn): this
  public removeListener<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
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

  public off<K extends keyof EM>(eventName: K, listener: TypedListenerFn<EM[K]>): this
  public off(eventName: (keyof EM)[], listener: ListenerFn): this
  public off(eventName: string, listener: ListenerFn): this
  public off(eventName: string[], listener: ListenerFn): this
  public off<K extends keyof EM>(eventName: K | keyof EM[] | string | string[], listener: ListenerFn | TypedListenerFn<EM[K]>): this {
    return this.removeListener(eventName as string, listener as ListenerFn)
  }

  public removeAllListeners<K extends keyof EM>(eventName: K): this
  public removeAllListeners(eventName: (keyof EM)[]): this
  public removeAllListeners(eventName: string): this
  public removeAllListeners(eventName: string[]): this
  public removeAllListeners<K extends keyof EM>(eventName: K | keyof EM[] | string | string[]): this {
    let targetsRemoved: GetTargetsResult<ListenerFn>[] = []

    if (this.options.removeListenerEvent) {
      targetsRemoved = this._pathMatcher.getTargets(eventName as string)
    }

    this._pathMatcher.removeAllTargets(eventName as string)

    this._emitRemoveListenerEvents(targetsRemoved)

    return this
  }

  public waitFor<K extends keyof EM>(eventName: K): CancelablePromise<TypedEmittedEvent<EM[K]>>
  public waitFor(eventName: string): CancelablePromise<EmittedEvent>
  public waitFor<K extends keyof EM>(eventName: K | string): CancelablePromise<TypedEmittedEvent<EM[K]>> {
    let cancelled = false
    let promiseResolve: (value: TypedEmittedEvent<EM[K]>) => void
    let promiseReject: (reason?: any) => void

    const listener = (event: TypedEmittedEvent<EM[K]>) => {
      if (!cancelled) promiseResolve!(event)
    }

    const promise = new Promise<TypedEmittedEvent<EM[K]>>((resolve, reject) => {
      promiseReject = reject
      promiseResolve = resolve

      this.once(eventName as string, listener as ListenerFn)
    }) as CancelablePromise<TypedEmittedEvent<EM[K]>>

    promise.cancel = (reason: string) => {
      cancelled = true
      this.removeListener(eventName as string, listener as ListenerFn)
      promiseReject(new Error(reason))
      return undefined
    }

    return promise
  }

  public hasListeners<K extends keyof EM>(eventName: K): boolean
  public hasListeners(eventName: string): boolean
  public hasListeners(eventName: string[]): boolean
  public hasListeners<K extends keyof EM>(eventName: K | string | string[]): boolean {
    if (!eventName) return this._pathMatcher.targetsCount > 0

    if (Array.isArray(eventName)) {
      return this._pathMatcher.hasMatchers(eventName as string[])
    } else {
      return this._pathMatcher.hasMatchers([eventName as string])
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
