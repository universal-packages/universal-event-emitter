/**
 * Performance Benchmark Example
 *
 * This example demonstrates performance comparisons between the Universal Event Emitter
 * and Node.js native EventEmitter across various scenarios:
 * - Basic emit/listen operations
 * - Multiple listeners
 * - Once listeners
 * - Wildcard patterns (universal emitter feature)
 * - High frequency events
 * - Memory usage patterns
 * - Async operations
 * - Event removal operations
 */
import { Benchmark } from '@universal-packages/time-measurer'
import { EventEmitter as NodeEventEmitter } from 'node:events'

import { EventEmitter as UniversalEventEmitter } from '../src'

interface BenchmarkConfig {
  iterations: number
  warmupIterations: number
}

const defaultConfig: BenchmarkConfig = {
  iterations: 100000,
  warmupIterations: 10000
}

const heavyConfig: BenchmarkConfig = {
  iterations: 1000000,
  warmupIterations: 100000
}

export async function performanceBenchmark() {
  console.log('⚡ Performance Benchmark: Universal EventEmitter vs Node.js EventEmitter\n')
  console.log('Running comprehensive performance tests across multiple scenarios...\n')

  // 1. Basic emit/listen performance
  await benchmarkBasicEmitListen()
  console.log('')

  // 2. Multiple listeners performance
  await benchmarkMultipleListeners()
  console.log('')

  // 3. Once listeners performance
  await benchmarkOnceListeners()
  console.log('')

  // 4. Wildcard patterns (Universal only)
  await benchmarkWildcardPatterns()
  console.log('')

  // 5. High frequency events
  await benchmarkHighFrequencyEvents()
  console.log('')

  // 6. Event removal operations
  await benchmarkEventRemoval()
  console.log('')

  // 7. Memory usage and listener management
  await benchmarkMemoryUsage()
  console.log('')

  // 8. Async operations
  await benchmarkAsyncOperations()
  console.log('')

  // 9. Mixed operations stress test
  await benchmarkMixedOperations()
  console.log('')

  console.log('✅ Performance benchmark completed!')
}

async function benchmarkBasicEmitListen() {
  console.log('📊 1. Basic Emit/Listen Performance')
  console.log('Testing single event emission with single listener')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  // Setup listeners
  nodeEmitter.on('test', () => {
    for (let i = 0; i < 1000; i++) {}
  })
  universalEmitter.on('test', () => {
    for (let i = 0; i < 1000; i++) {}
  })

  const nodeBenchmark = new Benchmark({
    ...heavyConfig,
    name: 'Node.js EventEmitter - Basic emit'
  })

  const universalBenchmark = new Benchmark({
    ...heavyConfig,
    name: 'Universal EventEmitter - Basic emit'
  })

  const nodeResult = nodeBenchmark.run(() => {
    nodeEmitter.emit('test')
  })

  const universalResult = universalBenchmark.run(() => {
    universalEmitter.emit('test')
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
}

async function benchmarkMultipleListeners() {
  console.log('📊 2. Multiple Listeners Performance')
  console.log('Testing single event with 1000 listeners')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  // Setup 10 listeners for each
  for (let i = 0; i < 1000; i++) {
    nodeEmitter.on('test', () => {
      for (let i = 0; i < 100; i++) {}
    })
    universalEmitter.on('test', () => {
      for (let i = 0; i < 100; i++) {}
    })
  }

  const nodeBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Node.js EventEmitter - Multiple listeners'
  })

  const universalBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Universal EventEmitter - Multiple listeners'
  })

  const nodeResult = nodeBenchmark.run(() => {
    nodeEmitter.emit('test', { data: 'test' })
  })

  const universalResult = universalBenchmark.run(() => {
    universalEmitter.emit('test', { payload: { data: 'test' } })
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
}

async function benchmarkOnceListeners() {
  console.log('📊 3. Once Listeners Performance')
  console.log('Testing once listeners with automatic cleanup')

  const nodeBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Node.js EventEmitter - Once listeners'
  })

  const universalBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Universal EventEmitter - Once listeners'
  })

  const nodeResult = nodeBenchmark.run(() => {
    const emitter = new NodeEventEmitter()
    emitter.setMaxListeners(0)
    emitter.once('test', () => {})
    emitter.emit('test')
  })

  const universalResult = universalBenchmark.run(() => {
    const emitter = new UniversalEventEmitter()
    emitter.maxListeners = 0
    emitter.once('test', () => {})
    emitter.emit('test')
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
}

async function benchmarkWildcardPatterns() {
  console.log('📊 4. Wildcard Patterns Performance')
  console.log('Testing wildcard listeners (Universal EventEmitter feature)')

  const universalEmitter = new UniversalEventEmitter()

  // Setup wildcard listeners
  universalEmitter.on('user:*', () => {})
  universalEmitter.on('task:*', () => {})
  universalEmitter.on('*', () => {})

  const universalBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Universal EventEmitter - Wildcard patterns'
  })

  const universalResult = universalBenchmark.run(() => {
    universalEmitter.emit('user:login', { payload: { userId: '123' } })
  })

  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log('  Note: Node.js EventEmitter does not support wildcard patterns natively')
}

