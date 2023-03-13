import * as React from "react";
import { Box, TextField } from "@mui/material";
import { IExercise, WithId } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { getEventService } from "../indexeddb/service";
import { useParams } from "react-router-dom";

export function ExerciseEditForm({ exerciseId }: { exerciseId?: string }) {
  const { id } = useParams();
  const service = React.useMemo(() => getEventService(), []);

  const exercise = useLiveQuery<WithId<IExercise>>(
    () => service.getExercise(id || ""),
    [service]
  );

  if (!exercise) {
    return <div>cannot find exercise</div>;
  }
  return (
    <Box noValidate component="form">
      <div>
        <TextField
          error={exercise.name === ""}
          onChange={(e) => {
            service.updateExercise({
              ...exercise,
              name: e.target.value,
            });
          }}
          variant="filled"
          value={exercise.name}
          fullWidth
          required
          helperText="Name"
        />
        <TextField
          onChange={(e) => {
            service.updateExercise({
              ...exercise,
              description: e.target.value,
            });
          }}
          fullWidth
          variant="filled"
          value={exercise.description}
          required
          helperText="Description"
        />
      </div>
    </Box>
  );
}
