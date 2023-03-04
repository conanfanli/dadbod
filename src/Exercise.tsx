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
  Button,
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
  const [weight, setWeight] = React.useState(0);
  const [reps, setReps] = React.useState(0);

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
          <TextField
            label="Weight"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            inputProps={{ inputMode: "numeric" }}
            size="small"
            sx={{ m: 1, width: "36%" }}
          />
          <TextField
            inputProps={{ inputMode: "numeric" }}
            value={reps}
            label="Reps"
            sx={{ m: 1, width: "36%" }}
            onChange={(e) => setReps}
            size="small"
          />
        </div>
      </Box>
      <ListItem
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pr: 0,
        }}
      >
        <ListItemIcon>
          <AddIcon color="primary" />
        </ListItemIcon>
        <Button variant="contained">Log</Button>
        <ListItemIcon>
          <Remove color="error" />
        </ListItemIcon>
      </ListItem>
    </Collapse>
  );
}
