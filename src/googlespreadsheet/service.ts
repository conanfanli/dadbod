import type { DbState } from "../types";
import { ISheetClient, SheetClient } from "./client";

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z$/;
function reviver(key, value) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }

  return value;
}

export interface ISheetService {
  getRows(): Promise<[string, string][] | null>;
  getLatestState(): Promise<DbState | null>;
  getSheetName(): Promise<string>;
  hasConsent(): Promise<boolean>;
  promptConcent(): Promise<void>;
  sheetId: string;

  /**
   * Backup entire DB state to spreadsheet
   */
  saveState(
    jsonState: string
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;
}

class SheetService implements ISheetService {
  private client: ISheetClient;
  private _sheetId: string = "";
  constructor() {
    this.client = new SheetClient();
    this._sheetId =
      localStorage.getItem("spreadsheet_id") ||
      "14gqCW3IMNf0kqT-c_vOJ2E3f32otLVyq0fn2Ec0EDGU";
  }

  public async getLatestState(): Promise<DbState | null> {
    await this.client.connect();
    const latest = await this.client.getLatestRow(this.sheetId);
    if (latest) {
      return JSON.parse(latest[1], reviver);
    }

    return null;
  }

  public get sheetId() {
    return this._sheetId;
  }
  public set sheetId(v: string) {
    this._sheetId = v;
    localStorage.setItem("spreadsheet_id", v);
  }

  public async hasConsent() {
    await this.client.connect();
    return !!this.client.getToken();
  }

  public async promptConcent() {
    return await this.client.promptConcent(true);
  }

  private async _promptConsentOn401<T>(apiPromise: Promise<T>): Promise<T> {
    await this.client.connect();
    try {
      return await apiPromise;
    } catch (err: any) {
      if (err?.result?.error?.code === 401) {
        await this.client.promptConcent();
        return await apiPromise;
      }

      throw err;
    }
  }
  public async saveState(jsonState: string) {
    return this._promptConsentOn401(
      this.client.addRow(this.sheetId, [new Date().toISOString(), jsonState])
    );
  }

  public async getSheetName(): Promise<string> {
    if (!this._sheetId) {
      return "";
    }
    await this.client.connect();
    return this._promptConsentOn401(this.client.getSheetName(this.sheetId));
  }

  public async getRows() {
    return this._promptConsentOn401(this.client.getRows(this.sheetId));
  }
}

let _sheetService: ISheetService;

export function getSheetService() {
  if (!_sheetService) {
    console.log("sheet service inited");
    _sheetService = new SheetService();
  }

  return _sheetService;
}
