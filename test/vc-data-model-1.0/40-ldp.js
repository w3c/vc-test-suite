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

  describe('Linked Data Signature', function() {

    before(function() {
      const notSupported = generatorOptions.sectionsNotSupported || [];
      if(notSupported.includes('ldp')) {
        this.skip();
      }
    });

    it.skip('MUST verify', async function() {
    });

    it.skip('MUST verify (negative)', async function() {
    });

    it.skip('key MUST NOT be suspended, revoked, or expired', async function() {
    });

    it.skip('key MUST NOT be suspended, revoked, or expired (negative)', async function() {
    });

    it.skip('proofPurpose MUST exist and be "credentialIssuance"', async function() {
    });
  });
});
