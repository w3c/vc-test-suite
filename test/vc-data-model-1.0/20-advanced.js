/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

describe('Advanced Documents', () => {

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
    it('`credentialSchema` MUST provide one or more data schemas', async () => {
      // test that `credentialSchema` is either an array or an object
      const doc = await util.generate('example-009.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.credentialSchema) &&
        doc.credentialSchema.length > 0;
      const isObject = doc.credentialSchema && typeof doc.credentialSchema.id === 'string';
      expect(isArray || isObject).to.be.true;
    });

    describe('each object within `credentialSchema`...', () => {
      // if there are multiple objects, loop these tests
      it('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property existence
        const doc = await util.generate('example-010.jsonld', generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.type.should.be.a('string');
        }
      });

      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });

      it('MUST specify an `id` property', async () => {
        // test for `id` property existence
        const doc = await util.generate('example-010.jsonld', generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.id.should.be.a('string');
        }
      });

      it('value of `id` MUST be a URI identifying a schema file', async () => {
        // test that `id`'s value is a valid URI
        // TODO: https://github.com/w3c/vc-data-model/issues/381
        const doc = await util.generate('example-010.jsonld', generatorOptions);
        const schemas = [].concat(doc.credentialSchema);

        for(let schema of schemas) {
          expect(schema.id).to.match(uriRegex);
        }
      });
    });
  });

  // https://w3c.github.io/vc-data-model/#refreshing
  describe('Refreshing', () => {
    it('`refreshService` MUST provide one or more refresh services', async () => {
      // test that `refreshService` is either an array or an object
      const doc = await util.generate('example-011.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.refreshService) &&
        doc.refreshService.length > 0;
      const isObject = doc.refreshService && typeof doc.refreshService.id === 'string';
      expect(isArray || isObject).to.be.true;
    });

    describe('each object within `refreshService`...', () => {
      // if there are multiple objects, loop these tests
      it('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property existence
        const doc = await util.generate('example-011.jsonld', generatorOptions);
        const services = [].concat(doc.refreshService);

        for(let service of services) {
          expect(service.type).to.be.a('string');
        }
      });

      it.skip('value of `type` MUST be defined in the active context / term dictionary', async () => {
        // test for `type`'s value existence in the active context / term dictionary
      });

      it('MUST specify an `id` property', async () => {
        // test for `serviceEndpoint` property existence
        const doc = await util.generate('example-011.jsonld', generatorOptions);
        const services = [].concat(doc.refreshService);

        for(let service of services) {
          expect(service.id).to.be.a('string');
        }
      });

      it('value of `id` MUST be a URL identifying a service endpoint', async () => {
        // test that the `id`'s value is a valid URL
        // (possibly) attempt to dereference the service endpoint to validate it's "locator-ness" (i.e. URL vs. URI)
        const doc = await util.generate('example-011.jsonld', generatorOptions);
        const services = [].concat(doc.refreshService);

        for(let service of services) {
          expect(service.id).to.match(uriRegex);
        }
      });
    });
  });

  // Mode of Operation is non-normative; so skipping
  // https://w3c.github.io/vc-data-model/#mode-of-operation

  // https://w3c.github.io/vc-data-model/#terms-of-use
  describe('Terms of Use', () => {
    // `termsOfUse` is optional, so these should only be run if that term is present
    it('`termsOfUse` MUST provide one or more ToU objects', async () => {
      // test that `termsOfUse` is either an array or an object
      const doc = await util.generate('example-012.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.termsOfUse) &&
        doc.termsOfUse.length > 0;
      const isObject = doc.termsOfUse && typeof doc.termsOfUse.id === 'string';
      expect(isArray || isObject).to.be.true;
    });

    describe('each object within `termsOfUse`...', () => {
      // if there are multiple objects, loop these tests
      it('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property existence
        const doc = await util.generate('example-012.jsonld', generatorOptions);
        const tous = [].concat(doc.termsOfUse);

        for(let tou of tous) {
          expect(tou.type).to.be.a('string');
        }
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
  describe('Evidence', () => {
    // `evidence` is optional, so these should only be run if that term is present
    it('`evidence` MUST provide one or more evidence objects', async () => {
      // test that `evidence` is either an array or an object
      const doc = await util.generate('example-013.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.evidence) &&
        doc.evidence.length > 0;
      const isObject = doc.evidence && typeof doc.evidence.id === 'string';
      expect(isArray || isObject).to.be.true;
    });

    describe('each object within `evidence`...', () => {
      // if there are multiple objects, loop these tests
      it('MUST specify a `type` property with a valid value', async () => {
        // test for `type` property existence
        const doc = await util.generate('example-013.jsonld', generatorOptions);
        const evidence = [].concat(doc.evidence);

        for(let e of evidence) {
          expect([].concat(e.type).length > 0).to.be.true;
        }
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
  // ...see dedicated ZKP test file.

  // Subject is the Holder is at risk (and vague); so skipping (for now?)
  // https://w3c.github.io/vc-data-model/#subject-is-the-holder

  // Disputes is currently under-defined and (consequently) untestable
  // https://w3c.github.io/vc-data-model/#disputes

  // Authorization contains a "specification use" requirement--which cannot be
  // tested in code; so skipping.
  // https://w3c.github.io/vc-data-model/#authorization

  // Syntactic Sugar is a descriptive (only) section; so skipping.
  // https://w3c.github.io/vc-data-model/#syntactic-sugar
});
