export class SheetClient {
  readonly SCOPES = "https://www.googleapis.com/auth/spreadsheets";
  readonly DISCOVERY_DOC =
    "https://sheets.googleapis.com/$discovery/rest?version=v4";
  readonly sheetId: string;
  // private gapi: typeof gapi.client;
  private tokenClient?: google.accounts.oauth2.TokenClient;

  constructor(sheetId: string) {
    this.sheetId = sheetId;
  }

  public connect() {
    if (this.tokenClient) {
      return;
    }

    const self = this;

    async function initializeGapiClient() {
      await gapi.client.init({
        apiKey: "AIzaSyAsHWHwapoVGOtuD_BEcATNPQpJkSAaYYg",
        discoveryDocs: [self.DISCOVERY_DOC],
      });
    }
    gapi.load("client", initializeGapiClient);

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
      scope: self.SCOPES,
      callback: (response: {
        access_token: string;
        expires_in: string;
        scope: string;
      }) => {
        console.log(response);
      },
    });
  }

  public requestConsent() {
    this.connect();
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
      this.tokenClient.requestAccessToken({ prompt: "" });
    }
  }
  public async listMajors() {
    let response;
    try {
      // Fetch first 10 files
      response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        range: "Class Data!A2:E",
      });
    } catch (err: any) {
      // document.getElementById("content")!.innerText = err.message;
      return;
    }
    const range = response.result;
    if (!range || !range.values || range.values.length === 0) {
      // document.getElementById("content")!.innerText = "No values found.";
      return;
    }
    // Flatten to string to display
    const output = range.values.reduce(
      (str, row) => `${str}${row[0]}, ${row[4]}\n`,
      "Name, Major:\n"
    );
    console.log("output", output);
    return output;
  }
}
