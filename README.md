# W3C Verifiable Claims Working Group Test Suite

This repository contains the W3C
[Verifiable Claims Working Group](https://www.w3.org/2017/vc/WG/) test suite.
Any conforming implementation MUST pass all tests in the test suite.

There are multiple test suites, each of which is detailed below.

## Verifiable Claims Data Model 1.0 Test Suite

This test suite will check any application that generates [Verifiable Credential
Data Model](https://www.w3.org/TR/verifiable-claims-data-model/) documents to
ensure conformance with the specification.

The following is a sequence diagram that explains the flow of the test suite:
![image](./assets/test-suite.svg)

### Running the Test Suite

1. `npm install`
2. `cp config.json.example config.json`
3. Modify `config.json` for your run.
4. `npm test`

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
