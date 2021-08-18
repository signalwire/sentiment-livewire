let express = require('express');
let app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
const utility = require('./utility');

app.get('/', async (req, res) => {
  var sipApp = process.env.SIP_APP
  var defaultDestination = process.env.DEFAULT_DESTINATION
  var projectId = process.env.SIGNALWIRE_PROJECT_KEY
  var token = await utility.apiRequest('/api/relay/rest/jwt', { expires_in: 120 }) 
  res.render('index', { sipApp, defaultDestination, projectId, token: token.jwt_token });
})

module.exports = app;