import { DbClient } from "../indexeddb/client";

export class SheetClient {
  readonly SCOPES = "https://www.googleapis.com/auth/spreadsheets";
  readonly DISCOVERY_DOC =
    "https://sheets.googleapis.com/$discovery/rest?version=v4";
  private tokenClient?: google.accounts.oauth2.TokenClient;

  private static singleton: SheetClient;
  private token?: GoogleApiOAuth2TokenObject;

  public static getInstance() {
    if (!SheetClient.singleton) {
      SheetClient.singleton = new SheetClient();
    }

    return SheetClient.singleton;
  }

  public saveToken(token: GoogleApiOAuth2TokenObject) {
    localStorage.setItem("spreadsheet_token", JSON.stringify(token));
    this.token = token;
  }

  public getToken() {
    if (this.token) {
      return this.token;
    }

    const stored = localStorage.getItem("spreadsheet_token");
    if (stored) {
      this.token = JSON.parse(stored);
    }

    return this.token;
  }

  public initialize() {
    if (this.tokenClient) {
      return;
    }

    const self = this;

    async function initializeGapiClient() {
      await gapi.client.init({
        apiKey: "AIzaSyAsHWHwapoVGOtuD_BEcATNPQpJkSAaYYg",
        discoveryDocs: [self.DISCOVERY_DOC],
        scope: self.SCOPES,
        clientId:
          "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
      });
    }
    // gapi.auth2.getAuthInstance().isSignedIn.listen();
    gapi.load("client", initializeGapiClient);
  }

  public requestConsent(callback) {
    const self = this;
    this.initialize();
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
      scope: this.SCOPES,
      callback: (token) => {
        callback(token);
        self.saveToken(token);
      },
    });
    if (!this.tokenClient) {
      throw new Error("failed to init token client");
    }

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      console.log("live spreadsheet session");
      this.tokenClient.requestAccessToken({ prompt: "none" });
    }
  }

  public hasConsent() {
    return gapi.client.getToken() !== null;
  }

  public async getName(sheetId: string) {
    try {
      // Fetch first 10 files
      const res = await gapi.client.sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      if (res.status === 200) {
        return res.result;
      } else {
        console.error(res);
        return null;
      }
    } catch (err: any) {
      console.error(err);
      return null;
    }
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
      return;
    }
    const range = response.result;
    if (!range || !range.values || range.values.length === 0) {
      return;
    }
    return range.values;
  }

  public async saveState(sheetId: string, dbClient: DbClient) {
    gapi.client.setToken(this.getToken() || null);
    this.requestConsent((t) => {
      console.log("callback", t);
    });
    console.log(this.tokenClient, gapi.client.getToken());

    const response = await gapi.client.sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetId,
        range: "B2",
        valueInputOption: "RAW",
      },
      { values: [[2]] }
    );
    console.log("got resonse", response.result);
    return response.result;
  }
}
