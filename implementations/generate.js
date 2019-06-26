/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */

/**
 * Generates the Verifiable Credentials Data Model Implementation Report given
 * a set of *-report.json files.
 */
const fs = require('fs');
const path = require('path');

const config = require('../config.json');

// extract the results from all of the test files
const implementations = [];
const dirContents = fs.readdirSync(__dirname);
const files = dirContents.filter(
  (contents) => {return contents.match(/.*-report.json/ig);});

const sections = {
  'Basic Documents': 'basic',
  'Advanced Documents': 'advanced',
  'Terms of Use (optional)': 'tou',
  // 'Linked Data Proofs (optional)': 'ldp',
  'JWT (optional)': 'jwt',
  'Zero-Knowledge Proofs (optional)': 'zkp'
}
const skipSections = ['ldp'];
const noTestsSections = ['tou'];

const sectionNames = Object.keys(sections);
function sectionName(fullTitle) {
  return sectionNames.find(section => fullTitle.startsWith(section))
}

const allResults = new Map();
for(let s of sectionNames) {
  allResults.set(sections[s], new Map());
}

// process each test file
files.forEach((file) => {
  const implementation = file.match(/(.*)-report.json/)[1];
  implementations.push(implementation);

  const rawMochaResults = require(path.join(__dirname, file));

  const skippedTests = rawMochaResults.pending || [];

  console.log('Parsing report for:', implementation);

  // process each test in implementation's suite, noting the result
  rawMochaResults.tests.forEach((test) => {

    let testResult;
    const fullTitle = test.fullTitle;
    const section = sectionName(fullTitle);
    const sectionId = sections[section];

    const sectionResults = allResults.get(sectionId);
    if(!sectionResults) {
      return;
    }

    // Temporary hack, will remove once all reports are re-run
    const noTests = noTestsSections.includes(sectionId);
    const skipTests = fullTitle.includes('Extensibility - Semantic Interoperability') ||
      fullTitle.endsWith('value of `type` MUST be defined in the active context / term dictionary') ||
      fullTitle.endsWith('MUST NOT leak information') ||
      fullTitle.startsWith('Basic Documents `proof` property MUST be present (negative - missing)');
    if(skipTests || skipSections.includes(sectionId)) {
      return;
    }

    const noErrors = !test.err || Object.keys(test.err).length === 0;
    const isSkipped = skippedTests.find(skipped => skipped.fullTitle === fullTitle);

    if(noTests) {
      testResult = 'no tests';
    } else if(isSkipped) {
      testResult = 'no support';
    } else {
      testResult = noErrors ? 'success' : 'failure';
    }

    const shortTitle = fullTitle.split(section + ' ')[1];
    if(!sectionResults.get(shortTitle)) {
      sectionResults.set(shortTitle, new Map());
    }

    sectionResults.get(shortTitle).set(implementation, testResult);
  });
});

let conformanceTable = '';

sectionNames.forEach((name) => {
  const sectionId = sections[name];
  const sectionResults = allResults.get(sectionId);

  conformanceTable += `
<h4>${name}</h4>

<table class="simple">
  <thead>
    <th width="80%">Test</th>
`;
  implementations.forEach((implementation) => {
    conformanceTable += `<th>${implementation}</th>`;
  });
  conformanceTable += `
  </thead>
  <tbody>
`;

  // process each test
  sectionResults.forEach((impResults, test) => {
    conformanceTable += `
    <tr>
      <td>${test}</td>
  `;

    implementations.forEach((implementation) => {
      const status = impResults.get(implementation) || 'untested';
      let statusMark = status;

      if(status === 'success') {
        statusMark = '✓';
      }
      if(status === 'failure') {
        statusMark = '❌';
      }

      conformanceTable += `
      <td class="${status}">${statusMark}</td>
    `;
    });
    conformanceTable += `
    </tr>
  `;
  });

  conformanceTable += `
  </tbody>
</table>
`;
});

// output the implementation report
const template = fs.readFileSync(
  path.join(__dirname, 'template.html'), 'utf-8');

fs.writeFileSync(path.join(__dirname, 'index.html'),
  template.replace('%%%REPORTS%%%', conformanceTable));

console.log("Generated new implementation report.");
