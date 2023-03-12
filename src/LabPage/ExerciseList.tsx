import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
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
import { ExerciseEditForm } from "./ExerciseEditForm";
import { WithId, IExercise } from "../types";

export function ExerciseList() {
  const [expand, setExpand] = React.useState("");
  const [editMode, setEditMode] = React.useState("");

  const service = React.useMemo(() => getEventService(), []);
  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  console.log(editMode);
  return (
    <List sx={{ width: "100%", mb: "3ch" }}>
      {exercises.map((exercise, index) => [
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          editMode={editMode}
          setExpand={setExpand}
          setEditMode={setEditMode}
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
  editMode,
  setExpand,
  setEditMode,
}: {
  exercise: WithId<IExercise>;
  editMode: string;
  setExpand: (id: string) => void;
  setEditMode: (id: string) => void;
}) {
  if (editMode === exercise.id) {
    return <ExerciseEditForm exerciseId={exercise.id} />;
  }
  return (
    <ListItem key={exercise.id} disablePadding>
      <ListItemButton onClick={() => setExpand(exercise.id)}>
        <ListItemText
          key={exercise.id}
          primary={exercise.name}
          secondary={exercise.description}
        />
        <IconButton onClick={() => setEditMode(exercise.id)}>
          <Edit />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}
