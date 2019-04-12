'use strict';
const path = require('path');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

async function generate(file, options) {
  options = options || {};
  const {stdout, stderr} = await exec(options.generator + ' ' + options.args +
    path.join(__dirname, 'input', file));

  if(file.match(/bad/)) {
    throw new Error('NO_OUTPUT');
  }

  if(stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
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

module.exports = {
  generate,
  hasType
};
