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
    return await generate_from_restapi(file, options.restapi);
  } else {
    return await generate_from_binary(file, options);
  }
}

async function generate_from_restapi(file, options) {
  const url = `${options.base_url}${options.generator}`;
  const file_content = fs.readFileSync(path.join(__dirname, 'input', file), 'utf8');
  const data_to_issue = create_issuance_data(file_content, options.generatorOptions);
  const axios_options = {
    timeout: 2000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${options.oauth_token_type} ${options.oauth_token}`
    }
  }
  try {
    const response = await axios.post(url, data_to_issue, axios_options);
    return response.data?.verifiableCredential ? response.data.verifiableCredential : {};
  } catch (error) {
    throw error;
  }
}

async function generate_from_binary(file, options) {
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
    return await generatePresentation_from_restapi(file, options.restapi);
  } else {
    return await generatePresentation_from_binary(file, options);
  }
}

async function generatePresentation_from_restapi(file, options) {
  const file_content = fs.readFileSync(path.join(__dirname, 'input', file), 'utf8');
  const url = `${options.base_url}${options.presentationGenerator}`;
  const axios_options = {
    timeout: 2000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${options.oauth_token_type} ${options.oauth_token}`
    }
  }
  try {
    const response = await axios.post(url, file_content, axios_options);
    return response.data?.verifiableCredential ? response.data.verifiableCredential : {};
  } catch (error) {
    throw error;
  }
}

async function generatePresentation_from_binary(file, options) {
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
 *
 * @param {String} unsigned_jsonld A string of an unsigend jsonld
 * @returns {String} A jsonld to be used against REST APIs
 */
function create_issuance_data(unsigned_jsonld, options) {
  return JSON.stringify({ credential: JSON.parse(unsigned_jsonld), options: options });
}

module.exports = {
  generate,
  generatePresentation,
  generateJwt,
  generatePresentationJwt,
  hasType,
  RFC3339regex
};
