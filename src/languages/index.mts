import javaScript from "./javascript.mjs";
import python from "./python.mjs";

import type { Language } from "../types.mjs";
import type { PackageJson, PackageData } from "./javascript.mjs";
import type { PyTomlData, PyPackageData } from "./python.mjs";

type LanguageType =
  | Language<PackageJson, PackageData>
  | Language<PyTomlData, PyPackageData>;

const languageMap: Record<string, LanguageType> = {
  javascript: javaScript,
  javascriptreact: javaScript,
  svelte: javaScript,
  typescript: javaScript,
  typescriptreact: javaScript,
  vue: javaScript,
  python,
};

export default (languageName: string): LanguageType | null =>
  languageMap[languageName] || null;
