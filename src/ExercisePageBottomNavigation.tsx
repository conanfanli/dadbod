import * as React from "react";
import CloudOff from "@mui/icons-material/CloudOff";
import CloudSync from "@mui/icons-material/CloudSync";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
export function ExercisePageBottomNavigation() {
  const [value, setValue] = React.useState();
  const [connected, setConnected] = React.useState();
  return (
    <Paper
      sx={{ position: "fixed", bottom: 1, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, v) => setValue(v)}
      >
        <BottomNavigationAction
          label={connected ? "connected" : "offline"}
          icon={connected ? <CloudSync /> : <CloudOff />}
        ></BottomNavigationAction>
        <BottomNavigationAction label="last synced"></BottomNavigationAction>
      </BottomNavigation>
    </Paper>
  );
}
