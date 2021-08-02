var simple = null;
var options = null;
var ringtone = null;

function connect() {
  var sip_url = user + '@' + domain;
  console.log(sip_url);
  console.log(pass);

  options = {
    media: {
      remote: {
        audio: document.getElementById('remoteVideo')
      }
    },
    wsServers: domain,
    ua: {
      wsServers: "wss://" + domain,
      uri: sip_url,
      password: pass,
      traceSip: true
    }
  };

  // this sets up the main object
  simple = new SIP.Web.Simple(options);

  // set up event handlers 
  simple.on('registered', function() {
    console.log('reged')
    setStatus('Registered to SIgnalWire');
    show('callForm');
  });

  simple.on('connecting', function() {
    setStatus('Call ringing');
    hide('callbtn');
    show('hangupbtn');
  });

  simple.on('connected', function() {
    setStatus('Call connected!');
  });

  simple.on('ringing', function() {
    console.log('Incoming call received, ignoring');
  });
}

// place a call to the destination
function doCall() {
  var destination = document.getElementById('destination').value + '@' + app;
  console.log('calling', destination);
  simple.call(destination);
}

// hang up any call
function hangUp() {
  simple.hangup();
  setStatus('Ready');
  show('callbtn');
  hide('hangupbtn');
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

window.ready = (callback) => {
  if (document.readyState != 'loading') {
    callback()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callback)
  } else {
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState != 'loading') {
        callback()
      }
    })
  }
}

window.ready(function () {
  connect();
})