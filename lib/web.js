let express = require('express');
let app = express();
app.set('view engine', 'ejs');

let bayeux = require('./bayeux');

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/test', (req, res) => {
  bayeux.getClient().publish('/updates', {
    text:       'New email has arrived!'
  });
})
module.exports = app;