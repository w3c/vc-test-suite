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

describe('Advanced Documents', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  // https://w3c.github.io/vc-data-model/#semantic-interoperability
  describe('Extensibility - Semantic Interoperability', () => {

    describe('JSON-based processor', () => {
      // TODO: https://github.com/w3c/vc-data-model/issues/371
      it.skip('MUST process the `@context` property; ensure credential `type` value exists', async () => {});
      it.skip('expected `type` values MUST be in expected order', async () => {});
      it.skip('expected order MUST be defined by human-readable extension specification', async () => {});
    });

    describe ('JSON-LD-based processor', () => {
      // TODO: currently, JSON-LD processors would not trigger this error; needs discussion
      it.skip('MUST produce an error when a JSON-LD context redefines any term in the active context.', async () => {});
    });
  });

  // https://w3c.github.io/vc-data-model/#data-schemas
  describe('Data Schemas', () => {
    it.skip('`credentialSchema` MUST provide one or more data schemas', async () => {
      // test that `credentialSchema` is either an array or an object
    });
    describe('each object within `credentialSchema`...', () => {
      // if there are multiple objects, loop these tests
      it.skip('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property exitence
      });
      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });
      it.skip('MUST specify an `id` property', async () => {
        // test for `id` property existence
      });
      it.skip('value of `id` MUST be a URI identifying a schema file', async () => {
        // test that `id`'s value is a valid URI
        // TODO: https://github.com/w3c/vc-data-model/issues/381
      });
    });
  });

  // https://w3c.github.io/vc-data-model/#refreshing
  describe('Refreshing', () => {
    it.skip('`refreshService` MUST provide one or more refresh services', async () => {
      // test that `refreshService` is either an array or an object
    });
    describe('each object within `refreshService`...', () => {
      // if there are multiple objects, loop these tests
      it.skip('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property exitence
      });
      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });
      // TODO: consider changing `serviceEndpoint` to `id`: https://github.com/w3c/vc-data-model/issues/380
      it.skip('MUST specify an `serviceEndpoint` property', async () => {
        // test for `serviceEndpoint` property existence
      });
      it.skip('value of `serviceEndpoint` MUST be a URL identifying a service endpoint', async () => {
        // test that `serviceEndpoint`'s value is a valid URL
        // TODO: https://github.com/w3c/vc-data-model/issues/381
        // (possibly) attempt to dereference the service endpoint to validate it's "locator-ness" (i.e. URL vs. URI)
      });
    });
  });

  // Mode of Operation is non-normative; so skipping
  // https://w3c.github.io/vc-data-model/#mode-of-operation

  // https://w3c.github.io/vc-data-model/#terms-of-use
  describe('Terms of Use', () => {
    // `termsOfUse` is optional, so these should only be run if that term is present
    it.skip('`termsOfUse` MUST provide one or more refresh services', async () => {
      // test that `termsOfUse` is either an array or an object
    });
    describe('each object within `termsOfUse`...', () => {
      // if there are multiple objects, loop these tests
      it.skip('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property exitence
      });
      // TODO: this requirement is not expressed inline here, but inherits from
      // the general definition mechanism of `type` throughout the document
      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });
      // TODO: contents of a `termsOfUse` member is untestable because it is undefined
    });
  });

  // https://w3c.github.io/vc-data-model/#evidence
  describe('Evindence', () => {
    // `evidence` is optional, so these should only be run if that term is present
    it.skip('`evidence` MUST provide one or more refresh services', async () => {
      // test that `evidence` is either an array or an object
    });
    describe('each object within `evidence`...', () => {
      // if there are multiple objects, loop these tests
      it.skip('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property exitence
      });
      // TODO: this requirement is not expressed inline here, but inherits from
      // the general definition mechanism of `type` throughout the document
      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });
      // TODO: contents of a `evidence` are yet to be defined: https://w3c.github.io/vc-data-model/#h-issue-6
    });
  });

  // https://w3c.github.io/vc-data-model/#zero-knowledge-proofs
  describe('Zero Knowledge Proofs', () => {
    describe('A verifiable credential...', () => {
      it.skip('MUST contain a credential definition', async () => {
        // test for one or more valid `credentialSchema`
      });
      it.skip('MUST contain a proof', async () => {
        // test for one or more valid `proof`
      });
    });
    describe('A verifiable presenation...', () => {
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
});
