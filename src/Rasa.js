const request = require('request')
const requestApi = require('./lib/requestAPI')
const url = require('url')

function Rasa(endpoint, project, token, timeout) {
  this.project = project || 'current'
  let conf = {
    baseUrl: endpoint,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    qs: {
      project: this.project,
      token: token || '',
    },
    timeout: timeout || 20000
  }
  const requestWrapper = request.defaults(conf)
  this.request = requestApi(requestWrapper)
  this.actions = {
    train: {
      method: 'POST',
      uri: '/train'
    },
    evaluate: {
      method: 'POST',
      uri: '/evaluate'
    },
    parse: {
      method: 'POST',
      uri: '/parse'
    },
    status: {
      method: 'GET',
      uri: '/status'
    },
    version: {
      method: 'GET',
      uri: '/version'
    },
    config: {
      method: 'GET',
      uri: '/config'
    },
    delete: {
      method: 'DELETE',
      uri: '/models'
    }
  }
}

Rasa.prototype.send = function (endpoint, body) {
  let payload = this.actions[endpoint]
  return new Promise((resolve, reject) => {
    if (['POST', 'PUT'].indexOf(payload.method) !== -1) {
      try {
        payload.body = JSON.stringify(body)
      } catch (e) {
        return reject(e)
      }
    } else {
      payload.qs = body
    }
    this.request(payload, (err, res) => {
      if (err) {
        return reject(err)
      }
      return resolve(res)
    })
  })
}

Rasa.prototype.train = function (rasa_nlu_data) {
  let body = {rasa_nlu_data}
  return this.send('train', body)
}

Rasa.prototype.evaluate = function (rasa_nlu_data) {
  let body = {rasa_nlu_data}
  return this.send('evaluate', body)
}

Rasa.prototype.parse = function (text) {
  let body = {
    q: text,
    project: this.project
  }
  return this.send('parse', body)
}

Rasa.prototype.get = function (info) {
  if (info in this.actions) {
    return this.send(info)
  }
  return Promise.reject(new Error('Endpoint path is not defined in Rasa client : /' + info))
}

Rasa.prototype.delete = function (model) {
  let body = {
    model: model,
    project: this.project
  }
  return this.send('delete', body)
}

module.exports = Rasa
