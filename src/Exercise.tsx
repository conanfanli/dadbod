import { ListItemText, List, ListItem, ListItemButton } from "@mui/material";
import * as React from "react";
import { DbClient } from "./indexeddb/client";
import { AddExerciseForm } from "./AddExerciseForm";

interface IExercise {
  name: string;
  description: string;
}

export function Exercises() {
  const [client, setClient] = React.useState<DbClient | null>(null);
  React.useEffect(() => {
    new DbClient((c) => setClient(c));
    // const rows = client.listExercises();
    // console.log(rows);
    // setRows(rows);
  });
  if (!client) return <div></div>;

  return (
    <div>
      <AddExerciseForm
        onSubmit={(data) => {
          client.addExercise(data);
        }}
      />
      <ExerciseList client={client} />
    </div>
  );
}

function ExerciseList({ client }) {
  const [rows, setRows] = React.useState<Array<IExercise>>([]);
  React.useEffect(() => {
    client.listExercises((rows) => setRows(rows));
  });
  return (
    <List>
      {rows.map((row) => (
        <ListItem key={row.name} disablePadding>
          <ListItemButton>
            <ListItemText key={row.name} primary={row.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
