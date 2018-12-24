/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;
const iso8601Regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/

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

  describe('`type` properties', () => {

    it('MUST be one or more URIs', async () => {
      const doc = await util.generate('example-3.jsonld', generatorOptions);
      doc.type.should.be.a('Array');
    });

    it('MUST be one or more URIs (negative)', async () => {
      expect(util.generate(
        'example-3-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('for Credential MUST be `VerifiableCredential` plus specific type', async () => {
      const doc = await util.generate('example-3.jsonld', generatorOptions);
      doc.type.should.have.length.greaterThan(1);
      doc.type.should.include('VerifiableCredential');
    });

    it('for Credential MUST be `VerifiableCredential` plus specific type (negative)', async () => {
      expect(util.generate(
        'example-3-bad-missing-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`issuer` property', () => {

    it('MUST be a single URI', async () => {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.issuer.should.be.a('string');
      expect(doc.issuer).to.match(uriRegex);
    });

    it('MUST be a single URI (negative - not URI)', async () => {
      expect(util.generate(
        'example-4-bad-issuer-uri.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be a single URI (negative - Array)', async () => {
      expect(util.generate(
        'example-4-bad-issuer-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`issuanceDate` property', () => {

    it('MUST be an ISO8601 datetime', async () => {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.issuanceDate.should.be.a('string');
      expect(doc.issuanceDate).to.match(iso8601Regex);
    });

    it('MUST be an ISO8601 datetime (negative - ISO8601)', async () => {
      expect(util.generate(
        'example-4-bad-issuanceDate.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be an ISO8601 datetime (negative - Array)', async () => {
      expect(util.generate(
        'example-4-bad-issuanceDate-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`proof` property', () => {

    it('MUST be present', async () => {
      const doc = await util.generate('example-5.jsonld', generatorOptions);
      doc.proof.should.be.a('Object');
    });

    it('MUST be present (negative - missing)', async () => {
      expect(util.generate(
        'example-5-bad-proof.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`expirationDate` property', () => {

    it('MUST be an ISO8601 datetime', async () => {
      const doc = await util.generate('example-6.jsonld', generatorOptions);
      doc.expirationDate.should.be.a('string');
      expect(doc.expirationDate).to.match(iso8601Regex);
    });

    it('MUST be an ISO8601 datetime (negative - ISO8601)', async () => {
      expect(util.generate(
        'example-6-bad-expirationDate.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be an ISO8601 datetime (negative - Array)', async () => {
      expect(util.generate(
        'example-6-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

});
