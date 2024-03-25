const hasKey = require('lodash.has');
const { generatePackageNameVariants } = require('../utils');

module.exports = {
  regexes: [
    /(?<![/'"`].+)(from[\s\n\t]*|import\()(?:['"])(?<packageName>.+)(?:['"])/g,
    /(?<![/'"`].+)(?:require\s*\()(?:['"])(?<packageName>.+)(?:['"]\))/g,
  ],
  packageManagerFileName: 'package.json',
  buildPackageInfoUrl: (packageName) => `https://registry.npmjs.org/${packageName}/latest`,
  extractPackageName: (data, importName) => {
    const packagesNames = generatePackageNameVariants(importName, '/');

    const { dependencies, devDependencies, peerDependencies } = data;

    let packageName = packagesNames.find((name) => hasKey(dependencies, name));
    if (!packageName) {
      packageName = packagesNames.find((name) => hasKey(devDependencies, name));
    }
    if (!packageName) {
      packageName = packagesNames.find((name) => hasKey(peerDependencies, name));
    }

    return packageName || '';
  },
  extractPackageInfo: (data) => {
    const packageManagerLink = `https://www.npmjs.com/package/${data.name}`;
    let homePageLink = data.homepage || '';
    let githubLink = '';

    const description = data.description || '';
    const packageManagerName = 'NPM';

    if (homePageLink.match('github')) {
      githubLink = homePageLink;
      homePageLink = '';
    }

    if (githubLink.length === 0) {
      githubLink = data.repository?.url.replace(/.*(?=\/\/)/, 'https:');
    }

    return {
      homePageLink,
      packageManagerLink,
      githubLink,
      description,
      packageManagerName,
    };
  },
};