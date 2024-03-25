const vscode = require('vscode');
const getPackageInfo = require('./src/index.js');

/**
 * Generate hover information for installed package.
 *
 * @param { vscode.TextDocument } document - Current text document.
 * @param { vscode.Position } position - Current document text position.
 * @return { Promise<vscode.Hover | null> } The hover package information if available, otherwise null.
 */
async function provideHover(document, position) {
  try {
    if (!document) {
      return null;
    }

    const lineTextOnHover = document.getText(new vscode.Range(position.line, 0, position.line + 1, 0)) || '';
    const language = document.languageId;

    const packageInfo = await getPackageInfo(lineTextOnHover, language);

    return packageInfo ? new vscode.Hover(packageInfo) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Function to activate a hover provider for JavaScript, fetching information about imported modules from npm.
 *
 * @param { vscode.ExtensionContext } context - The extension context
 */
function activate(context) {
  const subscription = vscode.languages.registerHoverProvider(
    [
      { language: 'javascript', scheme: 'file' },
      { language: 'typescript', scheme: 'file' },
      { language: 'vue', scheme: 'file' },
      { language: 'svelte', scheme: 'file' },
      { language: 'python', scheme: 'file' },
    ],
    {
      provideHover,
    },
  );

  context.subscriptions.push(subscription);
}

module.exports = { activate };
