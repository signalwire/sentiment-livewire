let express = require('express');
let app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {
  var sipDomain = process.env.SIP_DOMAIN
  var sipUsername = process.env.SIP_USERNAME
  var sipPassword = process.env.SIP_PASSWORD
  var sipApp = process.env.SIP_APP
  res.render('index', {sipDomain, sipUsername, sipPassword, sipApp});
})

module.exports = app;