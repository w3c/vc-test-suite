/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

describe('JWT (optional)', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  // JSON Web Tokens (JWTs) https://w3c.github.io/vc-data-model/#json-web-token
  describe('JSON Web Token (storing Verifiable Credentials/Presentations)', () => {
    // https://w3c.github.io/vc-data-model/#iana-considerations
    // TODO: need a way to state what's being tested--a credential or a presentation
    it.skip('`vc` MUST be present in a JWT verifiable credential', async () => {
      // test if `vc` key exists
    });
    it.skip('`vp` MUST be present in a JWT verifiable presentation', async () => {
      // test if `vp` key exists
    });

    // https://w3c.github.io/vc-data-model/#jwt-and-jws-considerations
    it.skip('MUST be encoded as standard JOSE header parameters, JWT registered claim names, or contained in the JWS signature part', async () => {
      // test for either of these 3 scenarios
      // TODO: consider using `before` and/or `beforeEach` to test sub-conditions
    });
  });
});
