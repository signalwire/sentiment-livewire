var client;
var currentCall = null;
let _statsInterval = null;

var _timer = null

ready(function() {
  _timer = performance.now();
  connect();
});

/**
  * Connect with Relay creating a client and attaching all the event handler.
*/
function connect() {
  client = new Relay({
    project: project,
    token: token
  });

  client.iceServers = [
      {
        "urls": [ "stun:stun.l.google.com:19302" ]
      }
    ]

  client.__logger.setLevel(client.__logger.levels.INFO)

  client.remoteElement = 'remoteVideo';
  client.localElement = 'localVideo';

  client.enableMicrophone();
  client.disableWebcam();

  client.on('signalwire.ready', function() {
    setStatus('Registered to SignalWire');
    show('callForm');
    reportTimerStat('client connect', performance.now() - _timer);
    _timer = null
  });

  // Update UI on socket close
  client.on('signalwire.socket.close', function() {
    setStatus('Ready');
    show('callbtn');
    hide('hangupbtn');
  });

  // Handle error...
  client.on('signalwire.error', function(error){
    console.error("SignalWire error:", error);
  });

  client.on('signalwire.notification', handleNotification);

  setStatus('Connecting...');
  client.connect();
}

function disconnect() {
  setStatus('Disconnecting...');
  client.disconnect();
}

/**
  * Handle notification from the client.
*/
function handleNotification(notification) {
  console.log("notification", notification.type, notification);
  switch (notification.type) {
    case 'callUpdate':
      handleCallUpdate(notification.call);
      break;
    case 'userMediaError':
      // Permission denied or invalid audio/video params on `getUserMedia`
      console.error("SignalWire userMediaError:", notification);
      break;
  }
}

/**
  * Update the UI when the call's state change
*/
function handleCallUpdate(call) {
  currentCall = call;

  switch (call.state) {
    case 'new': // Setup the UI
      break;
    case 'trying': // You are trying to call someone and he's ringing now
      setStatus('Ringing...');
      break;
    case 'recovering': // Call is recovering from a previous session
      if (confirm('Recover the previous call?')) {
        currentCall.answer();
      } else {
        currentCall.hangup();
      }
      break;
    case 'ringing': // Someone is calling you
      // we don't actually need this here
      console.log('or do we');
      break;
    case 'active': // Call has become active
      setStatus('Call is active');
      hide('callbtn');
      show('hangupbtn');
      toggleStats();
      reportTimerStat('call setup', performance.now() - _timer);
      _timer = null
      break;
    case 'hangup': // Call is over
      setStatus('Ready');
      show('callbtn');
      hide('hangupbtn');
      toggleStats();
      break;
    case 'destroy': // Call has been destroyed
      currentCall = null;
      break;
  }
}

/**
  * Make a new outbound call
*/
function makeCall() {
  _timer = performance.now();
  var destination = document.getElementById('destination').value + '@' + app;
  console.log('Calling ', destination);
  const params = {
    destinationNumber: destination,
    audio: true,
    video: false,
  };

  currentCall = client.newCall(params);
}

/**
  * Hangup the currentCall if present
*/
function hangUp() {
  if (currentCall) {
    currentCall.hangup();
  };
}

// these are support functions, not part of the main application

function show(selector) {
  var x = document.getElementById(selector);
  x.style.display = "block";
}

function hide(selector) {
  var x = document.getElementById(selector);
  x.style.display = "none";
}

function setStatus(text) {
  document.getElementById("status").innerHTML = text;
}

async function toggleStats() {
  if (_statsInterval) {
    return clearInterval(_statsInterval)
  }
  // Start the loop every 2 secs
  _statsInterval = window.setInterval(async () => {
    const stats = await currentCall.peer.instance.getStats(null)
    const keys = ['jitter', 'packetsLost', 'roundTripTime', 'roundTripTimeMeasurements', 'timestamp', 'totalRoundTripTime' ];
    stats.forEach(report => {
      if (report.type == 'remote-inbound-rtp') {
        /*
        codecId: "RTCCodec_audio_Outbound_111"
        fractionLost: 0
        id: "RTCRemoteInboundRtpAudioStream_1112257779"
        jitter: 0.006333333333333333
        kind: "audio"
        localId: "RTCOutboundRTPAudioStream_1112257779"
        packetsLost: 1
        roundTripTime: 0.162
        roundTripTimeMeasurements: 2
        ssrc: 1112257779
        timestamp: 1629302066960.565
        totalRoundTripTime: 0.308
        transportId: "RTCTransport_audio_1"
        type: "remote-inbound-rtp"
        */
        console.log('report', report);

        var elm = document.createElement('div');
        var titleElm = document.createElement('h5');
        titleElm.innerText = 'WebRTC Report';
        elm.appendChild(titleElm);

        keys.forEach(k => {
          console.log(k)
          var line = document.createElement('div');
          line.innerHTML = "<b>" + k + "</b>: " + report[k];
          console.log(line)
          elm.appendChild(line);
        })

        document.getElementById('stats').appendChild(elm);
      }
    })
    
  }, 2000)
}

function reportTimerStat(title, stat) {
  console.log(title, stat)
  var elm = document.createElement('div');
  var titleElm = document.createElement('h5');
  titleElm.innerText = title
  elm.appendChild(titleElm);

  var bodyElm = document.createElement('div');
  bodyElm.innerText = Math.round(stat) + ' ms';
  elm.appendChild(bodyElm);

  document.getElementById('stats').appendChild(elm);
}

// jQuery document.ready equivalent
function ready(callback) {
  if (document.readyState != 'loading') {
    callback();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading') {
        callback();
      }
    });
  }
}