const axios = require('axios');

const path = require('path');
const { MarkdownString, window } = require('vscode');

const languages = require('./languages');
const { findFileByName, getFileData, extractImportName } = require('./utils');


/**
 * Retrieves package information and displays it in a hover over the text.
 *
 * @param { string } text - The text to extract package information from.
 * @return { Promise<MarkdownString | null> } A hover containing package information or null.
 */
const getPackageInfo = async (text, language) => {
  const languageConfig = languages[language];
  if (!languageConfig) {
    return null;
  }

  const {
    regexes,
    packageManagerFileName,
    extractPackageName,
    buildPackageInfoUrl,
    extractPackageInfo,
  } = languageConfig;

  const importName = extractImportName(text, regexes);
  if (importName.length === 0) {
    return null;
  }

  const currentDirectoryPath = path.dirname(window.activeTextEditor?.document.fileName);
  if (!currentDirectoryPath) {
    return null;
  }

  const packageManagerFilePath = await findFileByName(currentDirectoryPath, packageManagerFileName);
  if (!packageManagerFilePath) {
    return null;
  }

  const packageManagerFileData = await getFileData(packageManagerFilePath);
  const packageName = extractPackageName(packageManagerFileData, importName);
  if (packageName.length === 0) {
    return null;
  }

  const packageInfoUrl = buildPackageInfoUrl(packageName);
  const packageInfo = await axios.get(packageInfoUrl).then(({ data }) => data)

  const content = new MarkdownString();
  content.supportHtml = true;

  const {
    homePageLink,
    packageManagerLink,
    githubLink,
    description,
    packageManagerName
  } = extractPackageInfo(packageInfo);

  content.appendMarkdown(`**Description**: ${description}<br />`);
  content.appendMarkdown(`**${packageManagerName}**: [${packageManagerLink}](${packageManagerLink})<br />`);

  if (githubLink.length > 0) {
    content.appendMarkdown(`**GitHub**: [${githubLink}](${githubLink})<br />`);
  }

  if (homePageLink.length > 0 && !homePageLink.startsWith('https://github.com')) {
    content.appendMarkdown(`**Homepage**: [${homePageLink}](${homePageLink})<br />`);
  }

  return content;
};

module.exports = getPackageInfo;
