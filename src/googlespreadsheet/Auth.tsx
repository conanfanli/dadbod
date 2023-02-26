import * as React from "react";
import { Button } from "@mui/material";
import { SheetClient } from "./client";

export function Authorize() {
  const [hasConsent, setHasConsent] = React.useState(false);

  React.useEffect(() => {
    const client = SheetClient.getInstance();
    client.initialize();
    setHasConsent(!!client.getToken());
  });

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {
          SheetClient.getInstance().requestConsent(() => {
            setHasConsent(true);
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
        onClick={() => {
          SheetClient.getInstance().listMajors();
        }}
        disabled={!hasConsent}
      >
        List Majors
      </Button>
    </div>
  );
}
