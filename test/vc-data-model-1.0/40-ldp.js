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

describe('Linked Data Proofs (optional)', () => {

  // JSON Web Tokens (JWTs) https://w3c.github.io/vc-data-model/#json-web-token
  describe('Linked Data Signature', () => {

    it.skip('MUST verify', async () => {
    });

    it.skip('MUST verify (negative)', async () => {
    });

    it.skip('key MUST NOT be suspended, revoked, or expired', async () => {
    });

    it.skip('key MUST NOT be suspended, revoked, or expired (negative)', async () => {
    });

    it.skip('proofPurpose MUST exist and be "credentialIssuance"', async () => {
    });
  });
});
