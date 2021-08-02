require('dotenv').config();
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
