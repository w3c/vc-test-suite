/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
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
const generatorOptions = options.generatorOptions;

// test case specific options
const OPTIONS = {
    JWT: '--jwt',
    JWT_NO_JWS: '--jwt-no-jws',
    JWT_PRESENTATION: '--jwt-presentation',
    JWT_AUD: '--jwt-aud',
    JWT_DECODE: '--jwt-decode'
}

// jwt specific generator options
const cryptoFactory = new jwt.CryptoFactory([new jwt.Secp256k1CryptoSuite(), new jwt.RsaCryptoSuite()]);
const aud = "did:example:0xcafe";
let rsaPublicKey;
let ecPrivateKey;

async function setGeneratorKeys() {
  if (options.jwt.es256kPrivateKeyJwk !== undefined) {
    var privateKey = {
        id: options.jwt.es256kPrivateKeyJwk.kid,
        type: 'publicKeyJwk',
        publicKeyJwk: options.jwt.es256kPrivateKeyJwk
    };

    ecPrivateKey = new jwt.EcPrivateKey(privateKey);
  }

  if (options.jwt.rs256PrivateKeyJwk !== undefined) {
    var privateKey = {
        id: options.jwt.rs256PrivateKeyJwk.kid,
        type: 'publicKeyJwk',
        publicKeyJwk: options.jwt.rs256PrivateKeyJwk
    };

    rsaPrivateKey = new jwt.PrivateKeyRsa(privateKey);
  }
}

function getGeneratorOptions(additionalOptions = '') {

  const jwt = {
    es256kPrivateKeyJwk: options.jwt.es256kPrivateKeyJwk,
    rs256PrivateKeyJwk: options.jwt.rs256PrivateKeyJwk
  };

  const allOptions = generatorOptions
    + ' ' + OPTIONS.JWT + ' ' + Buffer.from(JSON.stringify(jwt)).toString('base64')
    + ' ' + OPTIONS.JWT_AUD + ' ' + options.jwt.aud
    + ' ' + additionalOptions;

  options.generatorOptions = allOptions;

  return options;
}

describe('JWT (optional)', function() {
  before(function() {
    const notSupported = config.sectionsNotSupported || [];
    if(notSupported.includes('jwt')) {
      return this.skip();
    }

    setGeneratorKeys();
  });

  describe('A verifiable credential ...', function() {

    it('vc MUST be present in a JWT verifiable credential.', async function() {
      const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
      const jwtResult = new jwt.JwsToken(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;
      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
    });

    describe('To encode a verifiable credential as a JWT, specific properties introduced by this' +
             'specification MUST be either 1) encoded as standard JOSE header parameters, ' +
             '2) encoded as registered JWT claim names, or 3) contained in the JWS signature part...', function() {

      it('If no explicit rule is specified, properties are encoded in the same way as with a standard' +
         'verifiable credential, and are added to the vc property of the JWT.', async function() {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const payload = JSON.parse(jwtResult.getPayload());
        expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
        expect(payload.vc.type !== null && payload.vc.type !== undefined).to.be.true;
        expect(payload.vc.type).to.equal('VerifiableCredential');
       });

      it('if typ is present, it MUST be set to JWT.', async function() {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        const { typ } = jwtResult.getHeader();
        if (typ) {
          expect(typ).to.be.a('string');
          expect(typ).to.equal('JWT');
        }
      });

      it('alg MUST be used for RSA and ECDSA-based digital signatures.', async function() {
        const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
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

      it('If no JWS is present, a proof property MUST be provided.', async function() {
        const jwtBase64 = await util.generateJwt('example-016-jwt-with-embedded-proof.jsonld', getGeneratorOptions(OPTIONS.JWT_NO_JWS));
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        expect(jwtResult.signature === null || (typeof jwtResult.signature === 'undefined') || /\S/.test(jwtResult.signature) === false).to.be.true;
        const payload = JSON.parse(jwtResult.getPayload());
        expect(payload.vc !== null && payload.vc !== undefined).to.be.true;
        expect(payload.vc.proof !== null && payload.vc.proof !== undefined).to.be.true;
      });

      it('If only the proof attribute is used, the alg header MUST be set to none.', async function() {
        const jwtBase64 = await util.generateJwt('example-016-jwt-with-embedded-proof.jsonld', getGeneratorOptions(OPTIONS.JWT_NO_JWS));
        const jwtResult = cryptoFactory.constructJws(jwtBase64);
        expect(jwtResult.isContentWellFormedToken()).to.be.true;

        expect(jwtResult.signature === null || (typeof jwtResult.signature === 'undefined') || /\S/.test(jwtResult.signature) === false).to.be.true;
        const { alg } = jwtResult.getHeader('alg')
        expect(alg).to.be.a('string')
      });

     it('exp MUST represent expirationDate, encoded as a UNIX timestamp (NumericDate).', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.exp !== null && payload.exp !== undefined).to.be.true;
       expect(payload.exp).to.equal(new Date('2020-01-01T19:23:24Z').getTime() / 1000);
     });

     it('exp MUST represent expirationDate, encoded as a UNIX timestamp (NumericDate) -- negative, no exp expected.', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt-no-exp.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.exp === null || typeof payload.exp === 'undefined').to.be.true;
     });

     it('iss MUST represent the issuer property.', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.iss !== null && payload.iss !== undefined).to.be.true;
       expect(payload.iss).to.equal('https://example.edu/issuers/14');
     });

     it('nbf MUST represent issuanceDate, encoded as a UNIX timestamp (NumericDate).', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.nbf !== null && payload.nbf !== undefined).to.be.true;
       expect(payload.nbf).to.equal(new Date('2010-01-01T19:23:24Z').getTime() / 1000);
     });

     it('jti MUST represent the id property of the verifiable credential.', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.jti !== null && payload.jti !== undefined).to.be.true;
       expect(payload.jti).to.equal('http://example.edu/credentials/58473');
     });

     it('jti MUST represent the id property of the verifiable credential -- negative, no jti expected', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt-no-jti.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.jti === null || typeof payload.jti === 'undefined').to.be.true;
     });

     it('sub MUST represent the id property contained in the verifiable credential subject.', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
       const jwtResult = cryptoFactory.constructJws(jwtBase64);
       expect(jwtResult.isContentWellFormedToken()).to.be.true;

       const payload = JSON.parse(jwtResult.getPayload());
       expect(payload.sub !== null && payload.sub !== undefined).to.be.true;
       expect(payload.sub).to.equal('did:example:ebfeb1f712ebc6f1c276e12ec21');
     });

