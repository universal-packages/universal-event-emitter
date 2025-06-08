import { EventEmitter } from '../src/EventEmitter'

export async function listenerPrioritiesExample() {
  console.log('🔢 Listener Priorities Example')
  console.log('='.repeat(40))

  const emitter = new EventEmitter()

  console.log('\n1️⃣ Normal listener order (FIFO - First In, First Out):')

  // Add listeners in order
  emitter.on('normal:order', (event) => {
    console.log('   🥇 First listener added')
  })

  emitter.on('normal:order', (event) => {
    console.log('   🥈 Second listener added')
  })

  emitter.on('normal:order', (event) => {
    console.log('   🥉 Third listener added')
  })

  console.log('\n📡 Emitting normal:order event:')
  emitter.emit('normal:order', { message: 'Normal order test' })

  console.log('\n2️⃣ Using prependListener to change order:')

  // Add some normal listeners first
  emitter.on('priority:test', (event) => {
    console.log('   📍 Regular listener 1')
  })

  emitter.on('priority:test', (event) => {
    console.log('   📍 Regular listener 2')
  })

  // Now prepend a high-priority listener
  emitter.prependListener('priority:test', (event) => {
    console.log('   🚨 HIGH PRIORITY: This runs first!')
  })

  // Add another regular listener
  emitter.on('priority:test', (event) => {
    console.log('   📍 Regular listener 3')
  })

  // Prepend another high-priority listener
  emitter.prependListener('priority:test', (event) => {
    console.log('   ⚡ HIGHEST PRIORITY: This runs before all others!')
  })

  console.log('\n📡 Emitting priority:test event:')
  emitter.emit('priority:test', { message: 'Priority test' })

  console.log('\n3️⃣ One-time listeners with priorities:')

  // Add regular once listeners
  emitter.once('once:priority', (event) => {
    console.log('   🔂 Regular once listener 1')
  })

  emitter.once('once:priority', (event) => {
    console.log('   🔂 Regular once listener 2')
  })

  // Prepend once listeners
  emitter.prependOnceListener('once:priority', (event) => {
    console.log('   🎯 Priority once listener 1')
  })

  emitter.prependOnceListener('once:priority', (event) => {
    console.log('   🎯 Priority once listener 2 (highest)')
  })

  console.log('\n📡 Emitting once:priority event (first time):')
  emitter.emit('once:priority', { message: 'Once priority test - first' })

  console.log('\n📡 Emitting once:priority event (second time):')
  emitter.emit('once:priority', { message: 'Once priority test - second' })

  console.log('\n4️⃣ Mixed priority scenarios:')

  const mixedEmitter = new EventEmitter()

  // Start with some regular listeners
  mixedEmitter.on('mixed:scenario', (event) => {
    console.log('   📦 Regular listener A')
  })

  mixedEmitter.on('mixed:scenario', (event) => {
    console.log('   📦 Regular listener B')
  })

  // Add prepended listeners
  mixedEmitter.prependListener('mixed:scenario', (event) => {
    console.log('   🔥 Prepended listener 1')
  })

  // Add more regular listeners
  mixedEmitter.on('mixed:scenario', (event) => {
    console.log('   📦 Regular listener C')
  })

  // Add more prepended listeners (these will be at the very beginning)
  mixedEmitter.prependListener('mixed:scenario', (event) => {
    console.log('   🔥 Prepended listener 2 (newest first)')
  })

  // Add once listeners
  mixedEmitter.once('mixed:scenario', (event) => {
    console.log('   🎲 Once listener (regular)')
  })

  // Add prepended once listeners
  mixedEmitter.prependOnceListener('mixed:scenario', (event) => {
    console.log('   🎯 Prepended once listener')
  })

  console.log('\n📡 Emitting mixed:scenario event:')
  mixedEmitter.emit('mixed:scenario', { message: 'Mixed scenario test' })

  console.log('\n5️⃣ Real-world use case - Plugin system with priorities:')

  class PluginManager extends EventEmitter {
    registerPlugin(name: string, priority: 'high' | 'normal' = 'normal') {
      const listener = (event: any) => {
        console.log(`   🔌 Plugin "${name}" processing: ${event.payload?.action}`)
      }

      if (priority === 'high') {
        this.prependListener('plugin:execute', listener)
        console.log(`✅ Registered high-priority plugin: ${name}`)
      } else {
        this.on('plugin:execute', listener)
        console.log(`✅ Registered normal plugin: ${name}`)
      }
    }

    executePlugins(action: string) {
      console.log(`\n🚀 Executing plugins for action: ${action}`)
      this.emit('plugin:execute', {
        message: `Plugin execution for ${action}`,
        payload: { action, timestamp: Date.now() }
      })
    }
  }

  const pluginManager = new PluginManager()

  console.log('\n📦 Registering plugins:')

  // Register plugins in mixed order
  pluginManager.registerPlugin('Analytics', 'normal')
  pluginManager.registerPlugin('Security', 'high')
  pluginManager.registerPlugin('Logging', 'normal')
  pluginManager.registerPlugin('Authentication', 'high')
  pluginManager.registerPlugin('Caching', 'normal')
  pluginManager.registerPlugin('RateLimit', 'high')

  // Execute plugins - high priority plugins run first
  pluginManager.executePlugins('user:login')

  console.log('\n6️⃣ Listener order introspection:')

  const inspectionEmitter = new EventEmitter()

  // Add listeners with identifiable behavior
  const listeners = [
    { name: 'First', order: 1 },
    { name: 'Second', order: 2 },
    { name: 'Third', order: 3 }
  ]

  listeners.forEach(({ name, order }) => {
    inspectionEmitter.on('inspect:order', (event) => {
      console.log(`   📋 ${name} listener (added ${order})`)
    })
  })

  // Prepend some listeners
  inspectionEmitter.prependListener('inspect:order', (event) => {
    console.log('   📋 Prepended Last (should be first)')
  })

  inspectionEmitter.prependListener('inspect:order', (event) => {
    console.log('   📋 Prepended Very Last (should be very first)')
  })

  console.log('\n📊 Current listener statistics:')
  console.log(`   Total listeners: ${inspectionEmitter.listenerCount}`)
  console.log(`   Event names: [${inspectionEmitter.eventNames.join(', ')}]`)

  console.log('\n📡 Final listener execution order:')
  inspectionEmitter.emit('inspect:order', { message: 'Order inspection' })

  console.log('\n💡 Use prependListener() for high-priority operations!')
  console.log('💡 Security, authentication, and validation should run first!')
  console.log('💡 Logging and analytics typically run last!')
  console.log()
}
