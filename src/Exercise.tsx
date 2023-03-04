import {
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Collapse,
  Box,
  TextField,
  ListItemIcon,
} from "@mui/material";
import * as React from "react";
import { DbClient } from "./indexeddb/client";
import { AddExerciseForm } from "./AddExerciseForm";
import Remove from "@mui/icons-material/Remove";
import Delete from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface IExercise {
  name: string;
  description: string;
}

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
        <LogEntry
          open={active === row.name}
          key={`${row.name}-collapse`}
          row={row}
        />,
      ])}
    </List>
  );
}

function LogEntry({ row, open }: { row: IExercise; open: boolean }) {
  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <div>
          <TextField
            label="set"
            sx={{ m: 1, width: "10%" }}
            value={1}
            disabled
            size="small"
          />
          <TextField label="Weight" size="small" sx={{ m: 1, width: "36%" }} />
          <TextField label="Reps" sx={{ m: 1, width: "36%" }} size="small" />
        </div>
      </Box>
      <ListItem
        secondaryAction={
          <IconButton>
            <Remove color="error" />
          </IconButton>
        }
      >
        <ListItemIcon>
          <AddIcon color="primary" />
        </ListItemIcon>
      </ListItem>
    </Collapse>
  );
}
