const language = require('@google-cloud/language');
const { steelblue } = require('color-name');
const client = new language.LanguageServiceClient();
let bayeux = require('./bayeux');

async function sentiment(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  const [result] = await client.analyzeSentiment({document: document});
  const sentiment = result.documentSentiment;
  var output = { score: sentiment.score, magnitude: sentiment.magnitude }

  // https://cloud.google.com/natural-language/docs/basics#interpreting_sentiment_analysis_values
  // in the smaller chunks we get from a phone call, a magnitude above 2.5 is considered high
  var modifier = (sentiment.magnitude > 2.5 ? 0 : 0.1)
  var computed_score = (sentiment.score > 0 ? sentiment.score - modifier : sentiment.score + modifier)
  
  if (computed_score >= 0.25) {
    output.interpretation = "strong_positive"
  } else if (computed_score >= 0.15 && computed_score < 0.25) {
    output.interpretation = "weak_positive"
  } else if (computed_score >= -0.15 && computed_score < 0.15) {
    output.interpretation = "neutral"
  } else if (computed_score >= - 0.25 && computed_score < -0.15) {
    output.interpretation = "weak_negative"
  } else {
    output.interpretation = "strong_negative"
  }

  return output
}

async function entities(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };

  const [result] = await client.analyzeEntities({document});
  const entities = result.entities;

  // https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
  // we perform a little bit of filtering for the sake of the demo
  var computed = []

  entities.forEach(entity => {
    if (entity.salience > 0.05) {
      computed.push({
        name: entity.name,
        salience: entity.salience,
        type: entity.type,
        relevant: (entity.salience > 0.2)
      });
    }
  });
  return computed
}


function update(msg) {
  bayeux.getClient().publish('/updates', msg);
}

async function analyze_and_update(text, streamSid) {
  var msg = { text: text, streamSid: streamSid }
  msg.sentiment = await sentiment(text)
  msg.entities = await entities(text)

  update(msg)
}

module.exports = analyze_and_update;