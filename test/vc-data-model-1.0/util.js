const path = require('path');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

const api = {};
module.exports = api;

api.generate = async (file, options) => {
  options = options || {};
  const {stdout, stderr} =
    await exec(options.generator + ' ' + options.args +
    path.join(__dirname, 'input', file));

  if(file.match(/bad/)) {
    throw new Error('NO_OUTPUT');
  }

  if(stderr) {
    throw new Error(stderr);
  }

  return JSON.parse(stdout);
};
