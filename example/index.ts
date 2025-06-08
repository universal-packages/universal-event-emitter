import { basicEventsExample } from './01-basic-events'
import { wildcardPatternsExample } from './02-wildcard-patterns'
import { typedEventsExample } from './03-typed-events'
import { asyncEventsExample } from './04-async-events'
import { waitForEventsExample } from './05-wait-for-events'
import { memoryLeakDetectionExample } from './06-memory-leak-detection'
import { errorHandlingExample } from './07-error-handling'
import { listenerPrioritiesExample } from './08-listener-priorities'

async function runAllExamples() {
  console.log('\n' + '='.repeat(50) + '\n')
  basicEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  wildcardPatternsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  typedEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  asyncEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  waitForEventsExample()
  console.log('\n' + '='.repeat(50) + '\n')
  memoryLeakDetectionExample()
  console.log('\n' + '='.repeat(50) + '\n')
  errorHandlingExample()
  console.log('\n' + '='.repeat(50) + '\n')
  listenerPrioritiesExample()
}

runAllExamples()
