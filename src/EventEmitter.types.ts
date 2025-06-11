import { Measurement } from '@universal-packages/time-measurer'

export interface EventEmitterOptions {
  delimiter?: string
  maxListeners?: number
  useWildcards?: boolean
  newListenerEvent?: boolean
  removeListenerEvent?: boolean
  verboseMemoryLeak?: boolean
  ignoreErrors?: boolean
}

export interface EventIn<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: TPayload
}

export interface TypedEventIn<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload: TPayload
}

export interface EmittedEvent<TPayload = any> extends EventIn<TPayload> {
  event: string
}

export interface TypedEmittedEvent<TPayload = any> extends TypedEventIn<TPayload> {
  event: string
}

export interface ListenerFn<TPayload = any> {
  (event: EmittedEvent<TPayload>): any | Promise<any>
}

export interface TypedListenerFn<TPayload = any> {
  (event: TypedEmittedEvent<TPayload>): any | Promise<any>
}

export interface EEMap {
  error: any
  'emitter-memory-leak': { eventName: string; listenerCount: number; maxListeners: number }
  'emitter-new-listener': { eventName: string; listener: ListenerFn }
  'emitter-remove-listener': { matcher: string; target: ListenerFn }
}

export interface CancelablePromise<T> extends Promise<T> {
  cancel(reason: string): undefined
}
