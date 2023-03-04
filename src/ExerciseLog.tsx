import Remove from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {
  Collapse,
  Box,
  TextField,
  ListItem,
  ListItemIcon,
  Button,
} from "@mui/material";
import React from "react";
import type { IExercise, ISet } from "./types";
import { DbClient } from "./indexeddb/client";

const today = new Date().toISOString().slice(0, 10);

export function ExerciseLog({
  row,
  open,
  client,
}: {
  client: DbClient;
  row: IExercise;
  open: boolean;
}) {
  const [sets, setSets] = React.useState<ISet[]>([]);

  function onSubmit() {
    client.logExercise({
      date: today,
      exerciseName: row.name,
      sets: sets,
    });
  }
  const setsWithNewRow =
    sets.length === 0 ? [{ setNumber: 1, weight: 0, reps: 0 }] : sets;
  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      {setsWithNewRow.map((s, index) => {
        return (
          <SetEntry
            key={index}
            setNumber={index + 1}
            putSet={(newSet: ISet) => {
              const newSets = setsWithNewRow.map((s, i) => {
                return i === index ? newSet : s;
              });
              return setSets(newSets);
            }}
          />
        );
      })}
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
        <Button variant="contained" onClick={onSubmit}>
          Log
        </Button>
        <ListItemIcon>
          <Remove color="error" />
        </ListItemIcon>
      </ListItem>
    </Collapse>
  );
}

function SetEntry({
  setNumber,
  putSet,
}: {
  setNumber: number;
  putSet: (arg0: ISet) => void;
}) {
  const [weight, setWeight] = React.useState(0);
  const [reps, setReps] = React.useState(0);

  return (
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
          onChange={(e) => {
            setReps(Number(e.target.value));
            putSet({ setNumber, weight, reps: Number(e.target.value) });
          }}
          size="small"
        />
      </div>
    </Box>
  );
}
