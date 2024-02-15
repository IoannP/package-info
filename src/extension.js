const vscode = require('vscode');
const { opendir, readFile } = require('node:fs/promises');
const path = require('path');
const hasKey = require('lodash.has');

const esmaImportRegex = /^import(?:["'\s]*([\w*{}\n, ]+))from[ \n\t]*(?:['"])(?<packageName>([^'"\n]+))(['"])/g;
const cjsImportRegex = /(^(?:const|var|let)(?:[\w*{}\n, ]+)=\s*require|^require)\(\s*['"](?<packageName>[^'"\n\r]+)(?=['"]\s*\))/g;

/**
 * Retrieves the package name from the given text using ES module or CommonJS import regex patterns.
 *
 * @param { string } text - The input text from which to extract the package name
 * @return { string } The extracted package name
 */
const getPackageName = (text) => {
  const esmaRegex = new RegExp(esmaImportRegex);
  const cjsRegex = new RegExp(cjsImportRegex);

  const { packageName: esmaMatchResult } = esmaRegex.exec(text)?.groups || {};
  const { packageName: cjsMatchResult } = cjsRegex.exec(text)?.groups || {};

  return esmaMatchResult || cjsMatchResult;
};

/**
 * Check if a package is installed in the project dependencies.
 *
 * @param { string } currentDirectoryPath - The path of the current directory
 * @param { string } packageName - The name of the package to check
 * @return { Promise<boolean> } Whether the package is installed or not
 */
const isPackageInstalled = async (currentDirectoryPath, packageName) => {
  const directory = await opendir(currentDirectoryPath);
  const workspaceDirectory = vscode.workspace.workspaceFolders[0].uri.fsPath;

  let isPackageJsonPresent = false;
  for await (const item of directory) {
    if (item.name === 'package.json') {
      isPackageJsonPresent = true;
      break;
    }
  }

  if (!isPackageJsonPresent && currentDirectoryPath === workspaceDirectory) {
    return false;
  }

  if (!isPackageJsonPresent) {
    const parentDirectoryPath = path.dirname(currentDirectoryPath);
    return isPackageInstalled(parentDirectoryPath, packageName);
  }

  const packageJsonPath = `${currentDirectoryPath}/package.json`;
  const packageJson = await readFile(packageJsonPath, "utf8");

  const { dependencies, devDependencies, peerDependencies } = JSON.parse(packageJson);
  return (
    hasKey(dependencies, packageName) ||
    hasKey(devDependencies, packageName) ||
    hasKey(peerDependencies, packageName)
  );
};

/**l
 * Function to activate a hover provider for JavaScript, fetching information about imported modules from npm.
 *
 * @param { vscode.ExtensionContext } context - The extension context
 */
function activate(context) {
  const onHoverAction = vscode.languages.registerHoverProvider(
    [
      { language: 'javascript', scheme: 'file' },
      { language: 'typescript', scheme: 'file' },
      { language: 'vue', scheme: 'file' },
    ],
    {
      async provideHover(document, position) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return new vscode.Hover('');
        }

        const lineTextOnHover = editor.document.getText(new vscode.Range(position.line, 0, position.line + 1, 0)) || '';
        const packageName = getPackageName(lineTextOnHover.trim());

        const currentDirectoryPath = path.dirname(document.fileName);
        const hasPackage = await isPackageInstalled(currentDirectoryPath, packageName);

        if (hasPackage) {
          return fetch(`https://registry.npmjs.org/${packageName}/latest`)
            .then((response) => response.json())
            .then((data) => {
              const text = new vscode.MarkdownString();
              text.supportHtml = true;

              const homePageLink = data.homepage;
              const npmLink = `https://www.npmjs.com/package/${packageName}`;
              const githubLink = data.repository.url.replace(/.*(?=\/\/)/, 'https:');

              text.appendMarkdown(`**Description**: ${data.description}<br />`);
              text.appendMarkdown(`**GitHub**: [${githubLink}](${githubLink})<br />`);
              text.appendMarkdown(`**NPM**: [${npmLink}](${npmLink})<br />`);

              if (!homePageLink.startsWith("https://github.com")) {
                text.appendMarkdown(`**Homepage**: [${homePageLink}](${homePageLink})<br />`);
              }

              return new vscode.Hover(text);
            })
            .catch(() => new vscode.Hover(''));
        } else {
          return new vscode.Hover('');
        }
      },
    }
  );

  context.subscriptions.push(onHoverAction);
}

module.exports = { activate };
