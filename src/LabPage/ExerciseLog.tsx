import AddIcon from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import {
  Box,
  Collapse,
  IconButton,
  ListItem,
  ListItemIcon,
  TextField,
} from "@mui/material";
import React from "react";
import { getEventService } from "../indexeddb/service";
import type { IExercise, ISet, WithId } from "../types";
import { useLiveQuery } from "dexie-react-hooks";

const today = new Date().toLocaleDateString();

export function ExerciseLog({ row }: { row: WithId<IExercise> }) {
  console.log("render exercise log ...");
  const service = React.useMemo(() => getEventService(), []);
  const [showNewRow, setShowNewRow] = React.useState(false);

  const sets =
    useLiveQuery(async () => {
      const items = await service.getExerciseSets({
        date: today,
        exerciseId: row.id,
      });
      return items.length > 0 ? items[items.length - 1].sets : [];
    }, [service]) || [];

  function updateSet(newSet: ISet) {
    let isNew = true;
    let newSets = sets.map((s, i) => {
      if (i === newSet.setNumber - 1) {
        isNew = false;
        return newSet;
      }
      return s;
    });

    if (isNew) {
      newSets = [...newSets, newSet];
      setShowNewRow(false);
    }

    service.logExercise({
      date: today,
      exerciseId: row.id,
      sets: newSets,
    });
  }

  return (
    <Collapse in={true}>
      {sets.map((s) => {
        return <SetEntry key={s.setNumber} set={s} updateSet={updateSet} />;
      })}
      {showNewRow ? (
        <SetEntry
          key={sets.length + 1}
          set={{ setNumber: sets.length + 1, weight: 0, reps: 0 }}
          updateSet={updateSet}
        />
      ) : null}
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
              setShowNewRow(true);
            }}
            disabled={false}
          >
            <AddIcon color={showNewRow ? "disabled" : "primary"} />
          </IconButton>
        </ListItemIcon>
        <ListItemIcon>
          <IconButton
            disabled={!sets || sets.length === 0}
            onClick={() => {
              const newSets = sets.slice(0, sets.length - 1);
              service.logExercise({
                date: today,
                exerciseId: row.id,
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
  updateSet,
}: {
  set: ISet;
  updateSet: (newSet: ISet) => void;
}) {
  function onWeightChange(e) {
    const weight = Number(e.target.value);
    updateSet({
      setNumber: set.setNumber,
      reps: set.reps,
      weight,
    });
  }
  function onRepsChange(e) {
    const reps = Number(e.target.value);
    if (reps) {
      updateSet({ setNumber: set.setNumber, weight: set.weight, reps });
    }
  }
  const isNew = set.reps === 0 && set.weight === 0;
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
          focused={isNew ? true : false}
          color={isNew ? "primary" : "success"}
          value={set.weight || ""}
          onChange={onWeightChange}
          inputProps={{ inputMode: "numeric" }}
          size="small"
          sx={{ m: 1, width: "36%" }}
        />
        <TextField
          inputProps={{ inputMode: "numeric" }}
          color={isNew ? "primary" : "success"}
          focused={isNew ? true : false}
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