//     it('sub MUST represent the id property contained in the verifiable credential subject -- negative, no sub expected.', async function() {
//       const jwtBase64 = await util.generateJwt('example-016-jwt-no-sub.jsonld', generatorOptions);
//       const jwtResult = new jwt.JwsToken(jwtBase64);
//       expect(jwtResult.isContentWellFormedToken()).to.be.true;
//
//       const payload = jwtResult.getPayload();
//       expect(payload.sub === null).to.be.true;
//     });

     it('Additional claims MUST be added to the credentialSubject property of the JWT.', async function() {
       const jwtBase64 = await util.generateJwt('example-016-jwt.jsonld', getGeneratorOptions());
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

  describe('To decode a JWT to a standard verifiable credential, the following transformation MUST be performed...', function() {

    it('Add the content from the vc property to the new JSON object.', async function() {
      const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
      expect(doc['@context'] !== null && doc['@context'] !== undefined).to.be.true;
      expect(doc.type !== null && doc.type !== undefined).to.be.true;
      expect(doc.credentialSubject !== null && doc.credentialSubject !== undefined).to.be.true;
    });

    describe('To transform the JWT specific headers and claims, the following MUST be done:', function() {
      it('If exp is present, the UNIX timestamp MUST be converted to an [RFC3339] date-time, '
       + 'and MUST be used to set the value of the expirationDate property of credentialSubject of the new JSON object.', async function() {
        const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
        expect(doc.expirationDate !== null && doc.expirationDate !== undefined).to.be.true;
        expect(Date.parse(doc.expirationDate)).to.be.equal(1573029723*1000);
      });

      it('If iss is present, the value MUST be used to set the issuer property of the new JSON object.', async function() {
        const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
        expect(doc['@context'] !== null && doc['@context'] !== undefined).to.be.true;
        expect(doc.issuer !== null && doc.issuer !== undefined).to.be.true;
        expect(doc.issuer).to.be.equal('did:example:abfe13f712120431c276e12ecab');
      });

      it('If nbf is present, the UNIX timestamp MUST be converted to an [RFC3339] date-time, and MUST be used to set the value of the issuanceDate property of the new JSON object.', async function() {
        const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
        expect(doc.issuanceDate !== null && doc.issuanceDate !== undefined).to.be.true;
        expect(Date.parse(doc.issuanceDate)).to.be.equal(1541493724*1000);
      });

      it('If sub is present, the value MUST be used to set the value of the id property of credentialSubject of the new JSON object.', async function() {
        const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
        expect(doc.credentialSubject.id !== null && doc.credentialSubject.id !== undefined).to.be.true;
        expect(doc.credentialSubject.id).to.be.equal('did:example:ebfeb1f712ebc6f1c276e12ec21');
      });

      it('If jti is present, the value MUST be used to set the value of the id property of the new JSON object.', async function() {
        const doc = await util.generate('example-016-jwt.jwt', getGeneratorOptions(OPTIONS.JWT_DECODE));
        expect(doc.id !== null && doc.id !== undefined).to.be.true;
        expect(doc.id).to.be.equal('http://example.edu/credentials/3732');
      });
    });
  });

  describe('A verifiable presentation ...', function() {    

    it('vp MUST be present in a JWT verifiable presentation', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.vp !== null && payload.vp !== undefined).to.be.true;
      expect(payload.vp.type !== null && payload.vp !== undefined).to.be.true;
      expect(payload.vp.verifiableCredential !== null && payload.vp !== undefined).to.be.true;
    });    

    it('aud MUST represent the subject of the consumer of the verifiable presentation', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.aud !== null && payload.aud !== undefined).to.be.true;
      expect(payload.aud).to.equal(aud);
    });

    it('jti MUST represent the id property of [...] the verifiable presentation', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.jti !== null && payload.jti !== undefined).to.be.true;
      expect(payload.jti).to.equal('urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5');
    });

    it('jti MUST represent the id property of [...] the verifiable presentation -- negative, no jti expected', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation-no-jti.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.jti === null || typeof payload.jti === 'undefined').to.be.true;
    });
        
    it('iss MUST represent [...] the holder property of a verifiable presentation', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.iss !== null && payload.iss !== undefined).to.be.true;
      expect(payload.iss).to.equal('did:example:ebfeb1f712ebc6f1c276e12ec21');
    });

    it('iss MUST represent [...] the holder property of a verifiable presentation. -- negative, no jti expected', async function() {
      const jwtBase64 = await util.generatePresentationJwt('example-016-jwt-presentation-no-iss.jsonld', getGeneratorOptions(OPTIONS.JWT_PRESENTATION));
      const jwtResult = cryptoFactory.constructJws(jwtBase64);
      expect(jwtResult.isContentWellFormedToken()).to.be.true;

      const payload = JSON.parse(jwtResult.getPayload());
      expect(payload.iss === null || typeof payload.iss === 'undefined').to.be.true;
    });
  });
});
