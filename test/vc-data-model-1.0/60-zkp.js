/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;
const iso8601Regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

// https://w3c.github.io/vc-data-model/#zero-knowledge-proofs
describe('Zero-Knowledge Proofs (optional)', () => {

  describe('A verifiable credential...', () => {
    it('MUST contain a credential definition', async () => {
      const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.credentialSchema) &&
        doc.credentialSchema.length > 0;
      const isObject = doc.credentialSchema && typeof doc.credentialSchema.id === 'string';
      expect(isArray || isObject).to.be.true;
    });
    it('MUST contain a credential definition (negative - credentialSchema missing)', async () => {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
    describe('Each credential definition...', () => {
      it('MUST specify a type', async () => {
        const doc = await util.generate('example-015-zkp-credential-schema-array.jsonld',
        generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.type.should.be.a('string');
        }
      });
       it('MUST specify a type (negative - type missing)', async () => {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
      });
      it('MUST specify an `id` property', async () => {
        // test for `id` property existence
        const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
        should.exist(doc.credentialSchema.id);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.id.should.be.a('string');
        }
      });
      it('MUST specify an `id` property (negative - `id` missing)', async () => {
      await expect(util.generate(
        'example-015-zkp-bad-no-credential-schema-id.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
      });

      it('value of `id` MUST be a URI identifying a schema file', async () => {
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
    it('MUST contain a proof', async () => {
      const doc = await util.generate('example-015-zkp.jsonld', generatorOptions);
      expect(Array.isArray(doc.proof) || typeof doc.proof === 'object');
    });

    it('MUST contain a proof (negative - missing)', async () => {
      await expect(util.generate(
        'example-015-zkp-bad-no-proof.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
    describe('Each proof...', () => {
      it('MUST include specific method using the type property', async () => {
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
      it('proof MUST include type property (negative - missing proof type)', async () => {
        await expect(util.generate(
          'example-015-zkp-bad-proof-missing-type.jsonld', generatorOptions))
          .to.be.rejectedWith(Error);
      });
    });

  });
  describe('A verifiable presentation...', () => {
    // TODO: these 3 tests are "fuzzy"; non-data-model tests--the 3 following have specifics
    it.skip('All derived verifiable credentials MUST contain a reference to the credential definition used to generate the derived proof.', async () => {

    });
    it.skip('All derived proofs in verifiable credentials MUST NOT leak information that would enable the verifier to correlate the holder presenting the credential.', async () => {

    });
    it.skip('MUST contain a proof enabling verification that all credentials were issued by the same holder (without PII leakage', async () => {
      /* "The verifiable presentation MUST contain a proof enabling the
       * verifier to ascertain that all verifiable credentials in the
       * verifiable presentation were issued to the same holder without
       * leaking personally identifiable information that the holder did not
       * intend to share." */
    });
    // TODO: these 3 tests MAY be more testable--but may not test the "spirit" of the above requirements...
    it.skip('MUST be a valid `VerifiablePresentation`', async () => {
      // test `type` contains `VerifiablePresentation`
    });
    it.skip('MUST have a `verifiableCredential` member', async () => {
      // test `verifiableCredential` exists (and is valid? or is that an additional test?)
    });
    it.skip('the `verifiableCredential` MUST have a `proof` member', async () => {
      // test that `proof` exists on the embedded credential (and that it's valid?)
    });
    it.skip('MUST have a direct `proof` member (on the presenation)', async() => {
      // test that `proof` exists on the top-leve presentation (and that it's valid?)
    });
  });
});
