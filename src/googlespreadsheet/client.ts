declare var gisLoadPromise;
declare var gapiLoadPromise;

export interface ISheetClient {
  addRow(
    sheetId: string,
    row: Array<string>
  ): Promise<gapi.client.sheets.AppendValuesResponse | null>;
  connect(): Promise<void>;
  getSheetName(sheetId: string): Promise<string>;
  promptConcent(prompt?: boolean): Promise<void>;
  getRows(sheeId: string): Promise<[string, string][] | null>;
  getLatestRow(sheeId: string): Promise<[string, string] | null>;
  getToken(): GoogleApiOAuth2TokenObject | null;
}

export class SheetClient implements ISheetClient {
  readonly CLIENT_ID =
    "405611184091-qr0f2pe92cmb6089o86v2dovkgqgrc93.apps.googleusercontent.com";
  readonly SCOPES = "https://www.googleapis.com/auth/spreadsheets";
  readonly API_KEY = "AIzaSyAsHWHwapoVGOtuD_BEcATNPQpJkSAaYYg";
  readonly DISCOVERY_DOC =
    "https://sheets.googleapis.com/$discovery/rest?version=v4";
  private tokenClient?: google.accounts.oauth2.TokenClient;

  private _setToken(token: GoogleApiOAuth2TokenObject) {
    const now = new Date().getTime();
    localStorage.setItem(
      "spreadsheet_token",
      JSON.stringify({
        ...token,
        expireAt: now + 1000 * Number(token.expires_in),
      })
    );
    gapi.client.setToken(token);
  }

  public getToken() {
    const tokenFromLocalStorage = localStorage.getItem("spreadsheet_token");
    if (!gapi || !gapi.client) {
      return null;
    }

    if (
      !gapi.client.getToken() &&
      tokenFromLocalStorage &&
      JSON.parse(tokenFromLocalStorage).access_token
    ) {
      console.log("using token from local storage");
      gapi.client.setToken(JSON.parse(tokenFromLocalStorage));
      return JSON.parse(tokenFromLocalStorage);
    }

    if (
      gapi.client.getToken() &&
      (!tokenFromLocalStorage ||
        !JSON.parse(tokenFromLocalStorage).access_token)
    ) {
      this._setToken(gapi.client.getToken());
      console.log("using token from gapi");
      return gapi.client.getToken();
    }
    return tokenFromLocalStorage ? JSON.parse(tokenFromLocalStorage) : null;
  }

  public async connect() {
    const self = this;
    await gapiLoadPromise;
    if (this.tokenClient) {
      return;
    }

    console.warn("calling connet");
    await new Promise<void>((resolve, reject) => {
      gapi.load("client", {
        callback: () => {
          console.log("gapi loaded");
          resolve();
        },
        onerror: reject,
      });
    });
    await gapi.client.init({
      apiKey: self.API_KEY,
      discoveryDocs: [self.DISCOVERY_DOC],
    });
    console.log("gapi client inited");

    await gisLoadPromise;

    await new Promise<void>((resolve, reject) => {
      try {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          // Will be called after requestAccessToken
          callback: (token) => {
            if (token.access_token) {
              this._setToken(token);
            } else {
              reject(token);
            }
          },
        });
        // getToken to sync tokens between localStorage and gapi.client
        this.getToken()
        resolve();
      } catch (err) {
        console.error("reject at 107");
        reject(err);
      }
    });
  }

  public async promptConcent(prompt: boolean = false) {
    return new Promise<void>((resolve, reject) => {
      if (!this.tokenClient) {
        throw new Error("failed to init token client");
      }
      (this.tokenClient as any).callback = (token) => {
        this._setToken(token);
        console.log("consent obtained");
        resolve();
      };

      if (!this.getToken() || prompt) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        this.tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        console.log("live spreadsheet session");
        this.tokenClient.requestAccessToken({ prompt: "none" });
      }
    });
  }

  public async getSheetName(sheetId: string) {
    console.warn("calling getSheetName ");
    const res = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    return res.result?.properties?.title || "";
  }

  public async getLatestRow(sheetId: string) {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sheet1!C2:D2",
      });
      const range = response.result;
      if (!range || !range.values || range.values.length === 0) {
        return null;
      }
      return range.values[0] as [string, string];
    } catch (e) {
      console.error("cannot get latest row", { token: gapi.client.getToken(), status: (e as any).status });
      return null;
    }
  }
  public async getRows(sheetId: string) {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A2:B",
    });
    const range = response.result;
    if (!range || !range.values || range.values.length === 0) {
      return null;
    }
    return range.values as [string, string][];
  }

  public async addRow(sheetId: string, row: Array<string>) {
    await gapi.client.sheets.spreadsheets.values.update(
      {
        spreadsheetId: sheetId,
        range: "Sheet1!C1:C2",
        valueInputOption: "USER_ENTERED",
      },
      {
        majorDimension: "ROWS",
        values: [["latest"], ["=index(sort(A2:B,1,false),1,0)"]],
      }
    );
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
}
