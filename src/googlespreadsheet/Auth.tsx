import * as React from "react";
import { TextField, Button } from "@mui/material";
import { getSheetClient } from "./client";
import { StateTable } from "./StateTable";
import { DbClient } from "../indexeddb/client";
import { getSheetService } from "./service";

const defaultSheetId = localStorage.getItem("spreadsheet_id") || "";

export function Authorize() {
  console.log("Render authorize");

  const client = getSheetClient();
  const sheetService = getSheetService();

  const [hasConsent, setHasConsent] = React.useState(false);
  const [sheetId, setSheetId] = React.useState(defaultSheetId);
  const [sheetName, setSheetName] = React.useState("");
  const [rows, setRows] = React.useState<[string, string][]>([]);

  React.useEffect(() => {
    async function authenticate() {
      await client.authenticate();

      setHasConsent(!!client.getToken());
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
        onClick={async () => {
          await sheetService.promptConcent();
          setHasConsent(!!client.getToken());
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
          await client.saveState(
            sheetId,
            JSON.stringify(await dbClient.getState())
          );
        }}
        disabled={!hasConsent || !sheetId}
      >
        Save State
      </Button>
      <Button
        variant="contained"
        fullWidth
        onClick={async () => {
          setSheetName(await sheetService.getSheetName(sheetId));
          const rows = (await sheetService.getRows(sheetId)) || [];
          setRows(rows);
        }}
        disabled={!hasConsent || !sheetId}
      >
        List Rows
      </Button>
      <StateTable rows={rows} />
    </div>
  );
}
