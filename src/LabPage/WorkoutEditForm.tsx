import * as React from "react";
import { Box } from "@mui/material";
import { IWorkout, WithId } from "../types";
import { DebouncedTextField as Field } from "../DebouncedTextField";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { getEventService, IEventService } from "../indexeddb/service";
import { useParams } from "react-router-dom";
import { getIsoDate } from "../util";
import { ExercisePickList } from "./ExercisePickList";

export function WorkoutEditForm() {
  const { workoutId } = useParams();
  const service = React.useMemo(() => getEventService(), []);

  if (!workoutId) {
    return <div>oops, invalid workout id</div>;
  }
  if (workoutId === "new") {
    const id = uuidv4();
    return (
      <Form
        workout={{
          id,
          date: getIsoDate(),
          name: "",
          description: "",
          exerciseIds: [],
        }}
        service={service}
      />
    );
  }
  return <EditForm workoutId={workoutId} service={service} />;
}

function EditForm({
  service,
  workoutId,
}: {
  service: IEventService;
  workoutId: string;
}) {
  const results = useLiveQuery<Array<WithId<IWorkout>>>(
    () => service.getWorkouts(workoutId),
    [service, workoutId]
  );

  if (!results || results.length === 0) {
    return <div>oops, not found</div>;
  }
  const workout: WithId<IWorkout> = results[0];

  return <Form workout={workout} service={service} />;
}

function Form({ workout, service }) {
  function onPatch(name: string, value: string) {
    console.log(name, value, workout);
    service.updateWorkout({
      ...workout,
      [name]: value,
    });
  }

  function onPickExercise(exerciseId: string) {
    const currentIndex = workout.exerciseIds.indexOf(exerciseId);
    const newChecked = [...workout.exerciseIds];

    if (currentIndex === -1) {
      newChecked.push(exerciseId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    service.updateWorkout({
      ...(workout as WithId<IWorkout>),
      exerciseIds: newChecked,
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
        <ExercisePickList
          picked={workout.exerciseIds}
          onPick={onPickExercise}
        />
      </div>
    </Box>
  );
}
