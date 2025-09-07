import path from "node:path";
import { has, generatePackageNameVariants } from "../utils.mjs";
import { Language, PackageInfo } from "../types.mjs";

export type PackageJson = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

export type PackageData = {
  name: string;
  description?: string;
  homepage?: string;
  repository?: { url: string };
};

const NPM_PACKAGE_STORAGE_LINK = "https://registry.npmjs.org";
const NPM_PACKAGE_WEB_LINK = "https://www.npmjs.com/package";

const buildPackageInfoUrl = (
  packageName: string,
  packageVersion: string = "latest"
): string => {
  return path.join(NPM_PACKAGE_STORAGE_LINK, packageName, packageVersion);
};

const findPackageName = (
  packageData: PackageJson,
  importName: string
): string | undefined => {
  const packageNameVariants: string[] = generatePackageNameVariants(importName);

  const { dependencies, devDependencies, peerDependencies } = packageData;

  let packageName = packageNameVariants.find((variant) =>
    has(dependencies, variant)
  );
  if (!packageName) {
    packageName = packageNameVariants.find((variant) =>
      has(devDependencies, variant)
    );
  }
  if (!packageName) {
    packageName = packageNameVariants.find((variant) =>
      has(peerDependencies, variant)
    );
  }

  return packageName;
};

const extractPackageInfo = (data: PackageData): PackageInfo => {
  const packageManagerLink = path.join(
    NPM_PACKAGE_WEB_LINK,
    "package",
    data.name
  );
  let homePageLink = data.homepage || "";
  let githubLink = "";

  const description = data.description || "";
  const packageManagerName = "NPM";

  if (homePageLink.match("github")) {
    githubLink = homePageLink;
    homePageLink = "";
  }

  if (githubLink.length === 0) {
    githubLink = data.repository?.url.replace(/.*(?=\/\/)/, "https:") || "";
  }

  return {
    homePageLink,
    packageManagerLink,
    githubLink,
    description,
    packageManagerName,
  };
};

const javascript: Language<PackageJson, PackageData> = {
  regexes: [
    /(?<![/'"`].+)(from[\s\n\t]*|import\()(?:['"])(?<packageName>.+)(?:['"])/g,
    /(?<![/'"`].+)(?:require\s*\()(?:['"])(?<packageName>.+)(?:['"]\))/g,
  ],
  packageManagerFileName: "package.json",
  buildPackageInfoUrl,
  extractPackageInfo,
  findPackageName,
};

export default javascript;
