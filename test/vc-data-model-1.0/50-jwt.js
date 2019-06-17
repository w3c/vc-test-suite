/*global describe, it*/
const config = require('../../config.json');
const chai = require('chai');
const {expect} = chai;
const util = require('./util');
const jwt = require('@decentralized-identity/did-auth-jose')

// configure chai
const should = chai.should();
chai.use(require('chai-as-promised'));

// parse jwt generator options
const options = config;

// jwt specific generator options
const cryptoFactory = new jwt.CryptoFactory([new jwt.Secp256k1CryptoSuite(), new jwt.RsaCryptoSuite()]);
const aud = "did:example:0xcafe";
let rsaPublicKey;
let ecPrivateKey;

async function prepareGeneratorOptions() {
  // indicate this is a jwt test case
  options.generatorOptions += ' --jwt'

  // generate keys and append to jwt options  
  const kid = 'did:example:0xab#verikey-1'
  ecPrivateKey = await jwt.EcPrivateKey.generatePrivateKey(kid)
  //rsaPrivateKey = await jwt.RsaPrivateKey.generatePrivateKey(kid)

  // remember the public key for use in tests
  ecPublicKey = ecPrivateKey.getPublicKey()
  //rsaPublicKey = rsaPublicKey.getPublicKey();

  const ecPrivateKey64 = Buffer.from(JSON.stringify(ecPrivateKey)).toString('base64');
  options.generatorOptions += ` --jwt-jwk-ES256K ${ecPrivateKey64}`

  //const rsaPrivateKey64 = base64url.encode(JSON.stringify(rsaPrivateKey));
  //options.generatorOptions += ` -jwt-jwk-RS256 ${rsaPrivateKey64}`

  options.generatorOptions += ` --jwt-aud ${aud}`
}

describe.only('JWT (optional)', () => {
  prepareGeneratorOptions();

  describe('A verifiable credential ...', () => {

    it('vc MUST be present in a JWT verifiable credential.', async () => {
      const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
      const jwtResult = new jwt.JwsToken(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;
      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
    });

    describe('To encode a verifiable credential as a JWT, specific properties introduced by this' +
             'specification MUST be either 1) encoded as standard JOSE header parameters, ' +
             '2) encoded as registered JWT claim names, or 3) contained in the JWS signature part...', () => {
              
      it('If no explicit rule is specified, properties are encoded in the same way as with a standard' + 
         'verifiable credential, and are added to the vc property of the JWT.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const payload = JSON.parse(jwtResult.getPayload());
        expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
        expect(payload.vc.type !== null && payload.vc.type !== undefined).to.be.true;
        expect(payload.vc.type).to.equal('VerifiableCredential');
       });
        
      it('if typ is present, it MUST be set to JWT.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const { typ } = jwtResult.getHeader();
        if (typ) {
          expect(typ).to.be.a('string');
          expect(typ).to.equal('JWT');
        }
      });

      it('alg MUST be used for RSA and ECDSA-based digital signatures.', async () => {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const { alg } = jwtResult.getHeader();
        expect(alg).to.be.a('string');
        expect(alg).to.be.oneOf(['RS256', 'ES256K']);
        expect(jwtResult.signature !== null && jwtResult.signature !== undefined).to.be.true;

        // FIXME: TODO: verify signature
        // let payload;
        // if (alg === 'RS256') {
        //   payload = await jwtResult.verifySignature(ecPublicKey);
        // } else {
        //   payload = await jwtResult.verifySignature(rsaPublicKey);  
        // }
        // expect(payload !== null).to.be.true;
      });

      it('If no JWS is present, a proof property MUST be provided.', async () => {
        // FIXME: TODO: how to trigger this test case?
//        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
//        const jwtResult = cryptoFactory.constructJws(jwtBase64);
//        expect(jwtResult.isContentWellFormedToken()).to.be.true;
//
//        expect(jwtResult.signature === null || jwtResult.signature === undefined).to.be.true;
//        const payload = JSON.parse(jwtResult.getPayload());
//        expect(payload.proof !== null && payload.proof !== undefined).to.be.true;
      });

      it('If only the proof attribute is used, the alg header MUST be set to none..', async () => {
        // FIXME: TODO: how to trigger this test case?
//        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
//        const jwtResult = cryptoFactory.constructJws(jwtBase64);
//        expect(jwtResult.isContentWellFormedToken()).to.be.true;
//
//        expect(jwtResult.signature === null || jwtResult.signature === undefined).to.be.true;
//        const payload = JSON.parse(jwtResult.getPayload());
//        expect(payload.proof !== null && payload.proof !== undefined).to.be.true;
//        const { alg } = jwtResult.getHeader('alg')
//        expect(alg).to.be.a('string')
      });

     it('exp MUST represent expirationDate, encoded as a UNIX timestamp (NumericDate).', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.exp !== null && payload.exp !== undefined).to.be.true;
       expect(payload.exp).to.equal(new Date('2020-01-01T19:23:24Z').getTime() / 1000);
     });

     it('exp MUST represent expirationDate, encoded as a UNIX timestamp (NumericDate) -- negative, no exp expected.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt-no-exp.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.exp === null || payload.exp === undefined).to.be.true;
     });

     it('iss MUST represent the issuer property.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.iss !== null && payload.iss !== undefined).to.be.true;
       expect(payload.iss).to.equal('https://example.edu/issuers/14');
     });

     it('iat MUST represent issuanceDate, encoded as a UNIX timestamp (NumericDate).', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.iat !== null && payload.iat !== undefined).to.be.true;
       expect(payload.exp).to.equal(new Date('2010-01-01T19:23:24Z').getTime() / 1000);
     });

     it('jti MUST represent the id property of the verifiable credential, or verifiable presentation.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.jti !== null && payload.jti !== undefined).to.be.true;
       expect(payload.jti).to.equal('http://example.edu/credentials/58473');
     });

     it('jti MUST represent the id property of the verifiable credential, or verifiable presentation -- negative, no jti expected', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt-no-jti.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.jti === null || payload.jti === undefined).to.be.true;
     });

     it('sub MUST represent the id property contained in the verifiable credential subject.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.sub !== null && payload.sub !== undefined).to.be.true;
       expect(payload.sub).to.equal('did:example:ebfeb1f712ebc6f1c276e12ec21');
     });

//     it('sub MUST represent the id property contained in the verifiable credential subject -- negative, no sub expected.', async () => {
//       const jwtBase64 = await util.generateJwt('example-016-jwt-no-sub.jsonld', generatorOptions);
//       const jwtResult = new jwt.JwsToken(jwtBase64);
//       expect(jwtResult.isContentWellFormedToken()).to.be.true;
//
//       const payload = jwtResult.getPayload();
//       expect(payload.sub === null).to.be.true;
//     });

     it('aud MUST represent the subject of the consumer of the verifiable presentation.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.aud !== null && payload.aud !== undefined).to.be.true;
       expect(payload.aud).to.equal(aud);
     });

     it('Additional claims MUST be added to the credentialSubject property of the JWT.', async () => {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', options);
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
       expect(payload.vc.credentialSubject !== null && payload.vc.credentialSubject !== undefined).to.be.true;
       expect(payload.vc.credentialSubject.alumniOf !== null && payload.vc.credentialSubject.alumniOf !== undefined).to.be.true;
       expect(payload.vc.credentialSubject.alumniOf).to.equal('Example University');
     });
    });
  });

  describe('A verifiable presentation ...', () => {

    it('vp MUST be present in a JWT verifiable presentation.', async () => {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt.jsonld', options);
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.vp !== null && payload.vp !== undefined).to.be.true;
    });
  });

});
