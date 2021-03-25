# SignalWire Relay Real Time Sentiment Analysis Demo

In today's distributed world, call center operators and supervisors have been presented with new challenges. Monitoring the effectiveness of calls and making sure every agent has the necessary information at their disposal are even more important when the workforce is remote.

This application is built with [SignalWire Relay](https://docs.signalwire.com/topics/relay/#relay-documentation) and it provides a demo of a 3rd party integration, by using media streaming and natural language processing to provide real-time insight on a phone call.

The audio is streamed to a speech recognition service which performs sentiment analysis and entity extraction on the conversation, and sends back a score and list of entities to the web application. The user is presented with a real-time sentiment score (from "strongly positive" to "strongly negative") and a list of potentially relevant words in the conversation.

The web application used to display the results is built using the [Node Express](https://expressjs.com/) framework and uses [Faye](https://faye.jcoglan.com/) to send real time events to the browser.

## Necessary credentials

Start by copying the `env.example` file to `.env`.

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`.

Your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

To use the application, you will need a SignalWire phone number pointed at the `office` Relay context. That is found within the `Settings` of each phone number on the dashboard. You can refer to our [SignalWire 101](https://signalwire.com/resources/getting-started/signalwire-101) guide for more information.

You will also need to set the `DESTINATION_NUMBER` environment variable (in the `.env` file) to a phone number you can call that will act as the "agent".

This demo also requires a Google Cloud account with [Speech-to-Text](https://cloud.google.com/speech-to-text) and [Natural Language](https://cloud.google.com/natural-language) enabled credentials. Place the JSON file in the `config` folder and make sure the name matches what is in your `.env` file.

## Code snippets

You can find the complete code for the application (here)[https://github.com/signalwire/sentiment-livewire].

### The Consumer

The most important part of a Relay application is the `Consumer`, which is the class that holds the logic controlling the call.

Our consumer showcases how Relay can be simple, yet powerful, in a few lines of code.

We start with the necessary includes:
```js
const { RelayConsumer } = require('@signalwire/node')
const util = require('util')
```

Then, we instantiate the consumer, passing in our SignalWire credentials and the context we will receive the calls on.
```js
const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['office'],
```

We use the `ready` event handler to conditionally set the logging level.
```js
  ready: async ({ client }) => {
    if (process.env.ENABLE_DEBUG) { 
      client.__logger.setLevel(client.__logger.levels.DEBUG)
    }
  },
```

The `onIncomingCall` handler is set up to answer the call, and prepares the `tap` to send media to the configured `TAP_ADDRESS`. Remember SignalWire currently only supports sending media over WSS.
```js
  onIncomingCall: async (call) => {
    await call.answer()

    const params = {
      audio_direction: 'speak',
      target_type: 'ws',
      target_uri: process.env.TAP_ADDRESS
    }
```

We activate the `tap` in an asynchronous way so we can dial the destination while it is active.
```js
    console.log('calling tap with ' + util.inspect(params))
    const tapResult = await call.tapAsync(params)
```

After dialing the "agent" using `connect`, we wait indefinitely until the call ends so the conversation can happen.
```js
    const connectResult = await call.connect({ type: 'phone', to: process.env.DESTINATION_NUMBER, timeout: 30 })
    await connectResult.call.waitForEnding()

    await call.hangup();
  }
})
```

Finally, we just run the consumer.
```js
consumer.run()
```

### Web application and ASR

The Express web server mounts the Faye service and the ASR service so they can all be available under the same URL.

```js
let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./lib/web');
let setupNewClient = require('./lib/asr');
let bayeux = require('./lib/bayeux');

let wsInstance = new WSServer({
  server: server,
  path: "/asr"
});

server.on('request', app);
wsInstance.on('connection', setupNewClient)
bayeux.attach(server)

server.listen(process.env.PORT || 5000, function() {
  console.log("http/ws server listening");
});
```

The speech recognition service is complex, and built around a plain Websocket server in Node.JS.

```js
//...
wsClient.on('message', async message => {
    if (typeof message === 'string') {
      console.log('start')
      // this pushes the update that a new stream has started
      bayeux.getClient().publish('/updates', {event: 'start'});
      return startStream()
    } else {
      // this performs the actual speech recognition
      audioInputStream.write(message)
    }
  })
//...
```

## Running locally

The application is written in Node.JS and is composed of two parts, an Express web application and a Relay Consumer.

### Ensure connectivity

If you are running the application on your local computer, we recommend [ngrok](https://ngrok.com/) to create a tunnel to your local machine, on the port `5000`. After starting the tunnel, add the URL you receive from Ngrok in your `.env` file as the `TAP_ADDRESS` value, making sure you add the `/asr` path at the end.

The `TAP_ADDRESS` URL you enter (for example, `wss://yourname.ngrok.io/asr`) must be reachable from the public Internet as it is where SignalWire will send the call audio to be analyzed.

### Running the application

There is a sample `docker-compose` setup provided, which is the recommended way to run the application. Once you have `.env` set up, just run `docker-compose up` and go to [http://localhost:5000](http://localhost:5000).


## Documentation links

[Relay Documentation](https://docs.signalwire.com/topics/relay/#relay-documentation)

[Getting started with Relay](https://github.com/signalwire/signalwire-guides/blob/master/intros/getting_started_relay.md)

[Relay Docker Images](https://github.com/signalwire/signalwire-relay-docker)

[SignalWire 101](https://signalwire.com/resources/getting-started/signalwire-101)

Copyright 2021, [SignalWire Inc.](https://signalwire.com)