# W3C Verifiable Claims Working Group Test Suite

This repository contains the W3C
[Verifiable Claims Working Group](https://www.w3.org/2017/vc/WG/) test suite.
Any conforming implementation MUST pass all tests in the test suite.

There are multiple test suites, each of which is detailed below.

## Verifiable Claims Data Model 1.0 Test Suite

This test suite will check any application that generates [Verifiable Credential
Data Model](https://www.w3.org/TR/verifiable-claims-data-model/) documents to
ensure conformance with the specification.

### Running the Test Suite

1. `npm install`
2. `cp config.json.example config.json`
3. Modify `config.json` for your run.
4. `npm test`

#### JWT Test Configuration

The following are the command line parameters that JWT generators have to expect (in addition to the filename/path):

| Cmd Line Parameter             | Description  
| ------------------------------ | -----------
| `--jwt <base64-encoded-keys>`  | Generators can choose between RS256 and ES256K private keys to generate JWS for verifiable credentials and presentations. <base6e-encoded-keys> contains a base64encoded JSON object containing es256kPrivateKeyJwk and rs256PrivateKeyJwk.
| `--jwt-aud <aud>`              | Generators have to use &lt;aud&gt; as the aud attribute in all JWTs
| `--jwt-no-jws`                 | Generators have to suppress the JWS although keys are present
| `--jwt-presentation`           | Generators have to generate a verifiable presentation
| `--jwt-decode`                 | Generators have to generate a credential from a JWT verifiable credential. The input file will be a JWT instead of a JSON-LD file.

JWT tests belong to any of the following three categories:
1. generate (encode) a JWT W3C verifiable credential from a JSON-LD W3C credential (.jsonld file). The 
following parameters are used:

| Cmd Line Parameter             | Optional |
| ------------------------------ | ---------
| `--jwt <base64-encoded-keys>`  | no
| `--jwt-aud <aud>`              | no
| `--jwt-no-jws`                 | yes

2. generate (encode) a JWT W3C verifiable presentation from a JSON-LD W3C credential (.jsonld file).
The generator will have to create a JWT verifiable credential first and then put the verifiable credential into 
the JWT verifiable presentation (as shown in [Example 31](https://w3c.github.io/vc-data-model/#example-31-verifiable-presentation-using-jwt-compact-serialization-non-normative)).
The following command line parameter are used:

| Cmd Line Parameter             | Optional |  
| ------------------------------ | ---------
| `--jwt <base64-encoded-keys>`  | no
| `--jwt-aud <aud>`              | no
| `--jwt-presentation`           | yes

3. generate (decode) a JSON-LD W3C credential from a JWT W3C verifiable credential (.jwt).

| Cmd Line Parameter             | Optional |
| ------------------------------ | ---------
| `--jwt-decode`                 | no

**NOTE**: the command line parameters will be provided by the JWT tests based on the configuration in `config.json`. 
See `config.json.example` for all possible JWT specific config parameters, and see `config.json.jwt.example` for an example 
JWT configuration.                

### Submit an Implementation Report

1. `npm install`
2. `cp config.json.example config.json`
3. Modify `config.json` for your run.
4. `npm run report`
5. `mv implementations/report.json implementations/{YOUR_IMPLEMENTATION}-report.json`
6. `git add implementations/{YOUR_IMPLEMENTATION}-results.json` 
7. Submit a pull request for your implementation.
8. `cd implementations/ && node generate.js`

## Contributing

You may contribute to this test suite by submitting pull requests here:

https://github.com/w3c/vc-test-suite/

## Other Verifiable Claims github repos
* [Data Model](https://github.com/w3c/vc-data-model)
* [Implementation Guideline](https://github.com/w3c/vc-imp-guide)
* [Use Cases](https://github.com/w3c/vc-use-cases)
