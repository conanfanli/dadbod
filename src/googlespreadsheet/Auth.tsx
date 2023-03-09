import * as React from "react";
import { TextField, Button } from "@mui/material";
import { StateTable } from "./StateTable";
import { getSheetService } from "./service";
import { getEventService } from "../indexeddb/service";

const defaultSheetId = localStorage.getItem("spreadsheet_id") || "";

export function Authorize() {
  console.log("Render authorize");

  const sheetService = React.useMemo(() => getSheetService(), []);

  const [hasConsent, setHasConsent] = React.useState(false);
  const [sheetId, setSheetId] = React.useState(sheetService.sheetId);
  const [sheetName, setSheetName] = React.useState("");
  const [rows, setRows] = React.useState<[string, string][]>([]);

  React.useEffect(() => {
    async function authenticate() {
      setHasConsent(await sheetService.hasConsent());
      setSheetName(await sheetService.getSheetName());
    }

    authenticate();
  }, [sheetId, sheetService]);

  return (
    <div>
      <p></p>
      <TextField
        label="id"
        helperText={`Spreadsheet Name: ${sheetName}`}
        variant="outlined"
        fullWidth
        defaultValue={sheetService.sheetId}
        onChange={(event) => {
          setSheetId(event.target.value);
          localStorage.setItem("spreadsheet_id", event.target.value);
        }}
      />
      <Button
        variant="contained"
        onClick={async () => {
          await sheetService.promptConcent();
          setHasConsent(await sheetService.hasConsent());
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
          const service = getEventService();
          await sheetService.saveState(
            JSON.stringify(await service.getState())
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
          setSheetName(await sheetService.getSheetName());
          const rows = (await sheetService.getRows()) || [];
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
