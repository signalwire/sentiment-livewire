let faye = require('faye');
let bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

bayeux.on('handshake', function(clientId) {
  console.log(clientId, 'connected to Faye')
})

bayeux.on('subscribe', function(clientId, channel) {
  console.log(clientId, 'subscribed to', channel)
})

module.exports = bayeux;