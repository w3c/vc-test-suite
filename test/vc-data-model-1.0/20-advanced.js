/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');

// setup constants
const uriRegex = /\w+:(\/?\/?)[^\s]+/;
const iso8601Regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

describe('Advanced Documents', () => {
  const generatorOptions = {
    generator: config.generator,
    args: ""
  };

  // https://w3c.github.io/vc-data-model/#semantic-interoperability
  describe('Extensibility - Semantic Interoperability', () => {

    describe('JSON-based processor', () => {
      // TODO: https://github.com/w3c/vc-data-model/issues/371
      it.skip('MUST process the `@context` property; ensure credential `type` value exists', async () => {});
      it.skip('expected `type` values MUST be in expected order', async () => {});
      it.skip('expected order MUST be defined by human-readable extension specification', async () => {});
    });

    describe ('JSON-LD-based processor', () => {
      // TODO: currently, JSON-LD processors would not trigger this error; needs discussion
      it.skip('MUST produce an error when a JSON-LD context redefines any term in the active context.', async () => {});
    });
  });

});
