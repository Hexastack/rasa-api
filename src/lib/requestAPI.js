const http = require('http');
const querystring = require('querystring');

function fetch(url, { method, qs, headers, body, timeout }) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      timeout,
      method,
      headers: {
        Accept: 'application/json',
        Connection: 'keep-alive',
        'Keep-Alive': 'timeout=10, max=1000',
        ...headers,
        'Content-Type': !headers['Content-Type']
          ? 'application/json; charset=utf-8'
          : headers['Content-Type'],
      },
      qs,
      path: urlObj.pathname + '?' + querystring.stringify(qs),
    };

    if (
      options.method &&
      ['POST', 'PUT', 'PATCH'].indexOf(options.method.toUpperCase()) !== -1
    ) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    let timeouted = false;
    const req = http.request(options, function (res) {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        let response = {};
        try {
          response = JSON.parse(body);
        } catch (e) {
          return reject(e);
        }
        if (response.error) return reject(new Error(response.error));
        return resolve(response);
      });
    });
    req.on('timeout', () => {
      timeouted = true;
      req.abort();
    });
    req.on('abort', (err) => {
      if (timeouted) {
        return reject(
          new Error(`Request timed-out, request was ${req._header}`)
        );
      }
      return reject(new Error(`Request aborted, request was ${req._header}`));
    });
    req.on('error', function (err) {
      return reject(err);
    });
    if (
      options.method &&
      ['POST', 'PUT', 'PATCH'].indexOf(options.method.toUpperCase()) !== -1
    )
      req.write(body);
    req.end();
  });
}

module.exports = function ({ baseUrl, headers, params, timeout }) {
  return async function ({ method = 'GET', uri, body = null, qs = {} }) {
    const url = `${baseUrl}${uri}`;
    try {
      const data = await fetch(url, {
        method,
        headers,
        qs: { ...params, ...qs },
        body: body ? JSON.stringify(body) : null,
        timeout,
      });
      return data;
    } catch (error) {
      console.error(`Rasa API : Request failed`, error);
      throw error;
    }
  };
};
