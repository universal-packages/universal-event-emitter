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

// Default event map for when no type is specified
export interface DefaultEventMap {
  [eventName: string]: any
}

// Internal emitter events
export interface InternalEventMap {
  'emitter-new-listener': { eventName: string; listener: ListenerFn<any> }
  'emitter-remove-listener': { matcher: string; target: ListenerFn<any> }
  'emitter-memory-leak': { eventName: string; listenerCount: number; maxListeners: number }
  error: any
}

// Helper type to extract event names from the event map
export type EventNames<TEventMap> = keyof TEventMap & string

// Helper type to extract payload type for a specific event
export type EventPayload<TEventMap, TEventName extends EventNames<TEventMap>> = TEventMap[TEventName]

// Combined event map that includes both user events and internal events
export type CombinedEventMap<TEventMap> = TEventMap & InternalEventMap

export interface EventIn<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: TPayload
}

// Required payload version for typed events
export interface EventInWithPayload<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload: TPayload
}

export interface EmittedEvent<TPayload = any> extends EventIn<TPayload> {
  event: string
}

// Required payload version for typed events
export interface EmittedEventWithPayload<TPayload = any> extends EventInWithPayload<TPayload> {
  event: string
}

export interface ListenerFn<TPayload = any> {
  (event: EmittedEvent<TPayload>): any | Promise<any>
}

// Check if payload is required (not undefined/null/void)
export type IsPayloadRequired<T> = T extends undefined | null | void ? false : true

// Check if TEventName is an array type
export type IsArrayEventName<TEventName> = TEventName extends readonly any[] ? true : false

// Conditional payload type - use any for arrays, specific type for single events
export type ConditionalPayload<TEventMap, TEventName extends EventNames<TEventMap> | EventNames<TEventMap>[]> =
  IsArrayEventName<TEventName> extends true ? any : TEventName extends EventNames<TEventMap> ? EventPayload<TEventMap, TEventName> : never

// Conditional type for events with required vs optional payload
export type ConditionalEventIn<TPayload> = IsPayloadRequired<TPayload> extends true ? EventInWithPayload<TPayload> : EventIn<TPayload>

export type ConditionalEmittedEvent<TPayload> = IsPayloadRequired<TPayload> extends true ? EmittedEventWithPayload<TPayload> : EmittedEvent<TPayload>

// Typed listener function for specific event
export type TypedListenerFn<TEventMap, TEventName extends EventNames<TEventMap>> = (event: ConditionalEmittedEvent<EventPayload<TEventMap, TEventName>>) => any | Promise<any>

export interface CancelablePromise<T> extends Promise<T> {
  cancel(reason: string): undefined
}
