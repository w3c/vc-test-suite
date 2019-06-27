/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const path = require('path');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

async function generate(file, options) {
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

// Z and T can be lowercase
// RFC3999 regex
const RFC3339regex = new RegExp('^(?<fullyear>\\d{4})-(?<month>0[1-9]|1[0-2])-' +
    '(?<mday>0[1-9]|[12][0-9]|3[01])T(?<hour>[01][0-9]|2[0-3]):' +
    '(?<minute>[0-5][0-9]):(?<second>[0-5][0-9]|60)' +
    '(?<secfrac>\\.[0-9]+)?(Z|(\\+|-)(?<offset_hour>[01][0-9]|2[0-3]):' +
    '(?<offset_minute>[0-5][0-9]))$', 'i');

module.exports = {
  generate,
  generatePresentation,
  generateJwt,
  generatePresentationJwt,
  hasType,
  RFC3339regex
};
