import { Measurement } from '@universal-packages/time-measurer'

export interface EventIn {
  error?: Error
  measurement?: Measurement
  message?: string
  payload?: Record<string, any>
}

export interface EventOut extends EventIn {
  event: string
}
