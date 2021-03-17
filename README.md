# SignalWire Relay Real Time Sentiment Analysis Demo

This application is buitl with [SignalWire Relay](https://docs.signalwire.com/topics/relay/#relay-documentation) and it provides a demo of a 3rd party integration, by using media streaming and natural language processing to provide real-time insight on a phone call.
## Running locally

The application is written in Node.JS and is composed of two parts, an Express web application and a Relay Consumer.

Start by copying the `env.example` file to `.env`.
### Necessary credentials

The application needs a SignalWire API token. You can sign up [here](https://signalwire.com/signup), then put the Project ID and Token in the `.env` file as `SIGNALWIRE_PROJECT_KEY` and `SIGNALWIRE_PROJECT_KEY`.

Your account will be start in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

This demo also requires a Google Cloud account with [Speech-to-Text](https://cloud.google.com/speech-to-text) and [Natural Language](https://cloud.google.com/natural-language) enabled credentials. Place the JSON file in the `config` folder and make sure the name matches what is in your `.env` file.

### Ensure connectivity

If you are running the application on your local computer, we recommend [ngrok](https://ngrok.com/) to create a tunnel to your local machine, on the port `5000`. After starting the tunnel, add the URL you receive from Ngrok in your `.env` file as the `TAP_ADDRESS` value, making sure you add the `/asr` path at the end.

### Running the application

There is a sample `docker-compose` setup provided, so after setting up your environment, just run `docker-compose up` and go to [http://localhost:5000](http://localhost:5000).

## Documentation links

[Relay Documentation](https://docs.signalwire.com/topics/relay/#relay-documentation)

[Relay Docker Images](https://github.com/signalwire/signalwire-relay-docker)

[SignalWire 101](https://signalwire.com/resources/getting-started/signalwire-101)

Copyright 2021, [SignalWire Inc.](https://signalwire.com)