import EE, { ConstructorOptions } from 'eventemitter2'

import { EventIn } from './EventEmitter.types'

export default class EventEmitter extends EE {
  public constructor(options?: ConstructorOptions) {
    super({ wildcard: true, ...options })
  }

  public emit(eventName: string | symbol, event?: EventIn): boolean {
    return super.emit(eventName, { event: eventName, ...event })
  }
}
