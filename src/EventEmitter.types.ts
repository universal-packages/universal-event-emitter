import { Measurement } from '@universal-packages/time-measurer'
import { event, eventNS } from 'eventemitter2'

import { EventEmitter } from './EventEmitter'

export interface EventIn<TPayload = any> {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: TPayload
}

export interface EmittedEvent<TPayload = any> extends EventIn<TPayload> {
  event: string
}

export interface ListenerFn<TPayload = any> {
  (event?: EmittedEvent<TPayload>): void
}

export interface EventAndListener<TPayload = any> {
  (eventName: string | string[], event?: EventIn<TPayload>): void
}

export interface WaitForFilter<TPayload = any> {
  (event?: EmittedEvent<TPayload>): boolean
}

export interface WaitForOptions {
  timeout: number
  filter: WaitForFilter
  handleError: boolean
  Promise: Function
  overload: boolean
}

export interface ListenToOptions<TPayload = any> {
  on?: { (event: event | eventNS, handler: ListenerFn<TPayload>): void }
  off?: { (event: event | eventNS, handler: ListenerFn<TPayload>): void }
  reducers: Function | Object
}

export interface GeneralEventEmitter<TPayload = any> {
  addEventListener?(event: event, handler: ListenerFn<TPayload>): this
  removeEventListener?(event: event, handler: ListenerFn<TPayload>): this
  addListener?(event: event, handler: ListenerFn<TPayload>): this
  removeListener?(event: event, handler: ListenerFn<TPayload>): this
  on?(event: event, handler: ListenerFn<TPayload>): this
  off?(event: event, handler: ListenerFn<TPayload>): this
}

export interface Listener<TPayload = any> {
  emitter: EventEmitter
  event: event | eventNS
  listener: ListenerFn<TPayload>
  off(): this
}

// Event map type for defining event names and their payload types
export type EventMap = Record<string, any>

// Default event map for backward compatibility
export type DefaultEventMap = Record<string, any>
