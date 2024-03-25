const path = require('path');
const yml = require('yaml');
const toml = require('toml');

const { opendir, readFile } = require('node:fs/promises');
const { workspace } = require('vscode');

const generatePackageNameVariants = (packageName, delimiter) => {
  const parts = packageName.split(delimiter);
  const names = [];

  for (let i = 0; i < parts.length; i += 1) {
    const name = parts.slice(0, i + 1).join(delimiter);
    names.push(name);
  }

  return names;
};

/**
 * Retrieves the package name from the given text using regex patterns.
 *
 * @param { string } text - The input text from which to extract the package name
 * @param { Array<RegExp> } regexes - The regexes used to extract the package name
 * @return { string } The extracted package name
 */
const extractImportName = (text, regexes) => {
  for (const regex of regexes) {
    const { packageName } = regex.exec(text)?.groups || {};
    if (packageName) {
      return packageName.trim();
    }
  }

  return '';
};

/**
 * Find file by given file name in the given directory path or its parent directories.
 *
 * @param { string } dirPath - The path of the current directory to start the search from.
 * @return { Promise<string | null> } The path to the package.json file if found, otherwise null.
 */
const findFileByName = async (dirPath, fileName) => {
  const directory = await opendir(dirPath);

  const workspaceDirectoryPath = workspace.workspaceFolders
    ? workspace.workspaceFolders[0].uri.fsPath
    : null;

  let isPackageJsonPresent = false;
  for await (const item of directory) {
    if (item.name === fileName) {
      isPackageJsonPresent = true;
      break;
    }
  }

  if (!isPackageJsonPresent && dirPath === workspaceDirectoryPath) {
    return null;
  }

  if (!isPackageJsonPresent) {
    const parentDirectoryPath = path.dirname(dirPath);
    return findFileByName(parentDirectoryPath, fileName);
  }

  return path.join(dirPath, fileName);
};

/**
 * Parses the given file data based on the file extension.
 *
 * @param { string } fileData - The data of the file to be parsed.
 * @param { string } fileExtension - The extension of the file specifying the parsing method.
 * @return { object } The parsed data based on the provided file extension.
 */
const parseFileData = (fileData, fileExtension) => {
  switch(fileExtension) {
    case '.json':
      return JSON.parse(fileData);
    case '.yml':
    case '.yaml':
      return yml.parse(fileData);
    case '.toml':
      return toml.parse(fileData);
    default:
      throw new Error('No parser found for file extension: ' + fileExtension);
  }
};

const getFileData = async (filePath) => {
  const fileData = await readFile(filePath, 'utf8');
  const fileExtension = path.extname(filePath);

  return parseFileData(fileData, fileExtension);
};

module.exports = {
  findFileByName,
  parseFileData,
  getFileData,
  extractImportName,
  generatePackageNameVariants,
};
