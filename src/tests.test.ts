import { eventEmitterTest } from './EventEmitter.test'

async function runAllTests() {
  try {
    await eventEmitterTest()
    console.log('\n🎉 All tests completed successfully!')
  } catch (error) {
    console.error('\n💥 Test execution failed:', error)
    process.exit(1)
  }
}

runAllTests()
