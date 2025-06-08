import { basicEventsExample } from './01-basic-events'
import { wildcardPatternsExample } from './02-wildcard-patterns'
import { typedEventsExample } from './03-typed-events'
import { asyncEventsExample } from './04-async-events'
import { waitForEventsExample } from './05-wait-for-events'
import { memoryLeakDetectionExample } from './06-memory-leak-detection'
import { errorHandlingExample } from './07-error-handling'
import { listenerPrioritiesExample } from './08-listener-priorities'
import { performanceBenchmark } from './09-performance-benchmark'

async function runAllExamples() {
  console.log('\n' + '='.repeat(50) + '\n')
  await basicEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await wildcardPatternsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await typedEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await asyncEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await waitForEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await memoryLeakDetectionExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await errorHandlingExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await listenerPrioritiesExample()
  console.log('\n' + '='.repeat(50) + '\n')
  await performanceBenchmark()
}

runAllExamples()
