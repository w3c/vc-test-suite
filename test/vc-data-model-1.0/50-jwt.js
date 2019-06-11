/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');
const jwt = require('@decentralized-identity/did-auth-jose')

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

const generatorOptions = config;

async function prepareGeneratorOptions() {
    const kid = 'did:example:0xab#verikey-1';
    const aud = 'did:example:0xcd';
    const rsaPrivateKey = await jwt.PrivateKeyRsa.generatePrivateKey(kid);
    const rsaPublicKey = rsaPrivateKey.getPublicKey();
    const ecPrivateKey = await jwt.EcPrivateKey.generatePrivateKey(kid);
    const ecPublicKey = ecPrivateKey.getPublicKey();

    // let people choose which crypto algorithm they want to use
    generatorOptions.jwt = {
      isJwt : true,
      aud : 'did:example:0xcd',
      rsa : {
        kid : 'did:example:0xab#verikey-1',
        privateKey : rsaPrivateKey,
        publicKey : rsaPublicKey
      },
      ecdsaSecp256k1 : {
        kid : 'did:example:0xab#verikey-2',
        privateKey : ecPrivateKey,
        publicKey : ecPublicKey
      }
    }
}

describe('JWT (optional)', () => {

  prepareGeneratorOptions();

  describe('A verifiable credential ...', () => {

    it('vc MUST be present in a JWT verifiable credential.', async () => {
      const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
      const jwtResult = new jwt.JwsToken(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;
      const payload = jwtResult.getPayload();
      expect(payload.vc !== null).to.be.true();
    });

    describe('To encode a verifiable credential as a JWT, specific properties introduced by this' +
             'specification MUST be either 1) encoded as standard JOSE header parameters, ' +
             '2) encoded as registered JWT claim names, or 3) contained in the JWS signature part...', () => {


      it('if typ is present, it MUST be set to JWT.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
        const jwtResult = new jwt.JwsToken(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const typ = jwtResult.getHeader('typ');
        if (typ) {
          expect(typ).to.be.a('string');
          expect(typ).to.equal('JWT');
        }
      });

      it('alg MUST be used for RSA and ECDSA-based digital signatures.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
        const jwtResult = new jwt.JwsToken(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const alg = jwtResult.getHeader('alg')
        expect(alg).to.be.a('string')

        let publicKey;
        if (jwtResult.getHeader('alg') === 'ES256K') {
          expect(alg).to.equal('ES256K');
          publicKey = generatorOptions.jwt.ecPublicKey;
        } else {
          expect(alg).to.equal('RS256');
          publicKey = generatorOptions.jwt.rsaPublicKey;
        }

        const payload = await jwtResult.verifySignature(publicKey);
        expect(payload !== null).to.be.true;
      });

      it('If no JWS is present, a proof property MUST be provided.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
        const jwtResult = new jwt.JwsToken(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;
        if (jwtResult.signature === null) {
          const payload = jwtResult.getPayload();
          expect(payload.proof !== null).to.be.true();
        }
      });

      it('If only the proof attribute is used, the alg header MUST be set to none..', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
        const jwtResult = new jwt.JwsToken(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;
        if (jwtResult.signature === null) {
          const alg = jwtResult.getHeader('alg')
          expect(alg).to.be.a('string')
          expect(alg).to.be.equal('none')
        }
      });

     it('exp MUST represent expirationDate, encoded as a UNIX timestamp (NumericDate).', async () => {
       // FIXME: TODO: load example with expirationDate
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.exp !== null).to.be.true();
       // FIXME: TODO: check if exp matches expirationDate
     });

     it('iss MUST represent the issuer property.', async () => {
       // FIXME: TODO: load example with issuer
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.iss !== null).to.be.true();
       // FIXME: TODO: check if iss matches issuer
     });

     it('iat MUST represent issuanceDate, encoded as a UNIX timestamp (NumericDate).', async () => {
       // FIXME: TODO: load example with issuanceDate
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.iat !== null).to.be.true();
       // FIXME: TODO: check if iat matches issuanceDate
     });

     it('jti MUST represent the id property of the verifiable credential, or verifiable presentation.', async () => {
       // FIXME: TODO: load example with id property
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.jti !== null).to.be.true();
       // FIXME: TODO: check if jti matches id
     });

     it('sub MUST represent the id property contained in the verifiable credential subject.', async () => {
       // FIXME: TODO: load example with id property in credentialSubject
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.sub !== null).to.be.true();
       // FIXME: TODO: check if sub matches id
     });

     it('aud MUST represent the subject of the consumer of the verifiable presentation.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.aud !== null).to.be.true();
       expect(payload.aud).to.equal(generatorOptions.jwt.aud);
     });

     it('Additional claims MUST be added to the credentialSubject property of the JWT.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
       const jwtResult = new jwt.JwsToken(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = jwtResult.getPayload();
       expect(payload.credentialSubject !== null).to.be.true();
       expect(payload.credentialSubject.alumniOf !== null).to.be.true();
       expect(payload.credentialSubject.alumniOf).to.equal('alumniOf');
     });
    });
  });

  describe('A verifiable presentation ...', () => {

    it('vp MUST be present in a JWT verifiable presentation.', async () => {
      const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', generatorOptions);
      const jwtResult = new jwt.JwsToken(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;
      const payload = jwtResult.getPayload();
      expect(payload.vp !== null).to.be.true();
    });
  });

});
