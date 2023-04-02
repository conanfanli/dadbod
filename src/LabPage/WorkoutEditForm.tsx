import * as React from "react";
import Edit from "@mui/icons-material/Edit";
import Save from "@mui/icons-material/Save";
import { ExerciseLog } from "./ExerciseLog";
import { Box, Card, CardHeader, IconButton } from "@mui/material";
import { IExercise, IWorkout, WithId } from "../types";
import { DebouncedTextField as Field } from "../DebouncedTextField";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { getEventService, IEventService } from "../indexeddb/service";
import { useParams } from "react-router-dom";
import { getIsoDate } from "../util";
import { ExercisePickList } from "./ExercisePickList";
import { ExerciseListItem } from "./ExerciseList";

/*
 * Display a single workouts
 */
export function WorkoutPage() {
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
  return <WorkoutDetail workoutId={workoutId} service={service} />;
}

function LogMode({ workout }: { workout: WithId<IWorkout> }) {
  const service = React.useMemo(() => getEventService(), []);
  const [expand, setExpand] = React.useState("");

  const exercises =
    useLiveQuery<Array<WithId<IExercise>>>(
      () => service.listExercises(workout.exerciseIds),
      [service, workout]
    ) || [];
  return (
    <>
      {exercises.map((ex) => {
        return [
          <ExerciseListItem
            exercise={ex}
            setExpand={setExpand}
            key={ex.id}
            editable={false}
          />,
          expand === ex.id ? (
            <ExerciseLog key={`${ex.id}-log`} exercise={ex} />
          ) : null,
        ];
      })}
    </>
  );
}

function WorkoutDetail({
  service,
  workoutId,
}: {
  service: IEventService;
  workoutId: string;
}) {
  const [editMode, setEditMode] = React.useState(false);
  const workouts = useLiveQuery<Array<WithId<IWorkout>>>(
    () => service.getWorkouts(workoutId),
    [service, workoutId]
  );

  if (!workouts || workouts.length === 0) {
    return <div>oops, not found</div>;
  }
  const workout: WithId<IWorkout> = workouts[0];

  return (
    <>
      <Card>
        <CardHeader
          title={workout.name}
          subheader={workout.description}
          action={
            <IconButton onClick={() => setEditMode(!editMode)}>
              {editMode ? <Save color="primary" /> : <Edit color="primary" />}
            </IconButton>
          }
        />
      </Card>
      {editMode ? (
        <Form workout={workout} service={service} />
      ) : (
        <LogMode workout={workout} />
      )}
    </>
  );
}

function Form({ workout, service }) {
  function onPatch(name: string, value: string) {
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
      <Field name="date" value={workout.date} onPatch={onPatch} />
      <Field name="name" value={workout.name} onPatch={onPatch} />
      <Field name="description" value={workout.description} onPatch={onPatch} />
      <ExercisePickList picked={workout.exerciseIds} onPick={onPickExercise} />
    </Box>
  );
}
