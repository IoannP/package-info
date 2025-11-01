import * as vscode from "vscode";

type LogMods = keyof Pick<
  vscode.LogOutputChannel,
  "debug" | "info" | "error" | "warn"
>;

export default class Logger {
  private static channel: vscode.LogOutputChannel =
    vscode.window.createOutputChannel("Package Info", { log: true });

  private static enabled: boolean = true;

  private static currentLevel: vscode.LogLevel = vscode.LogLevel.Info;

  public static setLogLevel(level: vscode.LogLevel): void {
    this.currentLevel = level;
  }

  private static shouldLog(methodLevel: vscode.LogLevel): boolean {
    return methodLevel <= this.currentLevel && this.enabled;
  }

  public static enable(): void {
    this.enabled = true;
  }

  public static disable(): void {
    this.enabled = false;
  }

  private static log(level: vscode.LogLevel, mode: LogMods, content: string) {
    if (this.shouldLog(level)) {
      this.channel[mode](content);
    }
  }

  public static info(message: string): void {
    this.log(vscode.LogLevel.Info, "info", message);
  }

  public static warn(message: string): void {
    this.log(vscode.LogLevel.Warning, "warn", message);
  }

  public static error(message: string): void {
    this.log(vscode.LogLevel.Error, "error", message);
  }

  public static debug(message: string): void {
    this.log(vscode.LogLevel.Debug, "debug", message);
  }
}
