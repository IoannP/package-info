const hasKey = require('lodash.has');
const { generatePackageNameVariants } = require('../utils');

module.exports = {
  regexes: [
    /(?<=^from|\s+from)(?<packageName>(.+))(?=import)/g,
    /(^|^\s+)import(?<packageName>(.+))/g,
  ],
  packageManagerFileName: 'pyproject.toml',
  buildPackageInfoUrl: (packageName) => `https://pypi.org/pypi/${packageName}/json`,
  extractPackageName: (data, importName) => {
    let { dependencies = {}, devDependencies = {} } = data.project || data?.tool?.poetry || {};

    // parse packgaes if it's an array with values as "package>=1.2.0"
    if (dependencies instanceof Array) {
      dependencies = dependencies.reduce((acc, value) => {
        const [packageName] = value.match(/(.+?)(?=[><=]|$)/g) || [];
        acc[packageName] = packageName;
        return acc;
      }, {});
    }
    // parse packgaes if it's an array with values as "package>=1.2.0"
    if (devDependencies instanceof Array) {
      devDependencies = devDependencies.reduce((acc, value) => {
        const [packageName] = value.match(/(.+?)(?=[><=]|$)/g) || [];
        acc[packageName] = packageName;
        return acc;
      }, {});
    }

    const packageNames = generatePackageNameVariants(importName, '.');
    let packageName = packageNames.find((name) => hasKey(dependencies, name));

    if (!packageName) {
      packageName = packageNames.find((name) => hasKey(devDependencies, name));
    }

    return packageName || '';
  },
  extractPackageInfo: (data) => {
    console.log('Extract package info: ', data);
    const { summary, home_page, package_url, project_urls } = data.info;
    const { Documentation, Homepage, Repository, Source, Docs, Github } = project_urls;

    const packageManagerLink = package_url;
    let homePageLink = home_page || Homepage || Docs || Documentation || '';
    let githubLink = '';

    if (homePageLink.match('github')) {
      githubLink = homePageLink;
      homePageLink = '';
    }
    if (githubLink.length === 0) {
      [githubLink = ''] = [Github, Repository, Source, Homepage]
        .map((link) => (link || '').replace(/.*(?=\/\/)/, 'https:'))
        .filter((link) => link.startsWith('https://github.com'));
    }

    const description = summary || '';
    const packageManagerName = 'PyPI';

    return {
      homePageLink,
      packageManagerLink,
      githubLink,
      description,
      packageManagerName,
    };
  },
};
