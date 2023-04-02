import { Box, TextField } from "@mui/material";
import React from "react";
import type { ISet } from "../types";

export function ExerciseSet({
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
