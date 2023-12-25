import { Measurement } from '@universal-packages/time-measurer'
import { event, eventNS } from 'eventemitter2'

import EventEmitter from './EventEmitter'

export interface EventIn {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: Record<string, any>
}

export interface EventOut extends EventIn {
  event: string
}

export interface ListenerFn {
  (event?: EventOut): void
}
export interface EventAndListener {
  (eventName: string | string[], event?: EventIn): void
}

export interface WaitForFilter {
  (event?: EventOut): boolean
}

export interface WaitForOptions {
  timeout: number
  filter: WaitForFilter
  handleError: boolean
  Promise: Function
  overload: boolean
}

export interface ListenToOptions {
  on?: { (event: event | eventNS, handler: ListenerFn): void }
  off?: { (event: event | eventNS, handler: ListenerFn): void }
  reducers: Function | Object
}

export interface GeneralEventEmitter {
  addEventListener(event: event, handler: ListenerFn): this
  removeEventListener(event: event, handler: ListenerFn): this
  addListener?(event: event, handler: ListenerFn): this
  removeListener?(event: event, handler: ListenerFn): this
  on?(event: event, handler: ListenerFn): this
  off?(event: event, handler: ListenerFn): this
}

export interface Listener {
  emitter: EventEmitter
  event: event | eventNS
  listener: ListenerFn
  off(): this
}
