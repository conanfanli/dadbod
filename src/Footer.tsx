import CloudOff from "@mui/icons-material/CloudOff";
import CloudSync from "@mui/icons-material/CloudSync";
import PublishedWithChanges from "@mui/icons-material/PublishedWithChanges";
import { Button, Paper } from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getEventService, IEventService } from "./indexeddb/service";
import { BackButton } from "./BackButton";

export function Footer() {
  console.log("render bottom navigation");
  const [connected, setConnected] = React.useState("");

  const eventService = React.useMemo(() => getEventService(), []);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      const connectedSheetName = await eventService.getConnectedSheetName();
      console.log("sheet name is", connectedSheetName);
      setConnected(connectedSheetName);
    };

    fetchData();
  }, [eventService]);

  return (
    <Paper
      sx={{ position: "fixed", bottom: 1, left: 0, right: 0 }}
      elevation={3}
    >
      <BackButton />
      <Button
        onClick={() => navigate("/spreadsheet/authorize")}
        endIcon={
          connected ? (
            <PublishedWithChanges color="success" />
          ) : (
            <CloudOff color="error" />
          )
        }
      >
        {`${connected ? `${connected}` : "offline"}`}
      </Button>
      {connected ? <SyncButton eventService={eventService} /> : null}
    </Paper>
  );
}

function SyncButton({ eventService }: { eventService: IEventService }) {
  console.log("render sheet connection");
  const stateDiff =
    useLiveQuery(async () => eventService.getStateDiff(), [eventService]) || 0;

  return (
    <Button
      endIcon={<CloudSync color="primary" />}
      onClick={async () => {
        await eventService.syncState();
        // window.location.reload();
      }}
    >
      {getStateDiffLabel(stateDiff)}
    </Button>
  );
}

function getStateDiffLabel(diffInMs: number): string {
  if (!diffInMs) {
    return "in sync";
  }

  const minutes = diffInMs / 1000 / 60;
  if (minutes < 60) {
    return `${Number(minutes).toFixed(0)} minutes`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Number(hours).toFixed(0)} hours`;
  }
  return `${Number(hours / 24).toFixed(0)} days`;
}
