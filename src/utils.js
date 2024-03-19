const path = require('path');
const { opendir } = require('node:fs/promises');
const { workspace } = require('vscode');

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
    if (item.name === 'package.json') {
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

  return `${dirPath}/package.json`;
};

module.exports = { findFileByName };
