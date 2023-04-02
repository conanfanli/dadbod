import * as React from "react";
import { Box } from "@mui/material";
import { DebouncedTextField as Field } from "../DebouncedTextField";
import { IExercise, WithId } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { getEventService } from "../indexeddb/service";
import { useParams } from "react-router-dom";

export function ExerciseEditForm() {
  const { exerciseId } = useParams();
  const service = React.useMemo(() => getEventService(), []);

  const exercise = useLiveQuery<WithId<IExercise>>(
    () => service.getExercise(exerciseId || ""),
    [service]
  );

  if (!exercise) {
    return <div>cannot find exercise</div>;
  }

  function onPatch(name: string, value: string) {
    service.updateExercise({
      ...(exercise as WithId<IExercise>),
      [name]: value,
    });
  }
  return (
    <Box noValidate component="form">
      <div>
        <Field name="name" value={exercise.name} onPatch={onPatch} />
        <Field
          name="description"
          value={exercise.description}
          onPatch={onPatch}
        />
        <Field
          name="oneRepMax"
          value={exercise.oneRepMax || ""}
          onPatch={onPatch}
        />
      </div>
    </Box>
  );
}
