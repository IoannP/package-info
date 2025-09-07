import * as vscode from "vscode";
import getPackageInfo from "./index.mjs";

/**
 * Generate hover information for installed package.
 */
async function provideHover(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  try {
    if (!document) {
      return null;
    }

    const lineTextOnHover =
      document.getText(
        new vscode.Range(position.line, 0, position.line + 1, 0)
      ) || "";

    const packageInfo = await getPackageInfo(
      lineTextOnHover,
      document.languageId
    );

    return packageInfo ? new vscode.Hover(packageInfo) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export let isDevelopment: boolean;

/**
 * Function to activate a hover provider for JavaScript, fetching information about imported modules from npm.
 */
export function activate(context: vscode.ExtensionContext) {
  isDevelopment = context.extensionMode === vscode.ExtensionMode.Development;

  const subscription = vscode.languages.registerHoverProvider(
    [
      { language: "javascript", scheme: "file" },
      { language: "javascriptreact", scheme: "file" },
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" },
      { language: "vue", scheme: "file" },
      { language: "svelte", scheme: "file" },
      { language: "python", scheme: "file" },
    ],
    {
      provideHover,
    }
  );

  context.subscriptions.push(subscription);
}
