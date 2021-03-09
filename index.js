let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./lib/web');
let setupNewClient = require('./lib/asr');

let wsInstance = new WSServer({
  server: server,
  path: "/asr"
});

server.on('request', app);
wsInstance.on('connection', setupNewClient)

server.listen(process.env.PORT || 5000, function() {
  console.log("http/ws server listening");
});
