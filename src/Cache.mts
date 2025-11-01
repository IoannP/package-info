import type { PackageInfo } from "./types.mjs";

export default class Cache {
  static storage: Map<string, PackageInfo> = new Map();

  public static get(key: string): PackageInfo | undefined {
    return this.storage.get(key);
  }

  public static set(key: string, data: PackageInfo): void {
    this.storage.set(key, data);
  }
}
