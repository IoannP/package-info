export interface Language<T, U> {
  regexes: RegExp[];
  packageManagerFileName: string;
  buildPackageInfoUrl: (packageName: string) => string;
  findPackageName: (packageData: T, importName: string) => string | undefined;
  extractPackageInfo: (data: U) => PackageInfo;
}

export type PackageInfo = {
  homePageLink: string;
  packageManagerLink: string;
  githubLink: string;
  description: string;
  packageManagerName: string;
};
