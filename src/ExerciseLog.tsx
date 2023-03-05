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
}: // client,
{
  //client: DbClient;
  row: IExercise;
}) {
  const [sets, setSets] = React.useState<ISet[]>([]);
  /*
  React.useEffect(() => {
    client.listLogs((rows) => {
      console.log(rows);
      setSets(rows);
    });
  }); */

  function putSet(newSet: ISet) {
    const newSets = setsWithNewRow.map((s, i) => {
      return i === newSet.setNumber - 1 ? newSet : s;
    });
    setSets(newSets);
    /*
    client.logExercise({
      date: today,
      exerciseName: row.name,
      sets: newSets,
    }); */
  }

  const setsWithNewRow =
    sets.length === 0 ? [{ setNumber: 1, weight: 0, reps: 0 }] : sets;
  return (
    <Collapse in={true}>
      {setsWithNewRow.map((s, index) => {
        return <SetEntry key={index} setNumber={index + 1} putSet={putSet} />;
      })}
      <ListItem
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pr: 0,
        }}
      >
        <ListItemIcon>
          <AddIcon
            color="primary"
            onClick={() => {
              setSets([...sets, { setNumber: 1, weight: 0, reps: 0 }]);
            }}
          />
        </ListItemIcon>
        <ListItemIcon>
          <Remove
            color="error"
            onClick={() => {
              setSets(sets.slice(0, sets.length - 1));
            }}
          />
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
  putSet: (newSet: ISet) => void;
}) {
  const [weight, setWeight] = React.useState(0);
  const [reps, setReps] = React.useState(0);

  function onWeightChange(e) {
    setWeight(Number(e.target.value));
    if (reps) {
      putSet({ setNumber, reps, weight: Number(e.target.value) });
    }
  }
  function onRepsChange(e) {
    const value = Number(e.target.value);
    setReps(value);
    if (value) {
      putSet({ setNumber, weight, reps: value });
    }
  }
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
          value={weight || ""}
          onChange={onWeightChange}
          inputProps={{ inputMode: "numeric" }}
          size="small"
          sx={{ m: 1, width: "36%" }}
        />
        <TextField
          inputProps={{ inputMode: "numeric" }}
          value={reps || ""}
          label="Reps"
          error={reps === 0}
          sx={{ m: 1, width: "36%" }}
          onChange={onRepsChange}
          size="small"
        />
      </div>
    </Box>
  );
}
