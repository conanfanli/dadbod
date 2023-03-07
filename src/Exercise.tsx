import {
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  IconButton,
} from "@mui/material";
import * as React from "react";
import { DbClient } from "./indexeddb/client";
import { AddExerciseForm } from "./AddExerciseForm";
import Delete from "@mui/icons-material/Delete";
import { ExerciseLog } from "./ExerciseLog";
import { IExercise } from "./types";

export function Exercises() {
  const client = React.useMemo(() => new DbClient(), []);
  const [exercises, setExercises] = React.useState<Array<IExercise>>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const exercises = await client.listExercises();
      setExercises(exercises);
    };
    fetchData();
  }, [client]);

  async function deleteExercise(name: string) {
    client.deleteExercise(name, () =>
      setExercises(exercises.filter((r) => r.name !== name))
    );
  }
  return (
    <div>
      <AddExerciseForm
        onSubmit={(data) => {
          client.addExercise(data);
          setExercises([...exercises, data]);
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
  exercises: Array<IExercise>;
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
