import * as React from "react";
import CloudOff from "@mui/icons-material/CloudOff";
import { getEventService } from "./indexeddb/service";
import CloudSync from "@mui/icons-material/CloudSync";
import PublishedWithChanges from "@mui/icons-material/PublishedWithChanges";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

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
  console.log("render bottom");
  const service = React.useMemo(() => getEventService(), []);
  const [connected, setConnected] = React.useState("");

  const navigate = useNavigate();

  const stateDiff = useLiveQuery(() => service.getStateDiff(), [service]) || 0;

  React.useEffect(() => {
    const fetchData = async () => {
      const connectedSheetName = await service.getConnectedSheetName();
      setConnected(connectedSheetName);
    };

    fetchData();
  }, [service]);

  return (
    <Paper
      sx={{ position: "fixed", bottom: 1, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation showLabels>
        <BottomNavigationAction
          label={connected ? `${connected}` : "offline"}
          icon={
            connected ? (
              <PublishedWithChanges color="success" />
            ) : (
              <CloudOff
                color="error"
                onClick={() => navigate("/spreadsheet/authorize")}
              />
            )
          }
        ></BottomNavigationAction>
        <BottomNavigationAction
          label={getStateDiffLabel(stateDiff)}
          icon={<CloudSync color="primary" />}
          onClick={async () => {
            await service.syncState();
            window.location.reload();
          }}
        ></BottomNavigationAction>
      </BottomNavigation>
    </Paper>
  );
}
