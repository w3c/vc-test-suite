/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

// https://w3c.github.io/vc-data-model/#terms-of-use
describe('Terms of Use (optional)', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  it.skip('MUST support prohibiting Archival', async () => {
  });

  it.skip('MUST support prohibiting non-subject Presentation', async () => {
  });

  it.skip('MUST support prohibiting 3rd Party Correlation', async () => {
  });

});
