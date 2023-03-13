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
import { WithId, IExercise } from "../types";

export function WorkoutList() {
  const [expand, setExpand] = React.useState("");
  const navigate = useNavigate();

  const service = React.useMemo(() => getEventService(), []);
  const workouts = useLiveQuery(() => service.getWorkouts(), [service]) || [];

  return (
    <List sx={{ width: "100%", mb: "3ch" }}>
      {workouts.map((exercise, index) => [
        <Workout key={exercise.id} exercise={exercise} setExpand={setExpand} />,
      ])}
      <Button
        variant="outlined"
        fullWidth
        onClick={() => navigate("/workouts/new")}
      >
        add a new workout
      </Button>
    </List>
  );
}

function Workout({
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
        <IconButton onClick={() => navigate(`/workouts/${exercise.id}`)}>
          <Edit />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
}
