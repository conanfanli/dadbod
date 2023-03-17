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
  const sorted = [...exercises];
  sorted.sort((a, b) => {
    if (picked.indexOf(a.id) >= 0 && picked.indexOf(b.id) < 0) {
      return -1;
    } else if (picked.indexOf(b.id) >= 0 && picked.indexOf(a.id) < 0) {
      return 1;
    }
    return +(a.name > b.name);
  });
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        mb: "3ch",
      }}
    >
      {sorted.map((ex) => (
        <Exercise
          key={ex.id}
          onToggle={() => onPick(ex.id)}
          picked={picked.indexOf(ex.id) !== -1}
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
  picked: boolean;
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
          <Checkbox edge="start" checked={picked} tabIndex={-1} disableRipple />
        </ListItemIcon>
        <ListItemText id={exercise.id} primary={exercise.name} />
      </ListItemButton>
    </ListItem>
  );
}
