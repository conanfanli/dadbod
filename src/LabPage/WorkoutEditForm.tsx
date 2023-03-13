import * as React from "react";
import { Box, TextField } from "@mui/material";
import { IWorkout, WithId } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { getEventService } from "../indexeddb/service";
import { useParams } from "react-router-dom";
import { getIsoDate } from "../util";
import { ExercisePickList } from "./ExercisePickList";

export function WorkoutEditForm() {
  const { workoutId } = useParams();
  const service = React.useMemo(() => getEventService(), []);

  const results = useLiveQuery<Array<WithId<IWorkout>>>(
    () => service.getWorkouts(workoutId || ""),
    [service]
  );

  const workout =
    results && results.length > 0
      ? results[0]
      : {
          id: workoutId,
          date: getIsoDate(),
          name: "",
          description: "",
          exerciseIds: [],
        };

  function onPatch(name: string, value: string) {
    service.updateWorkout({
      ...(workout as WithId<IWorkout>),
      [name]: value,
    });
  }
  return (
    <Box noValidate component="form">
      <div>
        <Field name="date" value={workout.date} onPatch={onPatch} />
        <Field name="name" value={workout.name} onPatch={onPatch} />
        <Field
          name="description"
          value={workout.description}
          onPatch={onPatch}
        />
        <ExercisePickList />
      </div>
    </Box>
  );
}

function Field({
  name,
  value,
  onPatch,
}: {
  value: string;
  name: string;
  onPatch: (name: string, value: string) => void;
}) {
  return (
    <TextField
      onChange={(e) => {
        onPatch(name, e.target.value);
      }}
      fullWidth
      value={value}
      required
      helperText={name}
    />
  );
}
