import path from "node:path";
import yml from "yaml";
import toml from "toml";

import { opendir, readFile } from "node:fs/promises";
import { workspace } from "vscode";

const isUndefined = (value: unknown): value is undefined => value === undefined;

const isNull = (value: unknown): value is null => value === null;

const isNil = (value: unknown): value is null | undefined =>
  isUndefined(value) || isNull(value);

const getWorkspaceDirpath = (): string | undefined =>
  (workspace.workspaceFolders ?? [])[0]?.uri.fsPath;

const generatePackageNameVariants = (
  packageName: string,
  delimiter: string = "/"
): string[] => {
  const parts = packageName.split(delimiter);
  const names = [];

  for (let i = 0; i < parts.length; i += 1) {
    const name = parts.slice(0, i + 1).join(delimiter);
    names.push(name);
  }

  return names;
};

const has = <T extends object>(input: T, path: string | string[]): boolean => {
  if (isNil(input)) {
    return false;
  }

  const pathArray = Array.isArray(path) ? path : path.split(".");

  let current: unknown = input;
  for (const key of pathArray) {
    if (isNil(current)) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return !isNil(current);
};

const extractImportName = (
  text: string,
  regexes: RegExp[]
): string | undefined => {
  for (const regex of regexes) {
    const { packageName } = regex.exec(text)?.groups || {};
    if (packageName) {
      return packageName.trim();
    }
  }
};

const findFileByName = async (
  currentDirPath: string,
  fileName: string
): Promise<string | undefined> => {
  const directory = await opendir(currentDirPath);

  let isFileExists = false;
  for await (const item of directory) {
    if (item.name === fileName) {
      isFileExists = true;
      break;
    }
  }

  // Prevent deep recursion if current directory is the workspace root
  if (!isFileExists && currentDirPath === getWorkspaceDirpath()) {
    return;
  }

  if (!isFileExists) {
    const parentDirectoryPath = path.dirname(currentDirPath);
    return findFileByName(parentDirectoryPath, fileName);
  }

  return path.join(currentDirPath, fileName);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseFileData = (fileData: string, fileExtension: string): any => {
  switch (fileExtension) {
    case ".json":
      return JSON.parse(fileData);
    case ".yml":
    case ".yaml":
      return yml.parse(fileData);
    case ".toml":
      return toml.parse(fileData);
    default:
      throw new Error("No parser found for file extension: " + fileExtension);
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFileData = async (filePath: string): Promise<any> => {
  const fileData = await readFile(filePath, "utf8");
  const fileExtension = path.extname(filePath);

  return parseFileData(fileData, fileExtension);
};

export {
  findFileByName,
  parseFileData,
  getFileData,
  extractImportName,
  has,
  isUndefined,
  isNil,
  isNull,
  generatePackageNameVariants,
  getWorkspaceDirpath,
};
