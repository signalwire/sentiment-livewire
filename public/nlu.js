function handleStart(message) {
  var card = createCard('Start');
  document.getElementById('output').appendChild(card);
}

function handleStop(message) {
  var card = createCard('Stop');
  document.getElementById('output').appendChild(card);
}

function handleMedia(message) {
  var card = createCard('Media');

  var cardBody = document.createElement("div");
  cardBody.className = 'card-body';

  var classMapping = {
    'strong_positive': 'bg-success',
    'weak_positive': 'bg-primary',
    'neutral': 'bg-secondary',
    'weak_negative': 'bg-info',
    'strong_negative': 'bg-danger',
  }

  var innerBody = '<p><span class="badge ' + classMapping[message.sentiment.interpretation] + ' text-light">' + message.sentiment.interpretation + '</span></p>';
  innerBody += '<p class="card-text">Score: ' + message.sentiment.score + '</p>';
  innerBody += '<h5 class="card-title">Entities</h5>';

  message.entities.forEach(entity => {
    innerBody += '<p class="card-text"><b>Entity:</b> "' + entity.name + '"</p>';
    innerBody += '<p class="card-text"><b>Relevant:</b> "' + entity.relevant + '"</p>';
  });

  cardBody.innerHTML = innerBody;
  card.appendChild(cardBody);

  document.getElementById('output').appendChild(card);
}

function createCard(title) {
  var newDiv = document.createElement("div");
  newDiv.className = 'card';
  
  var cardTitle = document.createElement("h5");
  cardTitle.className = 'card-header';
  cardTitle.innerText = title;
  newDiv.appendChild(cardTitle);

  return newDiv;
}


var client = new Faye.Client('/faye');
var subscription = client.subscribe('/updates', function(message) {
  console.log(message);

  switch (message.event) {
    case 'start':
      handleStart(message);
      break;
    case 'stop':
      handleStop(message);
      break;
    case 'media':
      handleMedia(message);
      break;
  }
});