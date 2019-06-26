/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');
const { hasType } = util;

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;

// RFC3339regex

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

describe('Basic Documents', function() {
  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('basic')) {
      this.skip();
    }
  });

  describe('@context', function() {

    it('MUST be one or more URIs', async function() {
      const doc = await util.generate('example-1.jsonld', generatorOptions);
      doc.should.have.property('@context');
      doc['@context'].should.be.a('Array');
      doc['@context'].should.have.length.greaterThan(1);
    });

    it('MUST be one or more URIs (negative)', async function() {
      await expect(util.generate(
        'example-1-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('first value MUST be https://www.w3.org/2018/credentials/v1', async function() {
      const doc = await util.generate('example-1.jsonld', generatorOptions);
      expect(doc['@context'][0]).to.equal('https://www.w3.org/2018/credentials/v1');
    });

    it('first value MUST be https://www.w3.org/2018/credentials/v1 (negative)',
      async function() {
        await expect(util.generate(
          'example-1-bad-url.jsonld', generatorOptions))
          .to.be.rejectedWith(Error);
      });

    it('subsequent items can be objects that express context information', async function() {
      const doc = await util.generate('example-1-object-context.jsonld', generatorOptions);
      expect(doc['@context'][2]).to.eql({
        "image": { "@id": "schema:image", "@type": "@id" }
      });
    });
  });

  describe('`id` properties', function() {

    it('MUST be a single URI', async function() {
      const doc = await util.generate('example-2.jsonld', generatorOptions);
      doc.id.should.be.a('string');
      expect(doc.id).to.match(uriRegex);
      doc.credentialSubject.id.should.be.a('string');
      expect(doc.credentialSubject.id).to.match(uriRegex);
    });

    it('MUST be a single URI (negative)', async function() {
      await expect(util.generate(
        'example-2-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`type` properties', function() {

    it('MUST be one or more URIs', async function() {
      const doc = await util.generate('example-3.jsonld', generatorOptions);
      doc.type.should.be.a('Array');
    });

    it('MUST be one or more URIs (negative)', async function() {
      await expect(util.generate(
        'example-3-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('for Credential MUST be `VerifiableCredential` plus specific type', async function() {
      const doc = await util.generate('example-3.jsonld', generatorOptions);
      doc.type.should.have.length.greaterThan(1);
      doc.type.should.include('VerifiableCredential');
    });

    it('for Credential MUST be `VerifiableCredential` plus specific type (negative)', async function() {
      await expect(util.generate(
        'example-3-bad-missing-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`credentialSubject` property', function() {
    it('MUST be present', async function() {
      const doc = await util.generate('example-1.jsonld', generatorOptions);
      doc.should.have.property('credentialSubject');
      expect(doc.credentialSubject.id).to.match(uriRegex);
    });

    it('MUST be present, may be a set of objects', async function() {
      const doc = await util
        .generate('example-014-credential-subjects.jsonld', generatorOptions);
      doc.credentialSubject.should.be.a('Array');
      expect(doc.credentialSubject[0].id).to.match(uriRegex);
      expect(doc.credentialSubject[1].id).to.match(uriRegex);
    });

    it('MUST be present (negative - credentialSubject missing)', async function() {
      await expect(util.generate(
        'example-014-bad-no-credential-subject.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`issuer` property', function() {
    it('MUST be present', async function() {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.should.have.property('issuer');
      expect(doc.issuer).to.match(uriRegex);
    });

    it('MUST be present (negative - missing issuer)', async function() {
      await expect(util.generate(
        'example-4-bad-missing-issuer.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be a single URI', async function() {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.issuer.should.be.a('string');
      expect(doc.issuer).to.match(uriRegex);
    });

    it('MUST be a single URI (negative - not URI)', async function() {
      await expect(util.generate(
        'example-4-bad-issuer-uri.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be a single URI (negative - Array)', async function() {
      await expect(util.generate(
        'example-4-bad-issuer-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`issuanceDate` property', function() {
    it('MUST be present', async function() {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.should.have.property('issuanceDate');
    });

    it('MUST be present (negative - missing issuanceDate)', async function() {
      await expect(util.generate(
        'example-4-bad-missing-issuanceDate.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be an RFC3339 datetime', async function() {
      const doc = await util.generate('example-4.jsonld', generatorOptions);
      doc.issuanceDate.should.be.a('string');
      expect(doc.issuanceDate).to.match(util.RFC3339regex);
    });

    it('MUST be an RFC3339 datetime (negative - RFC3339)', async function() {
      await expect(util.generate(
        'example-4-bad-issuanceDate.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be an RFC3339 datetime (negative - Array)', async function() {
      await expect(util.generate(
        'example-4-bad-issuanceDate-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`proof` property', function() {

    it('MUST be present', async function() {
      const doc = await util.generate('example-5.jsonld', generatorOptions);
      expect(Array.isArray(doc.proof) || typeof doc.proof === 'object');
    });

    it('MUST include specific method using the type property', async function() {
      const doc = await util.generate('example-5.jsonld', generatorOptions);

      if (Array.isArray(doc.proof)) {
        doc.proof[0].should.have.property('type');
        doc.proof[0].type.should.be.a('string');
      } else {
        // only one proof
        doc.proof.should.have.property('type');
        doc.proof.type.should.be.a('string');
      }
    });

    it('MUST include type property (negative - missing proof type)', async function() {
      await expect(util.generate(
        'example-5-bad-proof-missing-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`expirationDate` property', function() {

    it('MUST be an RFC3339 datetime', async function() {
      const doc = await util.generate('example-6.jsonld', generatorOptions);
      doc.expirationDate.should.be.a('string');
      expect(doc.expirationDate).to.match(util.RFC3339regex);
    });

    it('MUST be an RFC3339 datetime (negative - RFC3339)', async function() {
      await expect(util.generate(
        'example-6-bad-expirationDate.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST be an RFC3339 datetime (negative - Array)', async function() {
      await expect(util.generate(
        'example-6-bad-cardinality.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('`credentialStatus` property', function() {

    it('MUST include `id` and `type`', async function() {
      const doc = await util.generate('example-7.jsonld', generatorOptions);
      doc.credentialStatus.id.should.be.a('string');
      should.exist(doc.credentialStatus.type);
    });

    it('MUST include `id` and `type` (negative - missing `id`)', async function() {
      await expect(util.generate(
        'example-7-bad-missing-id.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST include `id` and `type` (negative - missing `type`)', async function() {
      await expect(util.generate(
        'example-7-bad-missing-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

  describe('Presentations', function() {

    it('MUST be of type `VerifiablePresentation`', async function() {
      const doc = await util.generatePresentation('example-8.jsonld', generatorOptions);
      expect(hasType(doc, 'VerifiablePresentation')).to.be.true;
    });

    it('MUST include `verifiableCredential` and `proof`', async function() {
      const doc = await util.generatePresentation('example-8.jsonld', generatorOptions);
      should.exist(doc.verifiableCredential);
      should.exist(doc.proof);
    });

    it('MUST include `verifiableCredential` and `proof` (negative - missing `verifiableCredential`)', async function() {
      await expect(util.generatePresentation(
        'example-8-bad-missing-verifiableCredential.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

    it('MUST include `verifiableCredential` and `proof` (negative - missing `proof`)', async function() {
      await expect(util.generatePresentation(
        'example-8-bad-missing-proof.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });

});
