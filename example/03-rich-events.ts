/**
 * Rich Events Example
 *
 * This example demonstrates emitting and handling rich events with complex data structures:
 * - Events with detailed payloads, messages, and metadata
 * - Error events (both custom error events and error handling)
 * - Measurement tracking using the built-in measurement property
 * - Business logic events with rich context
 * - Event chaining and correlation
 * - Async event handling
 */
import { TimeMeasurer } from '@universal-packages/time-measurer'

import { EventEmitter } from '../src'

export async function richEventsExample() {
  console.log('💎 Rich Events Example\n')

  // Define interface for rich events with various data structures
  interface RichEventMap {
    'api:request': {
      method: string
      url: string
      headers: Record<string, string>
      body?: any
      requestId: string
      userId?: string
    }
    'api:response': {
      requestId: string
      statusCode: number
      responseTime: number
      size: number
      cached: boolean
    }
    'api:error': {
      requestId: string
      errorCode: string
      message: string
      stack?: string
      retryCount: number
    }
    'task:validation-complete': {
      operation: string
      requestId: string
      cacheHit: boolean
      dbQueries: number
      externalApiCalls: number
    }
    'business:order-placed': {
      orderId: string
      customerId: string
      items: Array<{ productId: string; quantity: number; price: number }>
      total: number
      currency: string
      paymentMethod: string
      shippingAddress: any
    }
    'business:payment-failed': {
      orderId: string
      customerId: string
      amount: number
      currency: string
      errorCode: string
      retryAttempt: number
      lastError: Error
    }
    'system:health-check': {
      services: Record<string, { status: 'healthy' | 'degraded' | 'down'; responseTime: number }>
      memory: { used: number; total: number; percentage: number }
      disk: { used: number; total: number; percentage: number }
      uptime: number
    }
    'system:backup-complete': {
      filesProcessed: number
      totalSize: string
      compressionRatio: number
      destination: string
      scheduleType: string
      retentionPolicy: string
    }
  }

  const emitter = new EventEmitter<RichEventMap>()

  console.log('Setting up rich event listeners...\n')

  // API Request/Response/Error tracking
  emitter.on('api:request', (event) => {
    const { method, url, requestId, userId } = event.payload
    console.log(`🌐 API Request [${requestId}]:`, {
      method,
      url,
      user: userId || 'anonymous',
      timestamp: new Date().toISOString()
    })
  })

  emitter.on('api:response', (event) => {
    const { requestId, statusCode, responseTime, size, cached } = event.payload
    const status = statusCode >= 400 ? '❌' : statusCode >= 300 ? '🔄' : '✅'
    console.log(`${status} API Response [${requestId}]:`, {
      status: statusCode,
      time: `${responseTime}ms`,
      size: `${(size / 1024).toFixed(2)}KB`,
      cached: cached ? '(cached)' : '',
      measurement: event.measurement ? event.measurement.toString() : undefined
    })
  })

  emitter.on('api:error', (event) => {
    const { requestId, errorCode, message, retryCount } = event.payload
    console.log(`💥 API Error [${requestId}]:`, {
      code: errorCode,
      message,
      attempt: retryCount,
      timestamp: new Date().toISOString(),
      errorDetails: event.error?.message
    })
  })

  // Task completion with measurement tracking
  emitter.on('task:validation-complete', (event) => {
    const { operation, requestId, cacheHit, dbQueries, externalApiCalls } = event.payload
    console.log(`⚡ Task Complete [${operation}]:`, {
      requestId,
      duration: event.measurement ? event.measurement.toString() : 'unknown',
      cacheHit,
      dbQueries,
      externalApiCalls
    })
  })

  // Business events with rich context
  emitter.on('business:order-placed', (event) => {
    const { orderId, customerId, items, total, currency } = event.payload
    console.log(`🛒 Order Placed [${orderId}]:`, {
      customer: customerId,
      items: items.length,
      total: `${total} ${currency}`,
      message: event.message,
      processingTime: event.measurement ? event.measurement.toString() : undefined
    })
  })

  emitter.on('business:payment-failed', (event) => {
    const { orderId, customerId, amount, currency, errorCode, retryAttempt, lastError } = event.payload
    console.log(`💳 Payment Failed [${orderId}]:`, {
      customer: customerId,
      amount: `${amount} ${currency}`,
      error: errorCode,
      retry: retryAttempt,
      details: lastError.message,
      errorInfo: event.error?.message
    })
  })

  // System health monitoring
  emitter.on('system:health-check', (event) => {
    const { services, memory, disk, uptime } = event.payload
    const healthyServices = Object.values(services).filter((s) => s.status === 'healthy').length
    const totalServices = Object.values(services).length

    console.log('🏥 System Health:', {
      services: `${healthyServices}/${totalServices} healthy`,
      memory: `${memory.percentage.toFixed(1)}% used`,
      disk: `${disk.percentage.toFixed(1)}% used`,
      uptime: `${(uptime / 3600).toFixed(1)}h`,
      checkDuration: event.measurement ? event.measurement.toString() : undefined
    })
  })

  // System backup completion with measurement
  emitter.on('system:backup-complete', (event) => {
    const { filesProcessed, totalSize, compressionRatio, destination } = event.payload
    console.log('💾 Backup Complete:', {
      files: filesProcessed,
      size: totalSize,
      compression: `${(compressionRatio * 100).toFixed(1)}%`,
      destination,
      duration: event.measurement ? event.measurement.toString() : undefined
    })
  })

  // Wildcard listeners for monitoring and debugging
  emitter.on('api:*', (event) => {
    console.log(`📊 API Event Monitor: ${event.event}`)
  })

  emitter.on('business:*', (event) => {
    console.log(`📈 Business Event Monitor: ${event.event}`)
  })

  console.log('Emitting rich events...\n')

  // Simulate a complete API request lifecycle with rich data and measurements
  const requestId = `req_${Date.now()}`

  // Start measuring the entire request
  const requestMeasurer = TimeMeasurer.start()

  // API Request
  emitter.emit('api:request', {
    payload: {
      method: 'POST',
      url: '/api/orders',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
        'User-Agent': 'MyApp/1.0'
      },
      body: { productId: 'prod_123', quantity: 2 },
      requestId,
      userId: 'user_456'
    },
    message: 'Processing order creation request'
  })

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Task validation with measurement
  const validationMeasurer = TimeMeasurer.start()
  await new Promise((resolve) => setTimeout(resolve, 45)) // Simulate validation work

  emitter.emit('task:validation-complete', {
    payload: {
      operation: 'order-validation',
      requestId,
      cacheHit: false,
      dbQueries: 3,
      externalApiCalls: 1
    },
    message: 'Order validation completed successfully',
    measurement: validationMeasurer.finish()
  })

  // Business event - successful order with measurement
  const orderProcessingMeasurer = TimeMeasurer.start()
  await new Promise((resolve) => setTimeout(resolve, 30)) // Simulate order processing

  emitter.emit('business:order-placed', {
    payload: {
      orderId: 'order_789',
      customerId: 'user_456',
      items: [
        { productId: 'prod_123', quantity: 2, price: 29.99 },
        { productId: 'prod_124', quantity: 1, price: 19.99 }
      ],
      total: 79.97,
      currency: 'USD',
      paymentMethod: 'credit-card',
      shippingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701'
      }
    },
    message: 'Order successfully placed and payment processed',
    measurement: orderProcessingMeasurer.finish()
  })

  // API Response with total request measurement
  emitter.emit('api:response', {
    payload: {
      requestId,
      statusCode: 201,
      responseTime: 156,
      size: 2048,
      cached: false
    },
    message: 'Order creation completed successfully',
    measurement: requestMeasurer.finish()
  })

  // Simulate an error scenario
  console.log('\nSimulating error scenario...\n')

  const failedRequestId = `req_${Date.now() + 1}`
  const failedRequestMeasurer = TimeMeasurer.start()

  emitter.emit('api:request', {
    payload: {
      method: 'POST',
      url: '/api/orders',
      headers: { 'Content-Type': 'application/json' },
      body: { productId: 'prod_999', quantity: 1 },
      requestId: failedRequestId,
      userId: 'user_789'
    },
    message: 'Processing order request'
  })

  await new Promise((resolve) => setTimeout(resolve, 50)) // Simulate failed processing

  // Payment failure with rich error context
  emitter.emit('business:payment-failed', {
    payload: {
      orderId: 'order_790',
      customerId: 'user_789',
      amount: 99.99,
      currency: 'USD',
      errorCode: 'INSUFFICIENT_FUNDS',
      retryAttempt: 2,
      lastError: new Error('Card declined: insufficient funds')
    },
    message: 'Payment processing failed after retry',
    error: new Error('Payment gateway returned error code D05')
  })

  // API Error with measurement
  emitter.emit('api:error', {
    payload: {
      requestId: failedRequestId,
      errorCode: 'PAYMENT_FAILED',
      message: 'Order could not be processed due to payment failure',
      stack: new Error().stack,
      retryCount: 2
    },
    message: 'API request failed during payment processing',
    error: new Error('Payment processing error'),
    measurement: failedRequestMeasurer.finish()
  })

  // System health monitoring with measurement
  console.log('\nSystem health monitoring...\n')

  const healthCheckMeasurer = TimeMeasurer.start()
  await new Promise((resolve) => setTimeout(resolve, 25)) // Simulate health check

  emitter.emit('system:health-check', {
    payload: {
      services: {
        'payment-gateway': { status: 'healthy', responseTime: 89 },
        'inventory-service': { status: 'healthy', responseTime: 45 },
        'user-service': { status: 'degraded', responseTime: 234 },
        'notification-service': { status: 'healthy', responseTime: 67 }
      },
      memory: { used: 6.2 * 1024 * 1024 * 1024, total: 8 * 1024 * 1024 * 1024, percentage: 77.5 },
      disk: { used: 45 * 1024 * 1024 * 1024, total: 100 * 1024 * 1024 * 1024, percentage: 45.0 },
      uptime: 86400 * 3 // 3 days
    },
    message: 'System health check completed',
    measurement: healthCheckMeasurer.finish()
  })

  // System backup with long-running measurement
  const backupMeasurer = TimeMeasurer.start()
  await new Promise((resolve) => setTimeout(resolve, 200)) // Simulate backup operation

  emitter.emit('system:backup-complete', {
    payload: {
      filesProcessed: 125000,
      totalSize: '1.2TB',
      compressionRatio: 0.73,
      destination: 's3://backups/daily',
      scheduleType: 'automated',
      retentionPolicy: '30-days'
    },
    message: 'Daily backup operation completed successfully',
    measurement: backupMeasurer.finish()
  })

  console.log('\n✅ Rich events example completed!')
}
