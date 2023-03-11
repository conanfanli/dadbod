import AddIcon from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import { ExerciseSet } from "./ExerciseSet";
import { Collapse, IconButton, ListItem, ListItemIcon } from "@mui/material";
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
        return <ExerciseSet key={s.setNumber} set={s} updateSet={updateSet} />;
      })}
      {showNewRow ? (
        <ExerciseSet
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
