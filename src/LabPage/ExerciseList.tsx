import Edit from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { ExerciseLog } from "./ExerciseLog";
import { getEventService } from "../indexeddb/service";
import { useLiveQuery } from "dexie-react-hooks";
import { WithId, IExercise } from "../types";
import { AddExerciseForm } from "./AddExerciseForm";

export function ExerciseList() {
  const [expand, setExpand] = React.useState("");

  const service = React.useMemo(() => getEventService(), []);
  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  exercises.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    return 1;
  });
  return (
    <List sx={{ width: "100%", mb: "3ch" }}>
      <AddExerciseForm />
      {exercises.map((exercise, index) => [
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          setExpand={setExpand}
        />,
        expand === exercise.id ? (
          <ExerciseLog key={index} exercise={exercise} />
        ) : null,
      ])}
    </List>
  );
}

export function ExerciseListItem({
  exercise,
  setExpand,
  editable = true,
}: {
  exercise: WithId<IExercise>;
  setExpand: (id: string) => void;
  editable?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <ListItem key={exercise.id} disablePadding>
      <ListItemButton onClick={() => setExpand(exercise.id)}>
        <ListItemText
          key={exercise.id}
          primary={exercise.name}
          secondary={`Best: ${exercise.oneRepMax}`}
        />
        {editable ? (
          <IconButton onClick={() => navigate(`/exercises/${exercise.id}`)}>
            <Edit />
          </IconButton>
        ) : null}
      </ListItemButton>
    </ListItem>
  );
}
