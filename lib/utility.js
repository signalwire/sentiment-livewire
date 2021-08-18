const fetch = require('node-fetch');
const base64 = require('base-64');

async function apiRequest(endpoint, payload = {}, method = 'POST') {
  var url = `https://${process.env.SIGNALWIRE_SPACE}${endpoint}`

  var request = {
    method: method, // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Basic ${base64.encode(`${process.env.SIGNALWIRE_PROJECT_KEY}:${process.env.SIGNALWIRE_TOKEN}`)}`
    }
  }

  if (method != 'GET') {
    request.body = JSON.stringify(payload)
  }  
  const response = await fetch(url, request);
  return response.json(); // parses JSON response into native JavaScript objects
}

module.exports =  { apiRequest };