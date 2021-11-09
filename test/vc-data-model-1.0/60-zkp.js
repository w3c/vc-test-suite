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

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

// https://w3c.github.io/vc-data-model/#zero-knowledge-proofs
describe('Zero-Knowledge Proofs (optional)', function() {
  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('zkp')) {
      this.skip();
    }
  });

  describe('A verifiable credential...', function() {
    it('MUST contain a credentialSchema', async function() {
      const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.credentialSchema) &&
        doc.credentialSchema.length > 0;
      const isObject = doc.credentialSchema && typeof doc.credentialSchema.id === 'string';
      expect(isArray || isObject).to.be.true;
    });
    it('MUST contain a credentialSchema (negative - credentialSchema missing)', async function() {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
    describe('Each credentialSchema...', function() {
      it('MUST specify a type', async function() {
        const doc = await util.generate('example-015-zkp-credential-schema-array.jsonld',
        generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.type.should.be.a('string');
        }
      });
       it('MUST specify a type (negative - type missing)', async function() {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
      });
      it('MUST specify an `id` property', async function() {
        // test for `id` property existence
        const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
        should.exist(doc.credentialSchema.id);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.id.should.be.a('string');
        }
      });
      it('MUST specify an `id` property (negative - `id` missing)', async function() {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema-id.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
      });

      it('value of `id` MUST be a URI identifying a schema file', async function() {
        // test that `id`'s value is a valid URI
        // TODO: https://github.com/w3c/vc-data-model/issues/381
        const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
        const schemas = [].concat(doc.credentialSchema);

        for(let schema of schemas) {
          expect(schema.id).to.match(uriRegex);
        }
      });
    });
    // all verifiable credentials need to have a proof,
    // so these tests feel redundant
    it('MUST contain a proof', async function() {
      const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
      expect(Array.isArray(doc.proof) || typeof doc.proof === 'object');
    });

    it('MUST contain a proof (negative - missing)', async function() {
      await expect(util.generate(
        'example-015-zkp-bad-no-proof.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
    describe('Each proof...', function() {
      it('MUST include specific method using the type property', async function() {
        const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);

        if (Array.isArray(doc.proof)) {
          let proofs = [].concat(doc.proofs)
          for(let proof of proofs){
            proof.should.have.property('type');
            proof.type.should.be.a('string');
          }

        } else {
          // only one proof
          doc.proof.should.have.property('type');
          doc.proof.type.should.be.a('string');
        }
      });
      it('proof MUST include type property (negative - missing proof type)', async function() {
        await expect(util.generate(
          'example-015-zkp-bad-proof-missing-type.jsonld', generatorOptions))
          .to.be.rejectedWith(Error);
      });
    });

  });
  describe('A verifiable presentation...', function() {

    it('MUST be of type `VerifiablePresentation`', async function() {
      const doc = await util.generatePresentation('example-015-zkp-vp.jsonld', generatorOptions);
      expect(hasType(doc, 'VerifiablePresentation')).to.be.true;
    });

    describe('Each verifiable credential...', function() {
      it('MUST have a `credentialSchema` member', async function() {
        const doc = await util.generatePresentation('example-015-zkp-vp.jsonld', generatorOptions);
        if (Array.isArray(doc.verifiableCredential)) {
          let creds = [].concat(doc.verifiableCredential)
          for(let cred of creds){
            const isArray = Array.isArray(cred.credentialSchema) && cred.credentialSchema.length > 0;
            const isObject = cred.credentialSchema && typeof cred.credentialSchema.id === 'string';
            expect(isArray || isObject).to.be.true;
          }
        } else {
          // only one credential
          const isArray = Array.isArray(doc.verifiableCredential.credentialSchema) && doc.verifiableCredential.credentialSchema.length > 0;
          const isObject = doc.verifiableCredential.credentialSchema && typeof doc.verifiableCredential.credentialSchema.id === 'string';
          expect(isArray || isObject).to.be.true;
        }
      });
      it('MUST contain a credentialSchema (negative - credentialSchema missing)', async function() {
        await expect(util.generate(
          'example-015-zkp-vp-bad-no-credential-schema.jsonld', generatorOptions))
          .to.be.rejectedWith(Error);
      });
    });

    it.skip('MUST NOT leak information', async function() {
    /*A verifiable presentation MUST NOT leak information that would enable the verifier to
    correlate the holder across multiple verifiable presentations.*/
    });

    it('MUST include `proof`', async function() {
      const doc = await util.generatePresentation('example-015-zkp-vp.jsonld', generatorOptions);
      should.exist(doc.proof);
    });

    it('MUST include `proof` (negative - missing `proof`)', async function() {
      await expect(util.generatePresentation(
        'example-015-zkp-vp-bad-missing-proof.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });

  });
});
