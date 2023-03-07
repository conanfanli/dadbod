import { SheetClient, ISheetClient } from "./client";

interface ISheetService {
  saveState(
    sheetId: string,
    jsonState: string
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;

  getRows(sheeId: string): Promise<[string, string][] | null>;
  getSheetName(sheetId: string): Promise<string>;

  promptConcent(): Promise<void>;
  hasConsent(): Promise<boolean>;
}

export class SheetService implements ISheetService {
  private client: ISheetClient;

  public async promptConcent() {
    return await this.client.promptConcent();
  }

  constructor() {
    this.client = new SheetClient();
  }

  public async hasConsent() {
    await this.client.connect();
    return !!this.client.getToken();
  }

  private async _handle401<T>(apiPromise: Promise<T>): Promise<T> {
    try {
      return await apiPromise;
    } catch (err: any) {
      if (err.result.error.code === 401) {
        await this.client.promptConcent();
        return await apiPromise;
      }

      throw err;
    }
  }
  public async saveState(sheetId: string, jsonState: string) {
    return this._handle401(
      this.client.addRow(sheetId, [new Date().toISOString(), jsonState])
    );
  }

  public async getSheetName(sheetId: string): Promise<string> {
    return this._handle401(this.client.getSheetName(sheetId));
  }

  public async getRows(sheetId: string) {
    return this._handle401(this.client.getRows(sheetId));
  }
}

let _sheetService: ISheetService;

export function getSheetService() {
  if (!_sheetService) {
    _sheetService = new SheetService();
  }

  return _sheetService;
}
