import expect from 'expect.js';
import Rasa from '../index.js';
import trainingData from './training_data.json' assert { type: 'json' };
import testData from './test_data.json' assert { type: 'json' };
import nock from 'nock';

const endpoint = 'http://localhost:5000';
const token = 'my123Token';
const project = 'myProject';

const text = "i'm looking for a place in the north of town";

nock(endpoint)
  .post('/train')
  .query({
    project: project,
    token: token,
  })
  .reply((uri, requestBody) => {
    if ('rasa_nlu_data' in requestBody) {
      return [
        200,
        { info: 'Success', model: 'xxxxxxx' },
        //{ header: 'value' }, // optional headers
      ];
    } else {
      return [500, { error: 100, body: 'Train Error' }];
    }
  })
  .post('/evaluate')
  .query({
    project: project,
    token: token,
  })
  .reply((uri, requestBody) => {
    if ('rasa_nlu_data' in requestBody) {
      return [
        200,
        {
          intent_evaluation: {
            report: '',
            predictions: '',
            precision: 0,
            f1_score: 0,
            accuracy: 0,
          },
        },
        //{ header: 'value' }, // optional headers
      ];
    } else {
      return [500, { error: 200, body: 'Evaluate Error' }];
    }
  })
  .post('/parse')
  .query({
    project: project,
    token: token,
  })
  .reply((uri, requestBody) => {
    if (requestBody.q === text && requestBody.project === project) {
      return [
        200,
        {
          text,
          project,
          intent_ranking: [],
          entities: [],
          intent: {
            name: 'restaurant_search',
            confidence: .9,
            f1_score: 0,
            accuracy: 0,
          },
        },
      ];
    } else {
      return [500, { error: 200, body: 'Evaluate Error' }];
    }
  });

describe('Rasa', function () {
  describe('Instantiation', function () {
    it('Should create an instance of Rasa', function () {
      expect(new Rasa(endpoint, project, token)).to.be.a(Rasa);
    });
    it('Should contain doRequest method', function () {
      expect(new Rasa(endpoint, project, token)).to.have.property('request');
    });
    it('Must not hold or show the token', function () {
      const rasa = new Rasa(endpoint, project, token);
      for (var key in rasa) {
        expect(rasa[key]).to.not.be.equal(token);
      }
    });
  });

  const rasa = new Rasa(endpoint, project, token);

  describe('Train', function () {
    it('Should yield on a json response', function () {
      return rasa
        .train(trainingData)
        .then((res) => {
          console.log(res, '000000');
          expect(res).to.be.an(Object);
          expect(res).to.have.property('info');
          expect(res).to.have.property('model');
        })
        .catch((e) => {
          console.log(e, '11111');
          expect(e).to.not.be.ok();
        });
    });
  });

  describe('Evaluate', function () {
    it('Should yield on a json response', function () {
      return rasa
        .evaluate(testData)
        .then((res) => {
          expect(res).to.be.an(Object);
          expect(res).to.have.property('intent_evaluation');
          expect(res.intent_evaluation).to.have.property('report');
          expect(res.intent_evaluation).to.have.property('predictions');
          expect(res.intent_evaluation).to.have.property('precision');
          expect(res.intent_evaluation).to.have.property('f1_score');
          expect(res.intent_evaluation).to.have.property('accuracy');
        })
        .catch((e) => {
          expect(e).to.not.be.ok();
        });
    });
  });

  describe('Parse', function () {
    it('Should yield on a json response', function () {
      return rasa
        .parse(text)
        .then((res) => {
          expect(res).to.be.an(Object);
          expect(res).to.have.property('intent');
          expect(res.intent).to.have.property('name');
          expect(res.intent).to.have.property('confidence');
          expect(res.intent.name).to.be.equal('restaurant_search');
          expect(res).to.have.property('intent_ranking');
          expect(res.intent_ranking).to.be.an(Array);
          expect(res).to.have.property('text');
          expect(res.text).to.be.equal(text);
          expect(res).to.have.property('entities');
          expect(res.entities).to.be.an(Array);
          expect(res).to.have.property('project');
          expect(res.project).to.be.equal(project);
        })
        .catch((e) => {
          expect(e).to.not.be.ok();
        });
    });
  });

  // TODO: mock the following api calls
  // describe('Get Mic Infos', function () {
  //   it('Should yield on the status', function () {
  //     return rasa
  //       .get('status')
  //       .then((res) => {
  //         expect(res).to.be.an(Object);
  //         expect(res).to.have.property('available_projects');
  //       })
  //       .catch((e) => {
  //         expect(e).to.not.be.ok();
  //       });
  //   });
  //   it('Should yield on the version', function () {
  //     return rasa
  //       .get('version')
  //       .then((res) => {
  //         expect(res).to.be.an(Object);
  //         expect(res).to.have.property('version');
  //         expect(res).to.have.property('minimum_compatible_version');
  //       })
  //       .catch((e) => {
  //         expect(e).to.not.be.ok();
  //       });
  //   });
  //   it('Should yield on the config', function () {
  //     return rasa
  //       .get('config')
  //       .then((res) => {
  //         expect(res).to.be.an(Object);
  //       })
  //       .catch((e) => {
  //         expect(e).to.not.be.ok();
  //       });
  //   });
  //   it('Should throw an error', function () {
  //     return rasa.get('undefined_path').catch((e) => {
  //       expect(e).to.be.ok();
  //     });
  //   });
  // });
  // describe('Delete model', function () {
  //   it('Should throw an error of a non existing model', function () {
  //     return rasa.delete('undefined_model').catch((e) => {
  //       expect(e).to.be.ok();
  //     });
  //   });
  //   it('Should delete existing model', function () {
  //     return rasa
  //       .train(trainingData)
  //       .then((res) => {
  //         return rasa.delete(res.model).then((res) => {
  //           expect(res).to.be.ok();
  //         });
  //       })
  //       .catch((e) => {
  //         expect(e).to.not.be.ok();
  //       });
  //   });
  // });
});
