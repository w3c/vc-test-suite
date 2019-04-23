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

1. npm install
2. Copy the `config.json.example` file to `config.json` and modify.
3. npm test

### Submit an Implementation Report

1. npm install
2. Copy the `config.json.example` file to `config.json` and modify.
3. npm run report
4. Rename implementation/results.json to
   implementation/YOUR_IMPLEMENTATION-results.json.
5. git add implementations/YOUR_IMPLEMENTATION-results.json and submit a
   pull request for your implementation.

## Contributing

You may contribute to this test suite by submitting pull requests here:

https://github.com/w3c/vc-test-suite/

## Other Verifiable Claims github repos
* [Data Model](https://github.com/w3c/vc-data-model)
* [Implementation Guideline](https://github.com/w3c/vc-imp-guide)
* [Use Cases](https://github.com/w3c/vc-use-cases)
