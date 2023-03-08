import Delete from "@mui/icons-material/Delete";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { AddExerciseForm } from "./AddExerciseForm";
import { ExerciseLog } from "./ExerciseLog";
import { WithKey, IExercise } from "./types";
import { getEventService } from "./indexeddb/service";

export function Exercises() {
  const service = React.useMemo(() => getEventService(), []);
  const [exercises, setExercises] = React.useState<Array<WithKey<IExercise>>>(
    []
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const exercises = await service.listExercises();
      setExercises(exercises);
    };
    fetchData();
  }, [service]);

  async function deleteExercise(name: string) {
    await service.deleteExercise(name);
    setExercises(exercises.filter((r) => r.name !== name));
  }
  return (
    <div>
      <AddExerciseForm
        onSubmit={async (data) => {
          const added = await service.addExercise(data);
          setExercises([...exercises, added]);
        }}
      />
      <ExerciseList exercises={exercises} deleteExercise={deleteExercise} />
    </div>
  );
}

function ExerciseList({
  exercises,
  deleteExercise,
}: {
  exercises: Array<WithKey<IExercise>>;
  deleteExercise: (name: string) => void;
}) {
  const [active, setActive] = React.useState("");

  return (
    <List sx={{ width: "100%" }}>
      {exercises.map((row, index) => [
        <ListItem key={row.name} disablePadding>
          <ListItemButton onClick={() => setActive(row.name)}>
            <ListItemText key={row.name} primary={row.name} />
            <IconButton onClick={() => deleteExercise(row.name)}>
              <Delete color="secondary" />
            </IconButton>
          </ListItemButton>
        </ListItem>,
        active === row.name ? <ExerciseLog key={index} row={row} /> : null,
      ])}
    </List>
  );
}
