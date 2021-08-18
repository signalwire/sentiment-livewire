var client;
var currentCall = null;

ready(function() {
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

  client.__logger.setLevel(client.__logger.levels.DEBUG)

  client.remoteElement = 'remoteVideo';
  client.localElement = 'localVideo';

  client.enableMicrophone();
  client.disableWebcam();

  client.on('signalwire.ready', function() {
    // btnConnect.classList.add('d-none');
    // btnDisconnect.classList.remove('d-none');
    connectStatus.innerHTML = 'Ready';

    startCall.disabled = false;
  });

  // Update UI on socket close
  client.on('signalwire.socket.close', function() {
    // btnConnect.classList.remove('d-none');
    // btnDisconnect.classList.add('d-none');
    connectStatus.innerHTML = 'Disconnected';
  });

  // Handle error...
  client.on('signalwire.error', function(error){
    console.error("SignalWire error:", error);
  });

  client.on('signalwire.notification', handleNotification);

  connectStatus.innerHTML = 'Connecting...';
  client.connect();
}

function disconnect() {
  connectStatus.innerHTML = 'Disconnecting...';
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
      connectStatus.innerHTML = 'Ringing...';
      break;
    case 'recovering': // Call is recovering from a previous session
      if (confirm('Recover the previous call?')) {
        currentCall.answer();
      } else {
        currentCall.hangup();
      }
      break;
    case 'ringing': // Someone is calling you
      if (confirm('Pick up the call?')) {
        currentCall.answer();
      } else {
        currentCall.hangup();
      }
      break;
    case 'active': // Call has become active
      startCall.classList.add('d-none');
      hangupCall.classList.remove('d-none');
      hangupCall.disabled = false;
      connectStatus.innerHTML = 'On call';
      break;
    case 'hangup': // Call is over
      startCall.classList.remove('d-none');
      hangupCall.classList.add('d-none');
      hangupCall.disabled = true;
      break;
    case 'destroy': // Call has been destroyed
      currentCall = null;
      startCall.disabled = false;
      connectStatus.innerHTML = 'Ready';
      break;
  }
}

/**
  * Make a new outbound call
*/
function makeCall() {
  const params = {
    destinationNumber: document.getElementById('destinations').value,
    audio: true,
    video: false,
  };

  currentCall = client.newCall(params);
  startCall.disabled = true;
}

/**
  * Hangup the currentCall if present
*/
function hangup() {
  if (currentCall) {
    currentCall.hangup()
    startCall.disabled = false;
  }
  connectStatus.innerHTML = 'Ready';
}

function saveInLocalStorage(e) {
  var key = e.target.name || e.target.id
  localStorage.setItem('relay.example.' + key, e.target.value);
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