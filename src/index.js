const parseJs = require('./languages/javascript');

/**
 * Retrieves package information based on the provided text and language.
 *
 * @param { string } text - The text to be parsed for package information.
 * @param { string } language - The programming language of the text.
 * @return { Promise<import('vscode').MarkdownString | null> } The parsed package information or null if language is not supported
 */
const getPackageInfo = async (text, language) => {
  switch (language) {
    case 'javascript':
      return parseJs(text);
    default:
      return null;
  }
};

module.exports = getPackageInfo;
