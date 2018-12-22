/*global describe, it*/
const chai = require('chai');
const path = require('path');
const util = require('util');

// setup environment
const {expect} = chai;
const exec = util.promisify(require('child_process').exec);
const uriRegex = /\w+:(\/?\/?)[^\s]+/;

// configure chai
chai.should();
chai.use(require('chai-as-promised'));

// setup command to generate verifiable credential documents
async function generate(file, options) {
  options = options || {};
  const {stdout, stderr} =
    await exec('/bin/cat ' + path.join(__dirname, 'input', file));

  if(file.match(/bad/)) {
    throw new Error('NO_OUTPUT');
  }

  if(stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
}

describe('Verifiable Credentials Document', () => {
  describe('Contexts', () => {

    it('MUST be one or more URIs', async () => {
      const doc = await generate('example-1.jsonld', {});
      doc.should.have.property('@context');
      doc['@context'].should.be.a('Array');
      doc['@context'].should.have.length.greaterThan(1);
    });

    it('MUST be one or more URIs (negative)', async () => {
      expect(generate('example-1-bad-cardinality.jsonld', {}))
        .to.be.rejectedWith(Error);
    });

    it('first value MUST be https://w3.org/2018/credentials/v1', async () => {
      const doc = await generate('example-1.jsonld', {});
      expect(doc['@context'][0]).to.equal('https://w3.org/2018/credentials/v1');
    });

    it('first value MUST be https://w3.org/2018/credentials/v1 (negative)',
      async () => {
        expect(generate('example-1-bad-url.jsonld', {}))
          .to.be.rejectedWith(Error);
      });
  });

  describe('Identifiers', () => {

    it('MUST be a single URI', async () => {
      const doc = await generate('example-2.jsonld', {});
      doc.id.should.be.a('string');
      expect(doc.id).to.match(uriRegex);
      doc.credentialSubject.id.should.be.a('string');
      expect(doc.credentialSubject.id).to.match(uriRegex);
    });

    it('MUST be a single URI (negative)', async () => {
      expect(generate('example-2-bad-cardinality.jsonld', {}))
        .to.be.rejectedWith(Error);
    });
  });

});
