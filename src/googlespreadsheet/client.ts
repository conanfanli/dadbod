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
      console.log("after", gapi.client);
    }
    gapi.load("client", initializeGapiClient);

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
      scope: self.SCOPES,
      callback: (response) => {
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
      this.tokenClient.requestAccessToken({ prompt: "" });
    }
  }
}
