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
    it.skip('derived verifiable credential MUST contain all information necessary to verify', async function() {
    /*Each derived verifiable credential within a verifiable presentation MUST
     contain all information necessary to verify the verifiable credential,
     either by including it directly within the credential, or by referencing
     the necessary information.*/
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

    it.skip('credential definition MUST be defined in credentialSchema', async function() {
    /*If a credential definition is being used, the credential
    definition MUST be defined in the credentialSchema property,
    so that it can be used by all parties to perform various cryptographic
    operations in zero-knowledge.*/
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
