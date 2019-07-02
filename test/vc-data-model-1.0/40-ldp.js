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

describe('Linked Data Proofs (optional)', function() {

  describe('`proof` property', function() {

    before(function() {
      const notSupported = generatorOptions.sectionsNotSupported || [];
      if(notSupported.includes('ldp')) {
        this.skip();
      }
    });

    it('MUST be present', async function() {
      const doc = await util.generate('example-5.jsonld', generatorOptions);
      expect(Array.isArray(doc.proof) || typeof doc.proof === 'object');
    });

    it('MUST include specific method using the type property', async function() {
      const doc = await util.generate('example-5.jsonld', generatorOptions);

      if (Array.isArray(doc.proof)) {
        doc.proof[0].should.have.property('type');
        doc.proof[0].type.should.be.a('string');
      } else {
        // only one proof
        doc.proof.should.have.property('type');
        doc.proof.type.should.be.a('string');
      }
    });

    it('MUST include type property (negative - missing proof type)', async function() {
      await expect(util.generate(
        'example-5-bad-proof-missing-type.jsonld', generatorOptions))
        .to.be.rejectedWith(Error);
    });
  });
});
