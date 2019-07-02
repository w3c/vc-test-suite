/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

// https://w3c.github.io/vc-data-model/#terms-of-use
describe('Terms of Use (optional)', function() {

  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('tou')) {
      this.skip();
    }
  });

  // `termsOfUse` is optional, so these should only be run if that term is present
  it('`termsOfUse` MUST provide one or more ToU objects', async function() {
    // test that `termsOfUse` is either an array or an object
    const doc = await util.generate('example-012.jsonld', generatorOptions);
    const isArray = Array.isArray(doc.termsOfUse) &&
      doc.termsOfUse.length > 0;
    const isObject = doc.termsOfUse && typeof doc.termsOfUse.id === 'string';
    expect(isArray || isObject).to.be.true;
  });

  describe('each object within `termsOfUse`...', function() {
    // if there are multiple objects, loop these tests
    it('MUST specify a `type` property with a valid value', async function () {
      // test for `type` property existence
      const doc = await util.generate('example-012.jsonld', generatorOptions);
      const tous = [].concat(doc.termsOfUse);

      for (let tou of tous) {
        expect(tou.type).to.be.a('string');
      }
    });
  });

});
