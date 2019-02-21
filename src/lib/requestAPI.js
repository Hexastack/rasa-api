module.exports = function(request) {
  return function (params, callback) {
    request(params, (error, response, body) => {
      if (error) {
        return callback(error, null)
      }
      let json = {}
      try {
        json = JSON.parse(body)
      } catch(e) {
        return callback(e, null)
      }

      if (response && response.statusCode != '200') {
        const err = new Error(json.error || json.body)
        err.code = json.code
        return callback(err, null)
      }

      return callback(null, json)
    });
  }
}
