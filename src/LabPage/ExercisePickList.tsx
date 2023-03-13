import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { getEventService } from "../indexeddb/service";
import ListItemButton from "@mui/material/ListItemButton";
import { useLiveQuery } from "dexie-react-hooks";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import { IExercise, WithId } from "../types";

export function ExercisePickList({
  picked,
  onPick,
}: {
  picked: string[];
  onPick: (exerciseId: string) => void;
}) {
  console.log("render pick list");
  const service = React.useMemo(() => getEventService(), []);

  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        mb: "3ch",
      }}
    >
      {exercises.map((ex) => (
        <Exercise
          key={ex.id}
          onToggle={() => onPick(ex.id)}
          picked={picked}
          exercise={ex}
        />
      ))}
    </List>
  );
}

function Exercise({
  exercise,
  onToggle,
  picked,
}: {
  picked: Array<string>;
  onToggle: () => void;
  exercise: WithId<IExercise>;
}) {
  return (
    <ListItem
      key={exercise.id}
      secondaryAction={
        <IconButton edge="end" aria-label="comments">
          <CommentIcon />
        </IconButton>
      }
      disablePadding
    >
      <ListItemButton role={undefined} onClick={onToggle} dense>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={picked.indexOf(exercise.id) !== -1}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText id={exercise.id} primary={exercise.name} />
      </ListItemButton>
    </ListItem>
  );
}
