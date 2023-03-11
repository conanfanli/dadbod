import Delete from "@mui/icons-material/Delete";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { ExerciseLog } from "./ExerciseLog";
import { getEventService } from "../indexeddb/service";
import { useLiveQuery } from "dexie-react-hooks";

export function ExerciseList() {
  const [active, setActive] = React.useState("");

  const service = React.useMemo(() => getEventService(), []);
  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  return (
    <List sx={{ width: "100%", mb: "3ch" }}>
      {exercises.map((row, index) => [
        <ListItem key={row.id} disablePadding>
          <ListItemButton onClick={() => setActive(row.id)}>
            <ListItemText
              key={row.id}
              primary={row.name}
              secondary={row.description}
            />
            <IconButton onClick={() => service.deleteExercise(row.id)}>
              <Delete color="secondary" />
            </IconButton>
          </ListItemButton>
        </ListItem>,
        active === row.id ? <ExerciseLog key={index} row={row} /> : null,
      ])}
    </List>
  );
}
