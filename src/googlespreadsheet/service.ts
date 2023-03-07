import { SheetClient, ISheetClient } from "./client";

interface ISheetService {
  addRow(
    sheetId: string,
    row: Array<string>
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;

  getRows(sheeId: string): Promise<[string, string][] | null>;
  getSheetName(sheetId: string): Promise<string>;

  promptConcent(): Promise<void>;
}

export class SheetService implements ISheetService {
  private client: ISheetClient;

  public async promptConcent() {
    return await this.client.promptConcent();
  }

  constructor() {
    this.client = new SheetClient();
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
  public async addRow(sheetId: string, row: Array<string>) {
    return this._handle401(this.client.addRow(sheetId, row));
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
