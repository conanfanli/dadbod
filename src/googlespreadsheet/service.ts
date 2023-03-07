import { SheetClient, ISheetClient } from "./client";

interface ISheetService {
  addRow(
    sheetId: string,
    row: Array<string>
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;

  getSheetName(sheetId: string): Promise<string>;
}

export class SheetService implements ISheetService {
  private client: ISheetClient;

  constructor() {
    this.client = new SheetClient();
  }

  private async _handle401(apiPromise: Promise<any>) {
    try {
      return await apiPromise;
    } catch (err: any) {
      if (err.result.error.code === 401) {
        await this.client.authenticate();
        await this.client.requestConsent();
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
}

let _sheetService: ISheetService;

export function getSheetService() {
  if (!_sheetService) {
    _sheetService = new SheetService();
  }

  return _sheetService;
}
