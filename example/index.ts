import { basicUsage } from './01-basic-usage'
import { typescriptTypedEvents } from './02-typescript-typed-events'
import { richEventsExample } from './03-rich-events'

async function runAllExamples() {
  basicUsage()
  console.log('\n' + '='.repeat(50) + '\n')

  typescriptTypedEvents()
  console.log('\n' + '='.repeat(50) + '\n')

  await richEventsExample()
}

runAllExamples().catch(console.error)
