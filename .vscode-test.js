const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig([
  {
    label: "Test javascript",
    files: "__test__/javascript.test.js",
    workspaceFolder: './__fixtures__/packages/javascript/src/index.js',
  },
  {
    label: "Test python 1",
    files: "__test__/python_1.test.js",
    workspaceFolder: './__fixtures__/packages/python_1/src/index.py',
  },
  {
    label: "Test python 2",
    files: "__test__/python_2.test.js",
    workspaceFolder: './__fixtures__/packages/python_2/src/index.py',
  },
]);
