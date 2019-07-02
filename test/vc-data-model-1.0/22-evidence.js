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

// https://w3c.github.io/vc-data-model/#evidence
describe('Evidence (optional)', function() {

  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('evidence')) {
      this.skip();
    }
  });

  // `evidence` is optional, so these should only be run if that term is present
  it('`evidence` MUST provide one or more evidence objects', async function() {
    // test that `evidence` is either an array or an object
    const doc = await util.generate('example-013.jsonld', generatorOptions);
    const isArray = Array.isArray(doc.evidence) &&
      doc.evidence.length > 0;
    const isObject = doc.evidence && typeof doc.evidence.id === 'string';
    expect(isArray || isObject).to.be.true;
  });

  describe('each object within `evidence`...', function() {
    // if there are multiple objects, loop these tests
    it('MUST specify a `type` property with a valid value', async function() {
      // test for `type` property existence
      const doc = await util.generate('example-013.jsonld', generatorOptions);
      const evidence = [].concat(doc.evidence);

      for(let e of evidence) {
        expect([].concat(e.type).length > 0).to.be.true;
      }
    });
  });

});
