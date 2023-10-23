/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const path = require('path');
const util = require('util');
const fs = require('fs');
const axios = require('axios');

const exec = util.promisify(require('child_process').exec);

async function generate(file, options) {
  if (options.restapi) {
    return await generateFromRestapi(file, options.restapi);
  } else {
    return await generateFromBinary(file, options);
  }
}

async function generateFromRestapi(file, options) {
  const url = `${options.baseUrl}${options.generator}`;
  const fileContent = fs.readFileSync(path.join(__dirname, 'input', file), 'utf8');
  const dataToIssue = createIssuanceData(fileContent, options.generatorOptions);
  const axiosOptions = {
    timeout: 2000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${options.oauthTokenType} ${options.oauthToken}`
    }
  }
  try {
    const response = await axios.post(url, dataToIssue, axiosOptions);
    return response.data?.verifiableCredential ? response.data.verifiableCredential : {};
  } catch (error) {
    throw new Error('Failed to get valid response');
  }
}

async function generateFromBinary(file, options) {
  options = options || {};
  const {stdout, stderr} = await exec(options.generator + ' ' +
    options.generatorOptions + ' ' + path.join(__dirname, 'input', file));

  if(stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
}

async function generateJwt(file, options) {
  options = options || {};

  const {stdout, stderr} = await exec(options.generator + ' ' +
    options.generatorOptions + ' ' + path.join(__dirname, 'input', file));

  if(stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

async function generatePresentation(file, options) {
  if (options.restapi) {
    return await generatePresentationFromRestapi(file, options.restapi);
  } else {
    return await generatePresentationFromBinary(file, options);
  }
}

async function generatePresentationFromRestapi(file, options) {
  const fileContent = fs.readFileSync(path.join(__dirname, 'input', file), 'utf8');
  const dataToIssue = createPresentationData(fileContent, options.generatorOptions);
  const url = `${options.baseUrl}${options.presentationGenerator}`;
  const axiosOptions = {
    timeout: 2000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${options.oauthTokenType} ${options.oauthToken}`
    }
  }
  try {
    const response = await axios.post(url, dataToIssue, axiosOptions);
    return response.data?.verifiablePresentation ? response.data.verifiablePresentation : {};
  } catch (error) {
    throw new Error('Failed to get valid response');
  }
}

async function generatePresentationFromBinary(file, options) {
  options = options || {};
  const {stdout, stderr} = await exec(options.presentationGenerator + ' ' +
    options.generatorOptions + ' ' + path.join(__dirname, 'input', file));

  if(stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
}

async function generatePresentationJwt(file, options) {
  options = options || {};
  const {stdout, stderr} = await exec(options.presentationGenerator + ' ' +
    options.generatorOptions + ' ' + path.join(__dirname, 'input', file));

  if(stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

function hasType(doc, expectedType) {
  if(!doc) {
    return false;
  }

  let type = doc.type;
  if(!Array.isArray(type)) {
    type = [type];
  }

  return type.some(el => el === expectedType);
}

// RFC3999 regex
// Z and T can be lowercase
const RFC3339regex = new RegExp('^(\\d{4})-(0[1-9]|1[0-2])-' +
  '(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):' +
  '([0-5][0-9]):([0-5][0-9]|60)' +
  '(\\.[0-9]+)?(Z|(\\+|-)([01][0-9]|2[0-3]):' +
  '([0-5][0-9]))$', 'i');

/**
 * Transform a test input JSON-LD file to a payload for a REST credentials/issue
 * @param {String} unsigned_jsonld A string of an unsigned credential JSON-LD
 * @param {Object} options The arguments that should be passed to the VC generator
 * @returns {String} A JSON-LD string to be used against REST APIs
 */
function createIssuanceData(unsigned_jsonld, options) {
  return JSON.stringify({ credential: JSON.parse(unsigned_jsonld), options });
}

/**
 * Transform a test input JSON-LD file to a payload for a REST presentation/prove
 * @param {String} unsigned_jsonld A string of an unsigned presentation JSON-LD
 * @param {String} options The arguments that should be passed to the VP generator
 * @returns {String} A JSON-LD string to be used against REST APIs
 */
function createPresentationData(unsigned_jsonld, options) {
  return JSON.stringify({ presentation: JSON.parse(unsigned_jsonld), options });
}

module.exports = {
  generate,
  generatePresentation,
  generateJwt,
  generatePresentationJwt,
  hasType,
  RFC3339regex
};
