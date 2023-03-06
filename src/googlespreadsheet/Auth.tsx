import * as React from "react";
import { TextField, Button } from "@mui/material";
import { SheetClient } from "./client";
import { StateTable } from "./StateTable";
import { DbClient } from "../indexeddb/client";

const defaultSheetId = localStorage.getItem("spreadsheet_id") || "";

export function Authorize() {
  console.log("Render authorize");

  const client = new SheetClient();

  const [hasConsent, setHasConsent] = React.useState(false);
  const [sheetId, setSheetId] = React.useState(defaultSheetId);
  const [sheetName, setSheetName] = React.useState("");
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    console.log("1");

    async function authenticate() {
      await client.authenticate();
      console.log("112323");

      setHasConsent(!!client.getToken());
      console.log("23", client.getToken());
    }

    authenticate();
  }, []);

  return (
    <div>
      <p></p>
      <TextField
        label="id"
        helperText={`Spreadsheet Name: ${sheetName}`}
        variant="outlined"
        fullWidth
        defaultValue={defaultSheetId}
        onChange={(event) => {
          setSheetId(event.target.value);
          localStorage.setItem("spreadsheet_id", event.target.value);
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          client.requestConsent(() => {
            setHasConsent(!!client.getToken());
          });
        }}
        fullWidth
        disabled={hasConsent}
      >
        Authorize
      </Button>
      <Button
        variant="contained"
        fullWidth
        onClick={async () => {
          const dbClient = new DbClient();
          await dbClient.connect();
          await client.saveState(sheetId, dbClient);
        }}
        disabled={!hasConsent || !sheetId}
      >
        Save State
      </Button>
      <Button
        variant="contained"
        fullWidth
        onClick={async () => {
          const info = await client.getName(sheetId);
          setSheetName(info?.properties?.title || "");
          const rows = await client.getRows(sheetId);
          setRows(rows);
        }}
        disabled={!hasConsent || !sheetId}
      >
        List Majors
      </Button>
      <StateTable rows={rows} />
    </div>
  );
}
