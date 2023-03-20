const buildApiRequest = require('./lib/requestAPI.js');

class Rasa {
  constructor(endpoint, project, token, timeout = 30 * 1000) {
    this.project = project || 'current';
    let conf = {
      baseUrl: endpoint,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      params: {
        project: this.project,
        token: token || '',
      },
      timeout
    };
    this.request = buildApiRequest(conf);
    this.actions = {
      train: {
        method: 'POST',
        uri: '/train',
      },
      evaluate: {
        method: 'POST',
        uri: '/evaluate',
      },
      parse: {
        method: 'POST',
        uri: '/parse',
      },
      status: {
        method: 'GET',
        uri: '/status',
      },
      version: {
        method: 'GET',
        uri: '/version',
      },
      config: {
        method: 'GET',
        uri: '/config',
      },
      delete: {
        method: 'DELETE',
        uri: '/models',
      },
    };
  }
  send(endpoint, data) {
    let payload = { ...this.actions[endpoint] };
    if (['POST', 'PUT'].indexOf(payload.method) !== -1) {
      payload.body = data;
    } else {
      payload.qs = data;
    }

    return this.request(payload);
  }
  train(rasa_nlu_data) {
    let body = { rasa_nlu_data };
    return this.send('train', body);
  }
  evaluate(rasa_nlu_data) {
    let body = { rasa_nlu_data };
    return this.send('evaluate', body);
  }
  parse(text) {
    let body = {
      q: text,
      project: this.project,
    };
    return this.send('parse', body);
  }
  get(info) {
    if (info in this.actions) {
      return this.send(info);
    }
    return Promise.reject(
      new Error('Endpoint path is not defined in Rasa client : /' + info)
    );
  }
  delete(model) {
    let body = {
      model: model,
      project: this.project,
    };
    return this.send('delete', body);
  }
}

module.exports = Rasa;
