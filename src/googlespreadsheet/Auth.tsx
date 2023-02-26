import * as React from "react";
import { Button } from "@mui/material";

declare var google: any;
declare var gapi: any;
let tokenClient: any;
let gapiInited = false;
let gisInited = false;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";

async function listMajors() {
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
  if (!range || !range.values || range.values.length == 0) {
    // document.getElementById("content")!.innerText = "No values found.";
    return;
  }
  // Flatten to string to display
  const output = range.values.reduce(
    (str, row) => `${str}${row[0]}, ${row[4]}\n`,
    "Name, Major:\n"
  );
  console.log("output", output);
  // document.getElementById("content")!.innerText = output;
}
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    // document.getElementById("authorize_button")!.style.visibility = "visible";
  }
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id:
      "405611184091-6od2974ndpvjucgr73ivt1ocmqkv51l6.apps.googleusercontent.com",
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: "AIzaSyAsHWHwapoVGOtuD_BEcATNPQpJkSAaYYg",
    discoveryDocs: [DISCOVERY_DOC],
  });
  console.log("client is", gapi.client);
  gapiInited = true;
  maybeEnableButtons();
}

function handleAuthClick() {
  gapiLoaded();
  gisLoaded();
  console.log(tokenClient);
  tokenClient.callback = async (resp: any) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    // document.getElementById("signout_button")!.style.visibility = "visible";
    // document.getElementById("authorize_button")!.innerText = "Refresh";
    await listMajors();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}
export function Authorize() {
  return <Button onClick={() => handleAuthClick()}>Authorize</Button>;
}
