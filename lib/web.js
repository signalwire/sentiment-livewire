let express = require('express');
let app = express();
app.set('view engine', 'ejs');

let bayeux = require('./bayeux');

app.get('/', (req, res) => {
  res.render('index');
})

module.exports = app;