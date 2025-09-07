import path from "node:path";

import { generatePackageNameVariants, has } from "../utils.mjs";

import { Language, PackageInfo } from "../types.mjs";

const PACKAGE_STORAGE_LINK = "https://pypi.org/pypi";

export type PyTomlData = {
  project?: { dependencies: string[]; devDependencies: string[] };
  tool?: {
    poetry?: { dependencies: string[]; devDependencies: string[] };
  };
};
export type PyPackageData = {
  info: {
    summary: string;
    home_page: string;
    package_url: string;
    project_urls: Record<string, string>;
  };
};

const buildPackageInfoUrl = (packageName: string) =>
  path.join(PACKAGE_STORAGE_LINK, packageName, "json");

const findPackageName = (data: PyTomlData, importName: string) => {
  const { dependencies = [], devDependencies = [] } =
    data.project || data?.tool?.poetry || {};

  const dependencyPackages: Record<string, string> = {};
  const devDependencyPackages: Record<string, string> = {};

  // parse packgaes if it's an array with values as "package>=1.2.0"
  if (Array.isArray(dependencies)) {
    dependencies.forEach((row) => {
      const [packageName] = row.match(/(.+?)(?=[><=]|$)/g) || [];
      if (packageName !== undefined) {
        dependencyPackages[packageName] = packageName;
      }
    });
  }
  // parse packgaes if it's an array with values as "package>=1.2.0"
  if (Array.isArray(devDependencies)) {
    devDependencies.forEach((row) => {
      const [packageName] = row.match(/(.+?)(?=[><=]|$)/g) || [];
      if (packageName !== undefined) {
        devDependencyPackages[packageName] = packageName;
      }
    });
  }

  const packageNameVariants: string[] = generatePackageNameVariants(
    importName,
    "."
  );
  let packageName = packageNameVariants.find((variant) =>
    has(dependencies, variant)
  );

  if (!packageName) {
    packageName = packageNameVariants.find((variant) =>
      has(devDependencies, variant)
    );
  }

  return packageName || "";
};

const extractPackageInfo = (data: PyPackageData): PackageInfo => {
  const { summary, home_page, package_url, project_urls } = data.info;
  const { Documentation, Homepage, Repository, Source, Docs, Github } =
    project_urls;

  const packageManagerLink = package_url;
  let homePageLink = home_page || Homepage || Docs || Documentation || "";
  let githubLink = "";

  if (homePageLink.match("github")) {
    githubLink = homePageLink;
    homePageLink = "";
  }
  if (githubLink.length === 0) {
    [githubLink = ""] = [Github, Repository, Source, Homepage]
      .map((link) => (link || "").replace(/.*(?=\/\/)/, "https:"))
      .filter((link) => link.startsWith("https://github.com"));
  }

  const description = summary || "";
  const packageManagerName = "PyPI";

  return {
    homePageLink,
    packageManagerLink,
    githubLink,
    description,
    packageManagerName,
  };
};

const python: Language<PyTomlData, PyPackageData> = {
  regexes: [
    /(?<=^from|\s+from)(?<packageName>(.+))(?=import)/g,
    /(^|^\s+)import(?<packageName>(.+))/g,
  ],
  packageManagerFileName: "pyproject.toml",
  buildPackageInfoUrl,
  extractPackageInfo,
  findPackageName,
};

export default python;
