import * as React from "react";
import { TextField, Button } from "@mui/material";
import { SheetClient } from "./client";
import { StateTable } from "./StateTable";

const defaultSheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
export function Authorize() {
  let client: SheetClient;
  const [hasConsent, setHasConsent] = React.useState(false);
  const [sheetId, setSheetId] = React.useState(defaultSheetId);
  const [sheetName, setSheetName] = React.useState("");
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    client = new SheetClient();
    client.initialize();
    setHasConsent(!!client.getToken());
  });

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
        }}
      />
      <Button
        variant="contained"
        onClick={() => {
          SheetClient.getInstance().requestConsent(() => {
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
