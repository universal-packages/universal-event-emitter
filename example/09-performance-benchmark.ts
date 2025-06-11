import { Benchmark } from '@universal-packages/time-measurer'
import EventEmitter2 from 'eventemitter2'
import { EventEmitter as NodeEventEmitter } from 'events'

import { EventEmitter } from '../src/EventEmitter'

interface BenchmarkConfig {
  numberOfEvents: number[]
  numberListeners: number[]
  numberOfEmits: number[]
  elementsToPush: number[]
}

interface TestScenario {
  events: number
  listeners: number
  emits: number
  elementsToPush: number
}

interface BenchmarkResult {
  library: string
  scenario: string
  testType: string
  eventsProcessed: number
  averageTime: number
  eventsPerSecond: number
  iterations: number
}

interface ComparisonResult {
  scenario: string
  testType: string
  results: BenchmarkResult[]
  fastest: string
  slowest: string
  ratios: Record<string, number>
}

const defaultConfig: BenchmarkConfig = {
  numberOfEvents: [1, 5],
  numberListeners: [1, 10],
  numberOfEmits: [1000, 10000],
  elementsToPush: [100, 1000]
}

export async function performanceBenchmark(config: BenchmarkConfig = defaultConfig) {
  console.log('🚀 Starting Event Emitter Performance Benchmark')
  console.log('='.repeat(60))

  const scenarios = generateScenarios(config)
  const allResults: BenchmarkResult[] = []

  for (const scenario of scenarios) {
    console.log(`\n📊 Testing scenario: ${scenario.events} events, ${scenario.listeners} listeners, ${scenario.emits} emits, ${scenario.elementsToPush} elements to push`)

    // Sync listeners benchmark
    const syncResults = await runSyncBenchmark(scenario)
    allResults.push(...syncResults)

    // Async listeners benchmark
    const asyncResults = await runAsyncBenchmark(scenario)
    allResults.push(...asyncResults)

    // Wildcard benchmark (only for libraries that support it)
    const wildcardResults = await runWildcardBenchmark(scenario)
    allResults.push(...wildcardResults)
  }

  // Generate comparison reports
  generateComparisonReport(allResults)
  generateSummaryReport(allResults)

  return allResults
}

function generateScenarios(config: BenchmarkConfig): TestScenario[] {
  const scenarios: TestScenario[] = []

  for (const events of config.numberOfEvents) {
    for (const listeners of config.numberListeners) {
      for (const emits of config.numberOfEmits) {
        for (const elementsToPush of config.elementsToPush) {
          scenarios.push({ events, listeners, emits, elementsToPush })
        }
      }
    }
  }

  return scenarios
}

