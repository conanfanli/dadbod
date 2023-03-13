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

export function ExercisePickList() {
  console.log("render pick list");
  const [checked, setChecked] = React.useState<string[]>([]);
  const service = React.useMemo(() => getEventService(), []);
  const exercises =
    useLiveQuery(() => service.listExercises(), [service]) || [];

  const onToggle = (id: string) => () => {
    const currentIndex = checked.indexOf(id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

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
          onToggle={onToggle(ex.id)}
          checked={checked}
          exercise={ex}
        />
      ))}
    </List>
  );
}

function Exercise({
  exercise,
  onToggle,
  checked,
}: {
  checked: Array<string>;
  onToggle: (e) => void;
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
            checked={checked.indexOf(exercise.id) !== -1}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText id={exercise.id} primary={exercise.name} />
      </ListItemButton>
    </ListItem>
  );
}
