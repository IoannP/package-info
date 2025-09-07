import axios from "axios";
import path from "node:path";
import { MarkdownString, window } from "vscode";

import getLanguage from "./languages/index.mjs";
import logger from "./Logger.mjs";
import {
  findFileByName,
  getFileData,
  extractImportName,
  isUndefined,
} from "./utils.mjs";

export default async (
  text: string,
  languageName: string
): Promise<MarkdownString | null> => {
  const language = getLanguage(languageName);
  if (!language) {
    return null;
  }
  logger.info(`language: ${languageName}, text: ${text}`);
  const importName = extractImportName(text, language.regexes);
  logger.debug(`Import name: ${importName}`);

  if (isUndefined(importName)) {
    return null;
  }

  const currntFilePath = window.activeTextEditor?.document.fileName;
  if (isUndefined(currntFilePath)) {
    return null;
  }

  const currentDirectoryPath = path.dirname(currntFilePath);
  // logger.debug("Current dir path: ", currentDirectoryPath);
  if (isUndefined(currentDirectoryPath)) {
    return null;
  }

  const packageManagerFilePath = await findFileByName(
    currentDirectoryPath,
    language.packageManagerFileName
  );

  logger.debug(`Package manager file path: ${packageManagerFilePath}`);
  if (isUndefined(packageManagerFilePath)) {
    return null;
  }

  const packageManagerFileData = await getFileData(packageManagerFilePath);
  const packageName = language.findPackageName(
    packageManagerFileData,
    importName
  );
  logger.debug(`Package name: ", ${packageName}`);
  if (isUndefined(packageName)) {
    return null;
  }

  const packageInfoUrl = language.buildPackageInfoUrl(packageName);
  const packageInfo = await axios.get(packageInfoUrl).then(({ data }) => data);

  const content = new MarkdownString();
  content.supportHtml = true;

  const {
    homePageLink,
    packageManagerLink,
    githubLink,
    description,
    packageManagerName,
  } = language.extractPackageInfo(packageInfo);

  content.appendMarkdown(`**Description**: ${description}<br />`);
  content.appendMarkdown(
    `**${packageManagerName}**: [${packageManagerLink}](${packageManagerLink})<br />`
  );

  if (githubLink.length > 0) {
    content.appendMarkdown(`**GitHub**: [${githubLink}](${githubLink})<br />`);
  }

  if (
    homePageLink.length > 0 &&
    !homePageLink.startsWith("https://github.com")
  ) {
    content.appendMarkdown(
      `**Homepage**: [${homePageLink}](${homePageLink})<br />`
    );
  }

  return content;
};