async function runSyncBenchmark(scenario: TestScenario): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = []
  const eventsProcessed = scenario.events * scenario.listeners * scenario.emits

  // Node EventEmitter
  const nodeBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(1000 / eventsProcessed)),
    warmupIterations: 5,
    name: 'Node EventEmitter Sync'
  })

  const nodeResult = nodeBenchmark.run(() => {
    const emitter = new NodeEventEmitter()
    emitter.setMaxListeners(0)

    // Add listeners
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let l = 0; l < scenario.listeners; l++) {
        const results: number[] = []
        emitter.on(eventName, (data: any) => {
          // Push elements to array to simulate real work
          for (let i = 0; i < scenario.elementsToPush; i++) {
            results.push(data.data + i)
          }
        })
      }
    }

    // Emit events
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        emitter.emit(eventName, { data: emit })
      }
    }
  })

  results.push({
    library: 'Node EventEmitter',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'sync',
    eventsProcessed,
    averageTime: nodeResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (nodeResult.average.milliseconds / 1000)),
    iterations: nodeResult.iterations
  })

  // EventEmitter2
  const ee2Benchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(1000 / eventsProcessed)),
    warmupIterations: 5,
    name: 'EventEmitter2 Sync'
  })

  const ee2Result = ee2Benchmark.run(() => {
    const emitter = new EventEmitter2()
    emitter.setMaxListeners(0)

    // Add listeners
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let l = 0; l < scenario.listeners; l++) {
        const results: number[] = []
        emitter.on(eventName, (data: any) => {
          // Push elements to array to simulate real work
          for (let i = 0; i < scenario.elementsToPush; i++) {
            results.push(data.data + i)
          }
        })
      }
    }

    // Emit events
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        emitter.emit(eventName, { data: emit })
      }
    }
  })

  results.push({
    library: 'EventEmitter2',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'sync',
    eventsProcessed,
    averageTime: ee2Result.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (ee2Result.average.milliseconds / 1000)),
    iterations: ee2Result.iterations
  })

  // Universal EventEmitter
  const universalBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(1000 / eventsProcessed)),
    warmupIterations: 5,
    name: 'Universal EventEmitter Sync'
  })

  const universalResult = universalBenchmark.run(() => {
    const emitter = new EventEmitter()
    emitter.maxListeners = 0

    // Add listeners
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let l = 0; l < scenario.listeners; l++) {
        const results: number[] = []
        emitter.on(eventName, (data: any) => {
          // Push elements to array to simulate real work
          for (let i = 0; i < scenario.elementsToPush; i++) {
            results.push(data.payload.data + i)
          }
        })
      }
    }

    // Emit events
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        emitter.emit(eventName, { payload: { data: emit } })
      }
    }
  })

  results.push({
    library: 'Universal EventEmitter',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'sync',
    eventsProcessed,
    averageTime: universalResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (universalResult.average.milliseconds / 1000)),
    iterations: universalResult.iterations
  })

  console.log(`  ✅ Sync: Node(${nodeResult.average.toString()}), EE2(${ee2Result.average.toString()}), Universal(${universalResult.average.toString()})`)

  return results
}

async function runAsyncBenchmark(scenario: TestScenario): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = []
  const eventsProcessed = scenario.events * scenario.listeners * scenario.emits

  // EventEmitter2 Async
  const ee2AsyncBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(500 / eventsProcessed)),
    warmupIterations: 3,
    name: 'EventEmitter2 Async'
  })

  const ee2AsyncResult = await ee2AsyncBenchmark.runAsync(async () => {
    const emitter = new EventEmitter2()
    emitter.setMaxListeners(0)

    // Add async listeners
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let l = 0; l < scenario.listeners; l++) {
        const results: number[] = []
        emitter.on(eventName, async (data: any) => {
          // Push elements to array and simulate async work
          for (let i = 0; i < scenario.elementsToPush; i++) {
            results.push(data.data + i)
          }
          await new Promise((resolve) => setImmediate(resolve))
        })
      }
    }

    // Emit events and wait
    const promises: Promise<any>[] = []
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        promises.push(emitter.emitAsync(eventName, { data: emit }))
      }
    }

    await Promise.all(promises)
  })

  results.push({
    library: 'EventEmitter2',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'async',
    eventsProcessed,
    averageTime: ee2AsyncResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (ee2AsyncResult.average.milliseconds / 1000)),
    iterations: ee2AsyncResult.iterations
  })

  // Universal EventEmitter Async
  const universalAsyncBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(500 / eventsProcessed)),
    warmupIterations: 3,
    name: 'Universal EventEmitter Async'
  })

  const universalAsyncResult = await universalAsyncBenchmark.runAsync(async () => {
    const emitter = new EventEmitter()
    emitter.maxListeners = 0

    // Add async listeners
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let l = 0; l < scenario.listeners; l++) {
        const results: number[] = []
        emitter.on(eventName, async (data: any) => {
          // Push elements to array and simulate async work
          for (let i = 0; i < scenario.elementsToPush; i++) {
            results.push(data.payload.data + i)
          }
          await new Promise((resolve) => setImmediate(resolve))
        })
      }
    }

    // Emit events and wait
    const promises: Promise<any>[] = []
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event_${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        promises.push(emitter.emitAsync(eventName, { payload: { data: emit } }))
      }
    }

    await Promise.all(promises)
  })

  results.push({
    library: 'Universal EventEmitter',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'async',
    eventsProcessed,
    averageTime: universalAsyncResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (universalAsyncResult.average.milliseconds / 1000)),
    iterations: universalAsyncResult.iterations
  })

  console.log(`  ✅ Async: EE2(${ee2AsyncResult.average.toString()}), Universal(${universalAsyncResult.average.toString()})`)

  return results
}

