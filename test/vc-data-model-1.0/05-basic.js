/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;

// configure chai
chai.should();
chai.use(require('chai-as-promised'));

describe('Document', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  describe('@context', () => {

    it('MUST be one or more URIs', async () => {
      const doc = await util.generate('example-1.jsonld', generatorOptions);
      doc.should.have.property('@context');
      doc['@context'].should.be.a('Array');
      doc['@context'].should.have.length.greaterThan(1);
    });

    it('MUST be one or more URIs (negative)', async () => {
      expect(util.generate(
        'example-1-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('first value MUST be https://w3.org/2018/credentials/v1', async () => {
      const doc = await util.generate('example-1.jsonld', generatorOptions);
      expect(doc['@context'][0]).to.equal('https://w3.org/2018/credentials/v1');
    });

    it('first value MUST be https://w3.org/2018/credentials/v1 (negative)',
      async () => {
        expect(util.generate('example-1-bad-url.jsonld', generatorOptions))
          .to.be.rejectedWith(Error);
      });
  });

  describe('`id` properties', () => {

    it('MUST be a single URI', async () => {
      const doc = await util.generate('example-2.jsonld', generatorOptions);
      doc.id.should.be.a('string');
      expect(doc.id).to.match(uriRegex);
      doc.credentialSubject.id.should.be.a('string');
      expect(doc.credentialSubject.id).to.match(uriRegex);
    });

    it('MUST be a single URI (negative)', async () => {
      expect(util.generate(
        'example-2-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

});
