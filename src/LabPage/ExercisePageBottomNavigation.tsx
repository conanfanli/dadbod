import * as React from "react";
import CloudOff from "@mui/icons-material/CloudOff";
import { getEventService } from "../indexeddb/service";
import CloudSync from "@mui/icons-material/CloudSync";
import PublishedWithChanges from "@mui/icons-material/PublishedWithChanges";
import { Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { IEventService } from "../indexeddb/service";

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

export function ExercisePageBottomNavigation() {
  console.log("render bottom navigation");
  const service = React.useMemo(() => getEventService(), []);

  return (
    <Paper
      sx={{ position: "fixed", bottom: 1, left: 0, right: 0 }}
      elevation={3}
    >
      <SheetConnectionStatus eventService={service} />
    </Paper>
  );
}

function SheetConnectionStatus({
  eventService,
}: {
  eventService: IEventService;
}) {
  console.log("render sheet connection");
  const [connected, setConnected] = React.useState("");
  const stateDiff =
    useLiveQuery(async () => eventService.getStateDiff(), [eventService]) || 0;

  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      const connectedSheetName = await eventService.getConnectedSheetName();
      console.log("sheet name is", connectedSheetName);
      setConnected(connectedSheetName);
    };

    fetchData();
  }, [eventService]);

  console.log(222, connected);
  return (
    <div>
      <Button
        endIcon={
          connected ? (
            <PublishedWithChanges color="success" />
          ) : (
            <CloudOff
              color="error"
              onClick={() => navigate("/spreadsheet/authorize")}
            />
          )
        }
      >
        {`${connected ? `${connected}` : "offline"}`}
      </Button>
      {connected ? (
        <Button
          endIcon={<CloudSync color="primary" />}
          onClick={async () => {
            await eventService.syncState();
            window.location.reload();
          }}
        >
          {getStateDiffLabel(stateDiff)}
        </Button>
      ) : null}
    </div>
  );
}
