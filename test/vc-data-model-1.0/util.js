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

// https://gist.github.com/marcelotmelo/b67f58a08bee6c2468f8#file-rfc-3339-regex
const RFC3339regex = /^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$/

module.exports = {
  generate,
  generatePresentation,
  generateJwt,
  generatePresentationJwt,
  hasType,
  RFC3339regex
};
