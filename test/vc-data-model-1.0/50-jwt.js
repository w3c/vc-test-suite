/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

describe('JWT', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  describe('FEATURE', () => {

    it.skip('MUST ...', async () => {
    });
  });
});
