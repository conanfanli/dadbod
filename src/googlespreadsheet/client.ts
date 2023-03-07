let _sheet_client_singleton: SheetClient;
declare var gisLoadPromise;
declare var gapiLoadPromise;

export interface ISheetClient {
  addRow(
    sheetId: string,
    row: Array<string>
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;
  requestConsent(): Promise<void>;
  authenticate(): Promise<void>;
  getSheetName(sheetId: string): Promise<string>;
}

export function getSheetClient() {
  if (!_sheet_client_singleton) {
    console.log("first time setup up sheet client");
    _sheet_client_singleton = new SheetClient();
  }
  return _sheet_client_singleton;
}

export class SheetClient implements ISheetClient {
  readonly SCOPES = "https://www.googleapis.com/auth/spreadsheets";
  readonly API_KEY = "AIzaSyAsHWHwapoVGOtuD_BEcATNPQpJkSAaYYg";
  readonly DISCOVERY_DOC =
    "https://sheets.googleapis.com/$discovery/rest?version=v4";
  private tokenClient?: google.accounts.oauth2.TokenClient;

  public async addRow(sheetId: string, row: Array<string>) {
    const response = await gapi.client.sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetId,
        range: "Sheet1!A2:B2",
        valueInputOption: "USER_ENTERED",
      },
      {
        majorDimension: "ROWS",
        values: [row],
      }
    );
    return response.result;
  }

  public setToken(token: GoogleApiOAuth2TokenObject) {
    localStorage.setItem("spreadsheet_token", JSON.stringify(token));
    gapi.client.setToken(token);
  }

  public getToken() {
    const tokenFromLocalStorage = localStorage.getItem("spreadsheet_token");
    if (!gapi || !gapi.client) {
      return tokenFromLocalStorage;
    }

    if (!gapi.client.getToken() && tokenFromLocalStorage) {
      console.log("using token from local storage");
      gapi.client.setToken(JSON.parse(tokenFromLocalStorage));
      return tokenFromLocalStorage;
    }

    if (gapi.client.getToken() && !tokenFromLocalStorage) {
      localStorage.setItem(
        "spreadsheet_token",
        JSON.stringify(gapi.client.getToken())
      );
      console.log("using token from gapi");
      return gapi.client.getToken();
    }
    return tokenFromLocalStorage;
  }

  public async authenticate() {
    await gisLoadPromise;
    await gapiLoadPromise;
    if (this.tokenClient) {
      return;
    }
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
      scope: this.SCOPES,
      // Will be called after requestAccessToken
      callback: (token) => {
        this.setToken(token);
      },
    });

    const self = this;

    const loadGapi = new Promise<void>((resolve, reject) => {
      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: self.API_KEY,
          discoveryDocs: [self.DISCOVERY_DOC],
        });
        console.log("set up gapi client");
        self.getToken();

        resolve();
      }
      gapi.load("client", initializeGapiClient);
    });

    await loadGapi;
  }

  public async requestConsent() {
    return new Promise<void>((resolve, reject) => {
      if (!this.tokenClient) {
        throw new Error("failed to init token client");
      }
      (this.tokenClient as any).callback = (token) => {
        this.setToken(token);
        console.log("consent obtained");
        resolve();
      };

      if (!this.getToken()) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        this.tokenClient.requestAccessToken({ prompt: "none" });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        console.log("live spreadsheet session");
        this.tokenClient.requestAccessToken({ prompt: "none" });
      }
    });
  }

  public async getSheetName(sheetId: string) {
    const res = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    return res.result?.properties?.title || "";
  }

  public async getRows(sheetId: string) {
    let response;
    try {
      // Fetch first 10 files
      response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "A2:B9999",
      });
    } catch (err: any) {
      if (err.result.error.code === 401) {
        await this.requestConsent();
        response = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: "A2:B9999",
        });
      } else {
        return;
      }
    }
    const range = response.result;
    if (!range || !range.values || range.values.length === 0) {
      return;
    }
    return range.values;
  }

  public async saveState(sheetId: string, jsonState: string) {
    this.getToken();

    const response = await gapi.client.sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetId,
        range: "Sheet1!A2:B2",
        valueInputOption: "USER_ENTERED",
      },
      {
        majorDimension: "ROWS",
        values: [[new Date().toISOString(), jsonState]],
      }
    );
    console.log("got resonse", response.result);
    return response.result;
  }
}