async function benchmarkHighFrequencyEvents() {
  console.log('📊 5. High Frequency Events Performance')
  console.log('Testing rapid event emission (1000 events per iteration)')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  let nodeCounter = 0
  let universalCounter = 0

  nodeEmitter.on('tick', () => {
    nodeCounter++
  })
  universalEmitter.on('tick', () => {
    universalCounter++
  })

  const nodeBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Node.js EventEmitter - High frequency'
  })

  const universalBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Universal EventEmitter - High frequency'
  })

  const nodeResult = nodeBenchmark.run(() => {
    for (let i = 0; i < 1000; i++) {
      nodeEmitter.emit('tick', i)
    }
  })

  const universalResult = universalBenchmark.run(() => {
    for (let i = 0; i < 1000; i++) {
      universalEmitter.emit('tick', { payload: i })
    }
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
  console.log(`  Events processed: Node=${nodeCounter}, Universal=${universalCounter}`)
}

async function benchmarkEventRemoval() {
  console.log('📊 6. Event Removal Performance')
  console.log('Testing listener addition and removal')

  const nodeBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Node.js EventEmitter - Add/Remove listeners'
  })

  const universalBenchmark = new Benchmark({
    ...defaultConfig,
    name: 'Universal EventEmitter - Add/Remove listeners'
  })

  const nodeResult = nodeBenchmark.run(() => {
    const emitter = new NodeEventEmitter()
    emitter.setMaxListeners(0)
    const listener = () => {}
    emitter.on('test', listener)
    emitter.removeListener('test', listener)
  })

  const universalResult = universalBenchmark.run(() => {
    const emitter = new UniversalEventEmitter()
    const listener = () => {}
    emitter.on('test', listener)
    emitter.removeListener('test', listener)
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
}

async function benchmarkMemoryUsage() {
  console.log('📊 7. Memory Usage and Listener Management')
  console.log('Testing memory efficiency with many listeners')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  const nodeBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Node.js EventEmitter - Memory management'
  })

  const universalBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Universal EventEmitter - Memory management'
  })

  const nodeResult = nodeBenchmark.run(() => {
    // Add 50 listeners, emit events, then remove all
    const listeners: Array<() => void> = []
    for (let i = 0; i < 50; i++) {
      const listener = () => {}
      listeners.push(listener)
      nodeEmitter.on('test', listener)
    }

    for (let i = 0; i < 10; i++) {
      nodeEmitter.emit('test', { iteration: i })
    }

    listeners.forEach((listener) => {
      nodeEmitter.removeListener('test', listener)
    })
  })

  const universalResult = universalBenchmark.run(() => {
    // Add 50 listeners, emit events, then remove all
    const listeners: Array<() => void> = []
    for (let i = 0; i < 50; i++) {
      const listener = () => {}
      listeners.push(listener)
      universalEmitter.on('test', listener)
    }

    for (let i = 0; i < 10; i++) {
      universalEmitter.emit('test', { payload: { iteration: i } })
    }

    listeners.forEach((listener) => {
      universalEmitter.removeListener('test', listener)
    })
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
}

async function benchmarkAsyncOperations() {
  console.log('📊 8. Async Operations Performance')
  console.log('Testing async listeners and emitAsync (Universal feature)')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  // Setup async listeners
  nodeEmitter.on('async-test', async () => {
    await new Promise((resolve) => setImmediate(resolve))
  })

  universalEmitter.on('async-test', async () => {
    await new Promise((resolve) => setImmediate(resolve))
  })

  const nodeBenchmark = new Benchmark({
    iterations: 100,
    warmupIterations: 10,
    name: 'Node.js EventEmitter - Async emit (fire and forget)'
  })

  const universalBenchmark = new Benchmark({
    iterations: 100,
    warmupIterations: 10,
    name: 'Universal EventEmitter - emitAsync (awaited)'
  })

  const nodeResult = nodeBenchmark.run(() => {
    nodeEmitter.emit('async-test', { data: 'async' })
  })

  const universalResult = universalBenchmark.run(async () => {
    await universalEmitter.emitAsync('async-test', { payload: { data: 'async' } })
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)
  console.log('  Note: Different semantics - Node.js fires async listeners without waiting')
}

async function benchmarkMixedOperations() {
  console.log('📊 9. Mixed Operations Stress Test')
  console.log('Testing realistic mixed usage patterns')

  const nodeEmitter = new NodeEventEmitter()
  const universalEmitter = new UniversalEventEmitter()

  // Suppress max listeners warnings for benchmark
  nodeEmitter.setMaxListeners(0)
  universalEmitter.maxListeners = 0

  const nodeBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Node.js EventEmitter - Mixed operations'
  })

  const universalBenchmark = new Benchmark({
    iterations: 1000,
    warmupIterations: 100,
    name: 'Universal EventEmitter - Mixed operations'
  })

  const nodeResult = nodeBenchmark.run(() => {
    // Mixed operations simulating real application usage
    const listener1 = () => {}
    const listener2 = () => {}
    const onceListener = () => {}

    // Add listeners
    nodeEmitter.on('user:action', listener1)
    nodeEmitter.on('user:action', listener2)
    nodeEmitter.once('user:action', onceListener)

    // Emit events
    nodeEmitter.emit('user:action', { action: 'login' })
    nodeEmitter.emit('user:action', { action: 'navigate' })

    // Check listener count
    nodeEmitter.listenerCount('user:action')

    // Remove specific listener
    nodeEmitter.removeListener('user:action', listener1)

    // Emit again
    nodeEmitter.emit('user:action', { action: 'logout' })

    // Clean up
    nodeEmitter.removeAllListeners('user:action')
  })

  const universalResult = universalBenchmark.run(() => {
    // Mixed operations with Universal EventEmitter features
    const listener1 = () => {}
    const listener2 = () => {}
    const onceListener = () => {}

    // Add listeners
    universalEmitter.on('user:action', listener1)
    universalEmitter.on('user:action', listener2)
    universalEmitter.once('user:action', onceListener)

    // Add wildcard listener
    universalEmitter.on('user:*', () => {})

    // Emit events
    universalEmitter.emit('user:action', { payload: { action: 'login' } })
    universalEmitter.emit('user:action', { payload: { action: 'navigate' } })

    // Check listener count
    universalEmitter.listenerCount

    // Remove specific listener
    universalEmitter.removeListener('user:action', listener1)

    // Emit again
    universalEmitter.emit('user:action', { payload: { action: 'logout' } })

    // Clean up
    universalEmitter.removeAllListeners('user:action')
  })

  console.log(`  Node.js EventEmitter     - Average: ${nodeResult.average.toString()}`)
  console.log(`  Universal EventEmitter   - Average: ${universalResult.average.toString()}`)
  console.log(`  Performance ratio: ${(convertToNanoseconds(universalResult.average) / convertToNanoseconds(nodeResult.average)).toFixed(2)}x`)

  // Performance summary
  console.log('\n📈 Performance Analysis Summary:')
  console.log('  - Universal EventEmitter provides additional features like wildcards and async support')
  console.log('  - Performance trade-offs are expected due to enhanced functionality')
  console.log('  - Consider your use case: performance vs features')
  console.log('  - For high-frequency, simple events: Node.js EventEmitter may be faster')
  console.log('  - For complex patterns and type safety: Universal EventEmitter provides better DX')
}

/**
 * Helper function to convert Measurement to nanoseconds for comparison
 */
function convertToNanoseconds(measurement: import('@universal-packages/time-measurer').Measurement): number {
  return measurement.hours * 3600000000000 + measurement.minutes * 60000000000 + measurement.seconds * 1000000000 + measurement.milliseconds * 1000000
}