async function runWildcardBenchmark(scenario: TestScenario): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = []
  const eventsProcessed = scenario.events * scenario.listeners * scenario.emits

  // EventEmitter2 Wildcard
  const ee2WildcardBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(1000 / eventsProcessed)),
    warmupIterations: 5,
    name: 'EventEmitter2 Wildcard'
  })

  const ee2WildcardResult = ee2WildcardBenchmark.run(() => {
    const emitter = new EventEmitter2({ wildcard: true, delimiter: ':' })
    emitter.setMaxListeners(0)

    // Add wildcard listeners
    for (let l = 0; l < scenario.listeners; l++) {
      const results: number[] = []
      emitter.on('event:*', (data: any) => {
        // Push elements to array to simulate real work
        for (let i = 0; i < scenario.elementsToPush; i++) {
          results.push(data.data + i)
        }
      })
    }

    // Emit events with wildcard patterns
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event:${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        emitter.emit(eventName, { data: emit })
      }
    }
  })

  results.push({
    library: 'EventEmitter2',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'wildcard',
    eventsProcessed,
    averageTime: ee2WildcardResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (ee2WildcardResult.average.milliseconds / 1000)),
    iterations: ee2WildcardResult.iterations
  })

  // Universal EventEmitter Wildcard
  const universalWildcardBenchmark = new Benchmark({
    iterations: Math.max(10, Math.floor(1000 / eventsProcessed)),
    warmupIterations: 5,
    name: 'Universal EventEmitter Wildcard'
  })

  const universalWildcardResult = universalWildcardBenchmark.run(() => {
    const emitter = new EventEmitter({ useWildcards: true, delimiter: ':' })
    emitter.maxListeners = 0

    // Add wildcard listeners
    for (let l = 0; l < scenario.listeners; l++) {
      const results: number[] = []
      emitter.on('event:*', (data: any) => {
        // Push elements to array to simulate real work
        for (let i = 0; i < scenario.elementsToPush; i++) {
          results.push(data.payload.data + i)
        }
      })
    }

    // Emit events with wildcard patterns
    for (let e = 0; e < scenario.events; e++) {
      const eventName = `event:${e}`
      for (let emit = 0; emit < scenario.emits; emit++) {
        emitter.emit(eventName, { payload: { data: emit } })
      }
    }
  })

  results.push({
    library: 'Universal EventEmitter',
    scenario: `${scenario.events}e_${scenario.listeners}l_${scenario.emits}em_${scenario.elementsToPush}p`,
    testType: 'wildcard',
    eventsProcessed,
    averageTime: universalWildcardResult.average.milliseconds,
    eventsPerSecond: Math.round(eventsProcessed / (universalWildcardResult.average.milliseconds / 1000)),
    iterations: universalWildcardResult.iterations
  })

  console.log(`  ✅ Wildcard: EE2(${ee2WildcardResult.average.toString()}), Universal(${universalWildcardResult.average.toString()})`)

  return results
}

function generateComparisonReport(results: BenchmarkResult[]): void {
  console.log('\n📈 PERFORMANCE COMPARISON REPORT')
  console.log('='.repeat(80))

  const groupedResults: Record<string, Record<string, BenchmarkResult[]>> = {}

  // Group results by scenario and test type
  for (const result of results) {
    if (!groupedResults[result.scenario]) {
      groupedResults[result.scenario] = {}
    }
    if (!groupedResults[result.scenario][result.testType]) {
      groupedResults[result.scenario][result.testType] = []
    }
    groupedResults[result.scenario][result.testType].push(result)
  }

  const comparisons: ComparisonResult[] = []

  for (const [scenario, testTypes] of Object.entries(groupedResults)) {
    for (const [testType, testResults] of Object.entries(testTypes)) {
      if (testResults.length < 2) continue

      // Sort by events per second (descending)
      testResults.sort((a, b) => b.eventsPerSecond - a.eventsPerSecond)

      const fastest = testResults[0]
      const slowest = testResults[testResults.length - 1]

      const ratios: Record<string, number> = {}
      for (const result of testResults) {
        ratios[result.library] = fastest.eventsPerSecond / result.eventsPerSecond
      }

      comparisons.push({
        scenario,
        testType,
        results: testResults,
        fastest: fastest.library,
        slowest: slowest.library,
        ratios
      })

      console.log(`\n🏆 ${scenario} - ${testType}:`)
      console.log(`   Events processed: ${fastest.eventsProcessed.toLocaleString()}`)

      for (let i = 0; i < testResults.length; i++) {
        const result = testResults[i]
        const position = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'
        const ratio = ratios[result.library]
        console.log(`   ${position} ${result.library}: ${result.eventsPerSecond.toLocaleString()} events/sec (${result.averageTime.toFixed(3)}ms avg) [${ratio.toFixed(2)}x]`)
      }
    }
  }
}

