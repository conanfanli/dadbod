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
import { WithId, IExercise } from "./types";
import { getEventService } from "./indexeddb/service";
import { ExercisePageBottomNavigation } from "./ExercisePageBottomNavigation";
import { useLiveQuery } from "dexie-react-hooks";

export function Exercises() {
  const service = React.useMemo(() => getEventService(), []);

  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  async function deleteExercise(id: string) {
    await service.deleteExercise(id);
  }
  return (
    <div>
      <AddExerciseForm
        onSubmit={async (data) => {
          await service.createExercise(data);
        }}
      />
      <ExerciseList exercises={exercises} deleteExercise={deleteExercise} />
      <ExercisePageBottomNavigation />
    </div>
  );
}

function ExerciseList({
  exercises,
  deleteExercise,
}: {
  exercises: Array<WithId<IExercise>>;
  deleteExercise: (id: string) => void;
}) {
  const [active, setActive] = React.useState("");

  return (
    <List sx={{ width: "100%" }}>
      {exercises.map((row, index) => [
        <ListItem key={row.id} disablePadding>
          <ListItemButton onClick={() => setActive(row.id)}>
            <ListItemText
              key={row.id}
              primary={row.name}
              secondary={row.description}
            />
            <IconButton onClick={() => deleteExercise(row.id)}>
              <Delete color="secondary" />
            </IconButton>
          </ListItemButton>
        </ListItem>,
        active === row.id ? <ExerciseLog key={index} row={row} /> : null,
      ])}
    </List>
  );
}
