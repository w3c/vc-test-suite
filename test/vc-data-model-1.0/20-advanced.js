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

describe('Advanced Documents', function() {

  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('advanced')) {
      this.skip();
    }
  });

  // https://w3c.github.io/vc-data-model/#data-schemas
  describe('Data Schemas', function() {
    it('`credentialSchema` MUST provide one or more data schemas', async function() {
      // test that `credentialSchema` is either an array or an object
      const doc = await util.generate('example-009.jsonld', generatorOptions);
      const isArray = Array.isArray(doc.credentialSchema) &&
        doc.credentialSchema.length > 0;
      const isObject = doc.credentialSchema && typeof doc.credentialSchema.id === 'string';
      expect(isArray || isObject).to.be.true;
    });

    describe('each object within `credentialSchema`...', function() {
      // if there are multiple objects, loop these tests
      it('MUST specify a `type` property with a valid value', async function() {
        // test for `type` property existence
        const doc = await util.generate('example-010.jsonld', generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.type.should.be.a('string');
        }
      });

      it('MUST specify an `id` property', async function() {
        // test for `id` property existence
        const doc = await util.generate('example-010.jsonld', generatorOptions);
        should.exist(doc.credentialSchema);
        let schemas = [].concat(doc.credentialSchema);
        expect(schemas.length > 0).to.be.true;

        for(let schema of schemas) {
          schema.id.should.be.a('string');
        }
      });

      it('value of `id` MUST be a URI identifying a schema file', async function() {
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

});
