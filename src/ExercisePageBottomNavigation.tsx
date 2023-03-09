import * as React from "react";
import CloudOff from "@mui/icons-material/CloudOff";
import { getEventService } from "./indexeddb/service";
import CloudSync from "@mui/icons-material/CloudSync";
import PublishedWithChanges from "@mui/icons-material/PublishedWithChanges";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
export function ExercisePageBottomNavigation() {
  console.log("render bottom");
  const service = React.useMemo(() => getEventService(), []);
  const [connected, setConnected] = React.useState("");

  const navigate = useNavigate();

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
          label="last synced"
          icon={<CloudSync color="primary" />}
          onClick={() => service.syncState()}
        ></BottomNavigationAction>
      </BottomNavigation>
    </Paper>
  );
}