function generateSummaryReport(results: BenchmarkResult[]): void {
  console.log('\n📊 SUMMARY STATISTICS')
  console.log('='.repeat(60))

  const libraries = [...new Set(results.map((r) => r.library))]
  const testTypes = [...new Set(results.map((r) => r.testType))]

  console.log(`\n🔢 Total tests run: ${results.length}`)
  console.log(`📚 Libraries tested: ${libraries.join(', ')}`)
  console.log(`🧪 Test types: ${testTypes.join(', ')}`)

  // Overall winner by test type
  for (const testType of testTypes) {
    const typeResults = results.filter((r) => r.testType === testType)
    const libraryAvgs = libraries
      .map((lib) => {
        const libResults = typeResults.filter((r) => r.library === lib)
        const avgEventsPerSec = libResults.reduce((sum, r) => sum + r.eventsPerSecond, 0) / libResults.length
        return { library: lib, avgEventsPerSec, count: libResults.length }
      })
      .filter((r) => r.count > 0)

    libraryAvgs.sort((a, b) => b.avgEventsPerSec - a.avgEventsPerSec)

    console.log(`\n🏆 Overall ${testType} winner: ${libraryAvgs[0]?.library} (${Math.round(libraryAvgs[0]?.avgEventsPerSec || 0).toLocaleString()} avg events/sec)`)
  }

  // Performance insights
  console.log('\n💡 KEY INSIGHTS:')

  const syncResults = results.filter((r) => r.testType === 'sync')
  const wildcardResults = results.filter((r) => r.testType === 'wildcard')

  if (syncResults.length > 0) {
    const nodeSync = syncResults.filter((r) => r.library === 'Node EventEmitter')
    const universalSync = syncResults.filter((r) => r.library === 'Universal EventEmitter')

    if (nodeSync.length > 0 && universalSync.length > 0) {
      const nodeAvg = nodeSync.reduce((sum, r) => sum + r.eventsPerSecond, 0) / nodeSync.length
      const universalAvg = universalSync.reduce((sum, r) => sum + r.eventsPerSecond, 0) / universalSync.length
      const ratio = universalAvg / nodeAvg

      console.log(`   • Universal EventEmitter is ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1 / ratio).toFixed(2) + 'x slower'} than Node EventEmitter in sync scenarios`)
    }
  }

  if (wildcardResults.length > 0) {
    const ee2Wildcard = wildcardResults.filter((r) => r.library === 'EventEmitter2')
    const universalWildcard = wildcardResults.filter((r) => r.library === 'Universal EventEmitter')

    if (ee2Wildcard.length > 0 && universalWildcard.length > 0) {
      const ee2Avg = ee2Wildcard.reduce((sum, r) => sum + r.eventsPerSecond, 0) / ee2Wildcard.length
      const universalAvg = universalWildcard.reduce((sum, r) => sum + r.eventsPerSecond, 0) / universalWildcard.length
      const ratio = universalAvg / ee2Avg

      console.log(`   • Universal EventEmitter is ${ratio > 1 ? ratio.toFixed(2) + 'x faster' : (1 / ratio).toFixed(2) + 'x slower'} than EventEmitter2 in wildcard scenarios`)
    }
  }

  console.log('\n✨ Benchmark complete!')
}
