module.exports = {
  javascript: {
    data: {
      packages: {
        package: {
          name: 'package',
          homepage: 'https://package.com',
          repository: {
            url: 'git://github.com/package/package',
          },
          description: 'This is the description of the package',
        },
        test: {
          name: 'test',
          homepage: 'https://github.com/package/test',
          repository: {
            url: 'https://github.com/package/test',
          },
          description: 'This is the description of the test package',
        },
        peer: {
          name: 'peer',
          repository: {
            url: 'https://github.com/package/peer',
          },
          description: 'This is the description of the peer package',
        },
      },
      matches: [
        { input: 'require("package")', packageName: 'package' },
        { input: 'require ("test")', packageName: 'test' },
        { input: 'require("peer")', packageName: 'peer' },
        { input: 'import("package")', packageName: 'package' },
        { input: 'import(\'test\')', packageName: 'test' },
        { input: 'import("peer")', packageName: 'peer' },
        { input: 'from "package"', packageName: 'package' },
        { input: 'from "test"', packageName: 'test' },
        { input: 'from "peer"', packageName: 'peer' },
        { input: '} from "package"', packageName: 'package' },
        { input: 'const package = require("package")', packageName: 'package' },
        { input: 'import("test").then(', packageName: 'test' },
        { input: 'const peer from "peer";', packageName: 'peer' },
      ],
    },
    expected: {
      package: '**Description**: This is the description of the package<br />**NPM**: [https://www.npmjs.com/package/package](https://www.npmjs.com/package/package)<br />**GitHub**: [https://github.com/package/package](https://github.com/package/package)<br />**Homepage**: [https://package.com](https://package.com)<br />',
      test: '**Description**: This is the description of the test package<br />**NPM**: [https://www.npmjs.com/package/test](https://www.npmjs.com/package/test)<br />**GitHub**: [https://github.com/package/test](https://github.com/package/test)<br />',
      peer: '**Description**: This is the description of the peer package<br />**NPM**: [https://www.npmjs.com/package/peer](https://www.npmjs.com/package/peer)<br />**GitHub**: [https://github.com/package/peer](https://github.com/package/peer)<br />',
    },
  },
  python: {
    data: {
      packages: {
        module: {
          info: {
            package_url: 'https://pypi.org/project/module/',
            project_urls: {
              Homepage: 'http://module.com',
              Repository: 'https://github.com/package/module',
            },
            summary: 'This is the description of the module',
          }
        },
        module_1: {
          info: {
            home_page: 'https://github.com/package/module_1',
            package_url: 'https://pypi.org/project/module_1/',
            project_urls: {},
            summary: 'This is the description of the module_1',
          }
        },
        module_2: {
          info: {
            home_page: '',
            package_url: 'https://pypi.org/project/module_2/',
            project_urls: {
              Source: 'https://github.com/package/module_2',
            },
            summary: 'This is the description of the module_2',
          }
        },
      },
      matches: [
        { input: 'import module', packageName: 'module' },
        { input: 'import module_1 as alias', packageName: 'module_1' },
        { input: 'from module_2 import symbol1, symbol2', packageName: 'module_2' },
        { input: 'from module import *', packageName: 'module' },
        { input: 'import module_1.sub_module', packageName: 'module_1' },
        { input: 'from module_2.module_name import symbol1', packageName: 'module_2' },
      ],
    },
    expected: {
      module: '**Description**: This is the description of the module<br />**PyPI**: [https://pypi.org/project/module/](https://pypi.org/project/module/)<br />**GitHub**: [https://github.com/package/module](https://github.com/package/module)<br />**Homepage**: [http://module.com](http://module.com)<br />',
      module_1: '**Description**: This is the description of the module_1<br />**PyPI**: [https://pypi.org/project/module_1/](https://pypi.org/project/module_1/)<br />**GitHub**: [https://github.com/package/module_1](https://github.com/package/module_1)',
      module_2: '**Description**: This is the description of the module_2<br />**PyPI**: [https://pypi.org/project/module_2/](https://pypi.org/project/module_2/)<br />**GitHub**: [https://github.com/package/module_2](https://github.com/package/module_2)',
    },
  },
};