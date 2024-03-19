const path = require('path');
const hasKey = require('lodash.has');
const { MarkdownString, window } = require('vscode');
const { readFile } = require('node:fs/promises');
const axios = require('axios');
const { findFileByName } = require('../utils');

const esmaImportRegex = /(?<![/'"`].+)(from[\s\n\t]*|import\()(?:['"])(?<packageName>.+)(?:['"])/g;
const cjsImportRegex = /(?<![/'"`].+)(?:require\s*\()(?:['"])(?<packageName>.+)(?:['"]\))/g;

/**
 * Retrieves the package name from the given text using ES module or CommonJS import regex patterns.
 *
 * @param { string } text - The input text from which to extract the package name
 * @return { string } The extracted package name
 */
const extractPackageName = (text) => {
  const esmaRegex = new RegExp(esmaImportRegex);
  const cjsRegex = new RegExp(cjsImportRegex);

  const { packageName: esmaMatchResult } = esmaRegex.exec(text)?.groups || {};
  const { packageName: cjsMatchResult } = cjsRegex.exec(text)?.groups || {};

  return esmaMatchResult || cjsMatchResult;
};

/**
 * Check if a package is installed in the project dependencies.
 *
 * @param { string } packageJsonPath - The path of the package.json
 * @param { string } packageName - The name of the package to check
 * @return { Promise<boolean> } Whether the package is installed or not
 */

const isPackageInDependencies = async (packageJsonPath, packageName) => {
  const packageJson = await readFile(packageJsonPath, 'utf8');

  const { dependencies, devDependencies, peerDependencies } = JSON.parse(packageJson);
  return (
    hasKey(dependencies, packageName)
    || hasKey(devDependencies, packageName)
    || hasKey(peerDependencies, packageName)
  );
};

/**
 * Retrieves package information and displays it in a hover over the text.
 *
 * @param { string } text - The text to extract package information from.
 * @return { Promise<MarkdownString | null> } A hover containing package information or null.
 */
const getPackageInfo = async (text) => {
  const packageName = extractPackageName(text);
  if (!packageName) {
    return null;
  }

  const currentDirectoryPath = path.dirname(window.activeTextEditor?.document.fileName);
  if (!currentDirectoryPath) {
    return null;
  }

  const packageJsonPath = await findFileByName(currentDirectoryPath, 'package.json');
  if (!packageJsonPath) {
    return null;
  }

  const hasPackage = await isPackageInDependencies(packageJsonPath, packageName);
  if (!hasPackage) {
    return null;
  }

  const packageInfo = await axios.get(`https://registry.npmjs.org/${packageName}/latest`)
    .then(({ data }) => data);

  const content = new MarkdownString();
  content.supportHtml = true;

  const homePageLink = packageInfo.homepage || '';
  const npmLink = `https://www.npmjs.com/package/${packageName}`;
  const githubLink = packageInfo.repository?.url.replace(/.*(?=\/\/)/, 'https:');

  content.appendMarkdown(`**Description**: ${packageInfo.description}<br />`);
  content.appendMarkdown(`**GitHub**: [${githubLink}](${githubLink})<br />`);
  content.appendMarkdown(`**NPM**: [${npmLink}](${npmLink})<br />`);

  if (homePageLink.length > 0 && !homePageLink.startsWith('https://github.com')) {
    content.appendMarkdown(`**Homepage**: [${homePageLink}](${homePageLink})<br />`);
  }

  return content;
};

module.exports = getPackageInfo;
