import axios from "axios";
import path from "node:path";
import { MarkdownString, window } from "vscode";

import getLanguage from "./languages/index.mjs";
import logger from "./Logger.mjs";
import Cache from "./Cache.mjs";
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

  const importName = extractImportName(text, language.regexes);
  if (isUndefined(importName)) {
    return null;
  }
  logger.info(`language: ${languageName}, matched import name: ${importName}`);

  const currntFilePath = window.activeTextEditor?.document.fileName;
  if (isUndefined(currntFilePath)) {
    return null;
  }

  const currentDirectoryPath = path.dirname(currntFilePath);
  if (isUndefined(currentDirectoryPath)) {
    return null;
  }

  const packageManagerFilePath = await findFileByName(
    currentDirectoryPath,
    language.packageManagerFileName
  );

  logger.info(`Package manager file path: ${packageManagerFilePath}`);
  if (isUndefined(packageManagerFilePath)) {
    return null;
  }

  const packageManagerFileData = await getFileData(packageManagerFilePath);
  const packageName = language.findPackageName(
    packageManagerFileData,
    importName
  );

  if (isUndefined(packageName)) {
    return null;
  }
  logger.info(`Package name: ${packageName}`);

  let packageData = Cache.get(packageName);
  if (isUndefined(packageData)) {
    const packageInfoUrl = language.buildPackageInfoUrl(packageName);
    const packageInfo = await axios
      .get(packageInfoUrl)
      .then(({ data }) => data);
    packageData = language.extractPackageInfo(packageInfo);
    logger.info(`Cache miss → fetched package: ${packageName}`);
    Cache.set(packageName, packageData);
  }

  const {
    homePageLink,
    packageManagerLink,
    githubLink,
    description,
    packageManagerName,
  } = packageData;

  const content = new MarkdownString();
  content.supportHtml = true;

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
