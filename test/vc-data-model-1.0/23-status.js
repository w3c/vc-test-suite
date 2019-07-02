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

const uriRegex = /\w+:(\/?\/?)[^\s]+/;

const generatorOptions = config;

describe('Credential Status (optional)', function() {

  before(function() {
    const notSupported = generatorOptions.sectionsNotSupported || [];
    if(notSupported.includes('refresh')) {
      this.skip();
    }
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

});
