/**
 * Generates the Verifiable Credentials Data Model Implementation Report given
 * a set of *-report.json files.
 */
const fs = require('fs');
const path = require('path');

// extract the results from all of the test files
const allTests = [];
const allResults = {};
const dirContents = fs.readdirSync(__dirname);
const files = dirContents.filter(
  (contents) => {return contents.match(/.*-report.json/ig);});

// process each test file
files.forEach((file) => {
  const implementation = file.match(/(.*)-report.json/)[1];
  const results = JSON.parse(fs.readFileSync(
    path.join(__dirname, file)), 'utf-8');
  allResults[implementation] = {};

  // process each test, noting the result
  results.tests.forEach((test) => {
    allResults[implementation][test.fullTitle] =
      (Object.keys(test.err).length === 0) ? 'success' : 'failure';

    if(results.pending.find(skipped => skipped.fullTitle === test.fullTitle)) {
      allResults[implementation][test.fullTitle] = 'unimplemented';
    }

    // assume vc.js tests all features
    if(implementation === 'vc.js') {
      allTests.push(test.fullTitle);
    }
  });
});

// generate the implementation report
const implementations = Object.keys(allResults).sort();
let conformanceTable = `
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
allTests.forEach((test) => {
  conformanceTable += `
    <tr>
      <td>${test}</td>
  `;
  implementations.forEach((implementation) => {
    const status = (allResults[implementation][test]) || 'unimplemented';
    let statusMark = '-';

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

// output the implementation report
const template = fs.readFileSync(
  path.join(__dirname, 'template.html'), 'utf-8');
fs.writeFileSync(path.join(__dirname, 'index.html'),
  template.replace('%%%REPORTS%%%', conformanceTable));

console.log("Generated new implementation report.");
