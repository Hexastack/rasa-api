var expect = require('expect.js')

var Rasa = require('../')

var endpoint = process.env.endpoint
var token = process.env.token
var project = process.env.project

if (!token) {
  throw 'Must pass rasa app token as parameter `env token=XXXXXXXXX npm test`'
  process.exit()
}

if (!endpoint) {
  throw 'Must pass rasa endpoint as parameter `env endpoint=http://localhost:5000 npm test`'
  process.exit()
}

if (!project) {
  throw 'Must pass rasa endpoint as parameter `env endpoint=current npm test`'
  process.exit()
}

describe('Rasa', function () {
  describe('Instantiation', function () {
    it('Should create an instance of Rasa', function () {
      expect(new Rasa(endpoint, project, token)).to.be.a(Rasa)
    })
    it('Should contain doRequest method', function () {
      expect(new Rasa(endpoint, project, token)).to.have.property('request')
    })
    it('Must not hold or show the token', function () {
      const rasa = new Rasa(endpoint, project, token)
      for (var key in rasa) {
        expect(rasa[key]).to.not.be.equal(token)
      }
    })
  })

  const rasa = new Rasa(endpoint, project, token)

  describe('Train', function () {
    it('Should yield on a json response', function () {
      let training_data = require('./training_data.json')
      return rasa.train(training_data).then(res => {
        expect(res).to.be.an(Object)
        expect(res).to.have.property('info')
        expect(res).to.have.property('model')
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
  })

  describe('Evaluate', function () {
    it('Should yield on a json response', function () {
      let test_data = require('./test_data.json')
      return rasa.evaluate(test_data).then(res => {
        expect(res).to.be.an(Object)
        expect(res).to.have.property('intent_evaluation')
        expect(res.intent_evaluation).to.have.property('report')
        expect(res.intent_evaluation).to.have.property('predictions')
        expect(res.intent_evaluation).to.have.property('precision')
        expect(res.intent_evaluation).to.have.property('f1_score')
        expect(res.intent_evaluation).to.have.property('accuracy')
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
  })

  describe('Parse', function () {
    it('Should yield on a json response', function () {
      let text = "i'm looking for a place in the north of town"
      return rasa.parse(text).then(res => {
        expect(res).to.be.an(Object)
        expect(res).to.have.property('intent')
        expect(res.intent).to.have.property('name')
        expect(res.intent).to.have.property('confidence')
        expect(res.intent.name).to.be.equal('restaurant_search')
        expect(res).to.have.property('intent_ranking')
        expect(res.intent_ranking).to.be.an(Array)
        expect(res).to.have.property('text')
        expect(res.text).to.be.equal(text)
        expect(res).to.have.property('entities')
        expect(res.entities).to.be.an(Array)
        expect(res).to.have.property('project')
        expect(res.project).to.be.equal(project)
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
  })

  describe('Get Mic Infos', function () {
    it('Should yield on the status', function () {
      return rasa.get('status').then(res => {
        expect(res).to.be.an(Object)
        expect(res).to.have.property('available_projects')
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
    it('Should yield on the version', function () {
      return rasa.get('version').then(res => {
        expect(res).to.be.an(Object)
        expect(res).to.have.property('version')
        expect(res).to.have.property('minimum_compatible_version')
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
    it('Should yield on the config', function () {
      return rasa.get('config').then(res => {
        expect(res).to.be.an(Object)
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
    it('Should throw an error', function () {
      return rasa.get('undefined_path').catch(e => {
        expect(e).to.be.ok()
      })
    })
  })
  describe('Delete model', function () {
    it('Should throw an error of a non existing model', function () {
      return rasa.delete('undefined_model').catch(e => {
        expect(e).to.be.ok()
      })
    })
    it('Should delete existing model', function () {
      let training_data = require('./training_data.json')
      return rasa.train(training_data).then(res => {
        return rasa.delete(res.model).then(res => {
          expect(res).to.be.ok()
        })
      }).catch(e => {
        expect(e).to.not.be.ok()
      })
    })
  })
})
