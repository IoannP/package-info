const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig({
  label: "Tests",
  files: "__test__/**/*.test.js",
  workspaceFolder: './__fixtures__/package/file.js',
});
