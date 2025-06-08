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

// Base interface for events - keeps payload optional for dynamic events
export interface EventIn<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: TPayload
}

// Specific interface for typed events where payload is required
export interface TypedEventIn<TPayload> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload: TPayload
}

export interface EmittedEvent<TPayload = any> extends EventIn<TPayload> {
  event: string
}

// Specific interface for typed emitted events where payload is required
export interface TypedEmittedEvent<TPayload> extends TypedEventIn<TPayload> {
  event: string
}

export interface ListenerFn<TPayload = any> {
  (event: EmittedEvent<TPayload>): any | Promise<any>
}

// Specific listener function for typed events
export interface TypedListenerFn<TPayload> {
  (event: TypedEmittedEvent<TPayload>): any | Promise<any>
}

// Event map type for defining event names and their payload types
export type EventMap = Record<string, any>

// Default event map for backward compatibility
export type DefaultEventMap = Record<string, any>

export interface CancelablePromise<T> extends Promise<T> {
  cancel(reason: string): undefined
}
