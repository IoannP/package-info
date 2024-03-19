module.exports = {
  javascript: {
    data: {
      packages: {
        package: {
          homepage: 'https://package.com',
          repository: {
            url: 'git://github.com/package/package',
          },
          description: 'This is the description of the package',
        },
        test: {
          homepage: 'https://github.com/package/test',
          repository: {
            url: 'https://github.com/package/test',
          },
          description: 'This is the description of the test package',
        },
        peer: {
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
      package: '**Description**: This is the description of the package<br />**GitHub**: [https://github.com/package/package](https://github.com/package/package)<br />**NPM**: [https://www.npmjs.com/package/package](https://www.npmjs.com/package/package)<br />**Homepage**: [https://package.com](https://package.com)<br />',
      test: '**Description**: This is the description of the test package<br />**GitHub**: [https://github.com/package/test](https://github.com/package/test)<br />**NPM**: [https://www.npmjs.com/package/test](https://www.npmjs.com/package/test)<br />',
      peer: '**Description**: This is the description of the peer package<br />**GitHub**: [https://github.com/package/peer](https://github.com/package/peer)<br />**NPM**: [https://www.npmjs.com/package/peer](https://www.npmjs.com/package/peer)<br />',
    },
  },
};
