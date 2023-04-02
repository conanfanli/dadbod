import Edit from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { getEventService } from "../indexeddb/service";
import { useLiveQuery } from "dexie-react-hooks";
import { WithId, IWorkout } from "../types";

export function WorkoutList() {
  const navigate = useNavigate();

  const service = React.useMemo(() => getEventService(), []);
  const workouts = useLiveQuery(() => service.getWorkouts(), [service]) || [];
  return (
    <List sx={{ width: "100%", mb: "3ch" }}>
      {workouts.map((workout, _) => [
        <Workout key={workout.id} workout={workout} />,
      ])}
      <Button
        variant="outlined"
        fullWidth
        onClick={() => navigate(`/workouts/new`)}
      >
        add a new workout
      </Button>
    </List>
  );
}

function Workout({ workout }: { workout: WithId<IWorkout> }) {
  const navigate = useNavigate();
  return (
    <ListItem key={workout.id} disablePadding>
      <ListItemButton onClick={() => navigate(`/workouts/${workout.id}`)}>
        <ListItemText
          key={workout.id}
          primary={workout.name ? workout.name : workout.date}
          secondary={workout.description}
        />
        <IconButton onClick={() => navigate(`/workouts/${workout.id}`)}>
          <Edit />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}
