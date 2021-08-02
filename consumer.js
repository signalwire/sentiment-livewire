require('dotenv').config();
const { RelayConsumer } = require('@signalwire/node')
const util = require('util')

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['edge'],

  ready: async ({ client }) => {
    client.__logger.setLevel(client.__logger.levels.DEBUG)
  },

  onIncomingCall: async (call) => {
    await call.answer()

    const params = {
      audio_direction: 'listen',
      target_type: 'ws',
      target_uri: process.env.TAP_ADDRESS
    }

    console.log('calling tap with ' + util.inspect(params))
    var destination = call.device.params.to.split('@')[0];

    if (destination.match(/\+1\d{10}/)) {
      const tapResult = await call.tapAsync(params)
      const connectResult = await call.connect({ type: 'phone', from: process.env.CALLER_ID, to: destination, timeout: 30 })
      await connectResult.call.waitForEnding()
    }

    await call.hangup();
  }
})

consumer.run()