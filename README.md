# rasa-api
rasa-api is a node package that allows you to easily configure and train your NLP through Rasa HTTP API.

Note that rasa-api uses `promises`, so be aware to always `catch` at least once when implementing your code.

Please refer to the official HTTP API documentation to know about available endpoints.

## Installation
```bash
npm install rasa-api
```

## Initialization
```Javascript
const Rasa = require('rasa-api')

const rasa = new Rasa('<ENDPOINT-URL>', '<YOUR-PROJECT-NAME>','<YOUR-SERVER-ACCESS-TOKEN>', '<TIMEOUT-IN-SECONDS>')
```

## Parse
```Javascript
rasa.parse('Wake me up when september end!').then((res) => {
  console.log(res)
}).catch((error) => {
  console.error(error)
})
```
## Training
You must provide data in JSON format. You can refer to [Rasa Documentation](https://rasa.com/docs/nlu/dataformat/) in order know about the data structure.
```Javascript
rasa.train({
  "common_examples": [{
    "text": "hey",
    "intent": "greet",
    "entities": []
  }, {
    "text": "i'm looking for a place in the north of town",
    "intent": "restaurant_search",
    "entities": [
      {
        "start": 31,
        "end": 36,
        "value": "north",
        "entity": "location"
      }
    ]
  }],
  "regex_features" : [],
  "lookup_tables"  : [],
  "entity_synonyms": []
}).then(res => {
  console.log(res)
}).catch((error) => {
  console.error(error)
})
```
## Evaluate
You must provide test dataset in JSON format. You can refer to [Rasa Documentation](https://rasa.com/docs/nlu/dataformat/) in order to learn about the data structure.
```Javascript
rasa.evaluate({
  "common_examples": [{
    "text": "hey",
    "intent": "greet",
    "entities": []
  }],
  "regex_features" : [],
  "lookup_tables"  : [],
  "entity_synonyms": []
}).then(res => {
  console.log(res)
})
```

## Status/Version/Config
```Javascript
//
let info = 'version' // You can pass one of the following ['version', 'status', 'config']
rasa.get(info).then(res => {
  console.log(res)
}).catch((error) => {
  console.error(error)
})
```

## Delete models
```Javascript
//
let model = 'model_20190221-114950'
rasa.delete(model).then(res => {
  console.log(res)
}).catch((error) => {
  console.error(error)
})
```
