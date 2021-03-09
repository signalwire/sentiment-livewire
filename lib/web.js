let express = require('express');
let app = express();
app.set('view engine', 'ejs');

let bayeux = require('./bayeux');

// async function quickstart() {
//   // Imports the Google Cloud client library
//   const language = require('@google-cloud/language');

//   // Instantiates a client
//   const client = new language.LanguageServiceClient();

//   // The text to analyze
//   const text = 'Hello, world!';

//   const document = {
//     content: text,
//     type: 'PLAIN_TEXT',
//   };

//   // Detects the sentiment of the text
//   const [result] = await client.analyzeSentiment({document: document});
//   const sentiment = result.documentSentiment;

//   console.log(`Text: ${text}`);
//   console.log(`Sentiment score: ${sentiment.score}`);
//   console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
// }

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/test', (req, res) => {
  bayeux.getClient().publish('/updates', {
    text:       'New email has arrived!'
  });
})
module.exports = app;