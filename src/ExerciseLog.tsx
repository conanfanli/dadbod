import Remove from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import {
  Collapse,
  Box,
  TextField,
  ListItem,
  ListItemIcon,
  Button,
  IconButton,
} from "@mui/material";
import React from "react";
import type { IExercise, ISet } from "./types";
import { DbClient } from "./indexeddb/client";

const today = new Date().toLocaleDateString();

export function ExerciseLog({ row }: { row: IExercise }) {
  const client = new DbClient();

  const [sets, setSets] = React.useState<ISet[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const logs = await client.listLogs();
      setSets(logs.find((log) => log.exerciseName === row.name)?.sets || []);
    }
    fetchData();
  }, []);

  const setsWithNewRow =
    sets.length === 0 ? [{ setNumber: 1, weight: 0, reps: 0 }] : sets;

  function putSet(newSet: ISet) {
    const newSets = setsWithNewRow.map((s, i) => {
      return i === newSet.setNumber - 1 ? newSet : s;
    });
    setSets(newSets);

    client.logExercise({
      date: today,
      exerciseName: row.name,
      sets: newSets,
    });
  }
  const canAddRow = sets.length !== 0 && sets[sets.length - 1].reps !== 0;

  return (
    <Collapse in={true}>
      {setsWithNewRow.map((s, index) => {
        return <SetEntry key={s.setNumber} set={s} putSet={putSet} />;
      })}
      <ListItem
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pr: 0,
        }}
      >
        <ListItemIcon>
          <IconButton
            onClick={() => {
              setSets([
                ...sets,
                { setNumber: sets.length + 1, weight: 0, reps: 0 },
              ]);
            }}
            disabled={!canAddRow}
          >
            <AddIcon color={canAddRow ? "primary" : "disabled"} />
          </IconButton>
        </ListItemIcon>
        <ListItemIcon>
          <IconButton
            disabled={!sets || sets.length === 0}
            onClick={() => {
              const newSets = sets.slice(0, sets.length - 1);
              setSets(newSets);
              client.logExercise({
                date: today,
                exerciseName: row.name,
                sets: newSets,
              });
            }}
          >
            <Remove color={sets.length === 0 ? "disabled" : "error"} />
          </IconButton>
        </ListItemIcon>
      </ListItem>
    </Collapse>
  );
}

function SetEntry({
  set,
  putSet,
}: {
  set: ISet;
  putSet: (newSet: ISet) => void;
}) {
  function onWeightChange(e) {
    const weight = Number(e.target.value);
    putSet({
      setNumber: set.setNumber,
      reps: set.reps,
      weight,
    });
  }
  function onRepsChange(e) {
    const reps = Number(e.target.value);
    if (reps) {
      putSet({ setNumber: set.setNumber, weight: set.weight, reps });
    }
  }
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      <div>
        <TextField
          label="set"
          sx={{ m: 1, width: "10%" }}
          value={set.setNumber}
          disabled
          size="small"
        />
        <TextField
          label="Weight"
          value={set.weight || ""}
          onChange={onWeightChange}
          inputProps={{ inputMode: "numeric" }}
          size="small"
          sx={{ m: 1, width: "36%" }}
        />
        <TextField
          inputProps={{ inputMode: "numeric" }}
          value={set.reps || ""}
          label="Reps"
          error={set.reps === 0}
          sx={{ m: 1, width: "36%" }}
          onChange={onRepsChange}
          size="small"
        />
      </div>
    </Box>
  );
}
