import * as React from "react";
import { Button } from "@mui/material";
import { SheetClient } from "./client";

/*
declare var google: any;
declare var gapi: any;
let tokenClient: any;
let gapiInited = false;
let gisInited = false;
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";


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
 */

function handleAuthClick() {
  const client = new SheetClient(
    "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
  );
  client.connect();
  client.requestConsent();
}
export function Authorize() {
  return <Button onClick={() => handleAuthClick()}>Authorize</Button>;
}
