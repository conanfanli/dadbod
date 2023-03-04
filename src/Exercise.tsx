import {
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  IconButton,
} from "@mui/material";
import * as React from "react";
import { DbClient } from "./indexeddb/client";
import { AddExerciseForm } from "./AddExerciseForm";
import Delete from "@mui/icons-material/Delete";
import {ExerciseLog} from './ExerciseLog'
import { IExercise } from "./types";



export function Exercises() {
  const [client, setClient] = React.useState<DbClient | null>(null);

  React.useEffect(() => {
    new DbClient((c) => setClient(c));
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

function ExerciseList({ client }: { client: DbClient }) {
  const [rows, setRows] = React.useState<Array<IExercise>>([]);
  const [active, setActive] = React.useState("");

  React.useEffect(() => {
    client.listExercises((rows) => setRows(rows));
  });

  return (
    <List sx={{ width: "100%" }}>
      {rows.map((row) => [
        <ListItem key={row.name} disablePadding>
          <ListItemButton onClick={() => setActive(row.name)}>
            <ListItemText key={row.name} primary={row.name} />
            <IconButton
              onClick={() =>
                client.deleteExercise(row.name, () =>
                  setRows(rows.filter((r) => r.name !== row.name))
                )
              }
            >
              <Delete color="secondary" />
            </IconButton>
          </ListItemButton>
        </ListItem>,
        <ExerciseLog
          client={client}
          open={active === row.name}
          key={`${row.name}-collapse`}
          row={row}
        />,
      ])}
    </List>
  );
}