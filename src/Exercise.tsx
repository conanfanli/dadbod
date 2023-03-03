import { ListItemText, List, ListItem, ListItemButton } from "@mui/material";
import * as React from "react";
import { DbClient } from "./indexeddb/client";
import { AddExerciseForm } from "./AddExerciseForm";

export function Exercises() {
  let client;
  React.useEffect(() => {
    client = new DbClient();
  });
  return (
    <div>
      <AddExerciseForm
        onSubmit={(data) => {
          client.addExercise(data);
        }}
      />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => client.addExercise()}>
            <ListItemText primary="hi" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
}
