const vscode = require('vscode');
const { readFile } = require('node:fs/promises');
const hasKey = require('lodash.has');

const esmaImportRegex = /^import(?:["'\s]*([\w*{}\n, ]+))from[ \n\t]*(?:['"])(?<packageName>([^'"\n]+))(['"])/g;
const cjsImportRegex = /^(?:const|var|let)(?:[\w*{}\n, ]+)=\s*require\(\s*['"](?<packageName>[^'"\n\r]+)(?=['"]\s*\))/g; 

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
}


/**
 * Check if a package is installed in the project dependencies.
 *
 * @param { vscode.TextDocument } document - The document object
 * @param { string } packageName - The name of the package to check
 * @return { Promise<boolean> } Whether the package is installed or not
 */
const isPackageInstalled = async (document, packageName) => {
  const { uri } = vscode.workspace.getWorkspaceFolder(document.uri);
  const projectRootFolder = uri.fsPath;
  const packageJsonPath = `${projectRootFolder}/package.json`;
  const packageJson = await readFile(packageJsonPath, 'utf8');
  const { dependencies, devDependencies, peerDependencies } = JSON.parse(packageJson);
  return hasKey(dependencies, packageName) || hasKey(devDependencies, packageName) || hasKey(peerDependencies, packageName);
}

/**
 * Function to activate a hover provider for JavaScript, fetching information about imported modules from npm.
 *
 * @param { vscode.ExtensionContext } context - The extension context
 */
function activate(context) {
  const onHoverAction = vscode.languages.registerHoverProvider(
    { language: 'javascript', scheme: 'file' },
    {
      async provideHover(document, position) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return new vscode.Hover('');
        }

        const lineTextOnHover  = editor
          .document
          .getText(new vscode.Range(position.line, 0, position.line + 1, 0)) || '';
        const packageName = getPackageName(lineTextOnHover.trim());

        const hasPackage = await isPackageInstalled(document, packageName);
        if (hasPackage) {

          return fetch('https://registry.npmjs.org/' + packageName)
            .then((response) => response.json())
            .then((data) => {
              const text = new vscode.MarkdownString();
              text.supportHtml = true;

              text.appendMarkdown(`**Description**: ${data.description}<br />`);
              text.appendMarkdown(`**Homepage**: [${data.homepage}](${data.homepage})`);
 
              return new vscode.Hover(text);
            }).catch(() => new vscode.Hover(''));
          
        } else {
          return new vscode.Hover('');
        }
      }
    }
  );

  context.subscriptions.push(onHoverAction);
}

module.exports = { activate };