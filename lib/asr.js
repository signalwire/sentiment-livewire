const Speech = require('@google-cloud/speech').v1p1beta1
const { Writable } = require('stream')
let analyze_and_update = require('./nlp');
let bayeux = require('./bayeux');

const streamingLimit = 290000

function setupNewClient(wsClient) {
  let restartCounter = 0;
  let audioInput = [];
  let lastAudioInput = [];
  let resultEndTime = 0;
  let isFinalEndTime = 0;
  let finalRequestEndTime = 0;
  let newStream = true;
  let bridgingOffset = 0;
  let recognizeStream = null;
  let speechClient = new Speech.SpeechClient();
  let restartTimeout = null;

  const audioInputStream = new Writable({
    write(chunk, encoding, next) {
      if (newStream && lastAudioInput.length !== 0) {
        // Approximate math to calculate time of chunks
        const chunkTime = streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor((finalRequestEndTime - bridgingOffset) / chunkTime);
          bridgingOffset = Math.floor((lastAudioInput.length - chunksFromMS) * chunkTime);
          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            recognizeStream.write(lastAudioInput[i]);
          }
        }

        newStream = false;
      }

      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }

      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  const speechCallback = (stream) => {
    if (!wsClient || wsClient.readyState !== 1) {
      return console.warn('Missing wsClient or not readyState!')
    }
    const { results = [] } = stream
    if (results[0]) {
      const { isFinal, alternatives, resultEndTime: endTime } = results[0]
      // Convert API result end time from seconds + nanoseconds to milliseconds
      resultEndTime = endTime.seconds * 1000 + Math.round(endTime.nanos / 1000000);
      if (isFinal) {
        isFinalEndTime = endTime;
      }
      const text = alternatives[0].transcript
      console.log('Send to client isFinal/text', isFinal, text)
      
      if (isFinal) {
        analyze_and_update(text)
      }
    }
  };

  const clearRestartTimeout = () => {
    clearTimeout(restartTimeout)
    restartTimeout = null
  }

  const startStream = () => {
    console.log('startStream...')
    clearRestartTimeout()
    // Clear current audioInput
    audioInput = [];
    const request = {
      config: {
        encoding: 'MULAW',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'default',
      },
      interimResults: true,
      verbose: true,
    };
    console.log('Build recognizeStream with', request)
    recognizeStream = speechClient.streamingRecognize(request)
      .on('error', err => {
        if (err.code === 11) {
          console.error('API request error - COD 11 ?? ' + err);
          // restartStream();
        } else {
          console.error('API request error ' + err);
        }
      })
      .on('data', speechCallback);

    // Restart stream when streamingLimit expires
    restartTimeout = setTimeout(restartStream, streamingLimit);
  }

  const stopStream = () => {
    console.log('stopStream...')
    clearRestartTimeout()
    if (recognizeStream) {
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    restartCounter = 0;
    audioInput = [];
    lastAudioInput = [];
    resultEndTime = 0;
    isFinalEndTime = 0;
    finalRequestEndTime = 0;
    newStream = true;
    bridgingOffset = 0;
    currentDictionary = null;
  }

  const restartStream = () => {
    console.log('restartStream...')
    if (recognizeStream) {
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;
    lastAudioInput = [];
    lastAudioInput = audioInput;

    restartCounter++;
    console.warn(`${streamingLimit * restartCounter}: RESTARTING REQUEST\n`);

    newStream = true;
    startStream();
  }

  wsClient.on('message', async message => {
    if (typeof message === 'string') {
      console.log('start')
      bayeux.getClient().publish('/updates', {event: 'start'});
      return startStream()
    } else {
      audioInputStream.write(message)
    }
  })

  wsClient.on('close', () => {
    console.log('wsClient closed..')
    bayeux.getClient().publish('/updates', {event: 'stop'});
    stopStream()
    audioInputStream.destroy()
    speechClient = null
  })
}

module.exports = setupNewClient;