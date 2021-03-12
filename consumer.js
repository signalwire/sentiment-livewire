const { RelayConsumer } = require('@signalwire/node')
const util = require('util')

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office'],

  ready: async ({ client }) => {
    if (process.env.ENABLE_DEBUG) { 
      client.__logger.setLevel(client.__logger.levels.DEBUG)
    }
  },

  onIncomingCall: async (call) => {
    await call.answer()

    const params = {
      audio_direction: 'both',
      target_type: 'ws',
      target_uri: process.env.TAP_ADDRESS
    }

    console.log('calling tap with ' + util.inspect(params))
    const tapResult = await call.tap(params)

    await call.hangup();
  }
})

consumer.run()