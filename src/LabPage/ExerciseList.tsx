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

function ExerciseListItem({
  exercise,
  setExpand,
}: {
  exercise: WithId<IExercise>;
  setExpand: (id: string) => void;
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
        <IconButton onClick={() => navigate(`/exercises/${exercise.id}`)}>
          <Edit />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}
