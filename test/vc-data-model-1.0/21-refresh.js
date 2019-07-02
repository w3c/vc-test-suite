/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// configure chai
chai.use(require('chai-as-promised'));

const uriRegex = /\w+:(\/?\/?)[^\s]+/;

const generatorOptions = config;

describe('Refresh Service (optional)', function() {

  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('refresh')) {
      this.skip();
    }
  });

  it('`refreshService` MUST provide one or more refresh services', async function() {
    // test that `refreshService` is either an array or an object
    const doc = await util.generate('example-011.jsonld', generatorOptions);
    const isArray = Array.isArray(doc.refreshService) &&
      doc.refreshService.length > 0;
    const isObject = doc.refreshService && typeof doc.refreshService.id === 'string';
    expect(isArray || isObject).to.be.true;
  });

  describe('each object within `refreshService`...', function() {
    // if there are multiple objects, loop these tests
    it('MUST specify a `type` property with a valid value', async function() {
      // test for `type` property existence
      const doc = await util.generate('example-011.jsonld', generatorOptions);
      const services = [].concat(doc.refreshService);

      for(let service of services) {
        expect(service.type).to.be.a('string');
      }
    });

    it('MUST specify an `id` property', async function() {
      // test for `serviceEndpoint` property existence
      const doc = await util.generate('example-011.jsonld', generatorOptions);
      const services = [].concat(doc.refreshService);

      for(let service of services) {
        expect(service.id).to.be.a('string');
      }
    });

    it('value of `id` MUST be a URL identifying a service endpoint', async function() {
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
