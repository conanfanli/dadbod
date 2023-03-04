import Remove  from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add"
import { Collapse, Box, TextField, ListItem, ListItemIcon, Button } from "@mui/material";
import React from "react";
import type {IExercise} from './Exercise'

export function ExerciseLog({ row, open }: { row: IExercise; open: boolean }) {
    const [weight, setWeight] = React.useState(0);
    const [reps, setReps] = React.useState(0);
  
    return (
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          <div>
            <TextField
              label="set"
              sx={{ m: 1, width: "10%" }}
              value={1}
              disabled
              size="small"
            />
            <TextField
              label="Weight"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              inputProps={{ inputMode: "numeric" }}
              size="small"
              sx={{ m: 1, width: "36%" }}
            />
            <TextField
              inputProps={{ inputMode: "numeric" }}
              value={reps}
              label="Reps"
              sx={{ m: 1, width: "36%" }}
              onChange={(e) => setReps(Number(e.target.value))}
              size="small"
            />
          </div>
        </Box>
        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pr: 0,
          }}
        >
          <ListItemIcon>
            <AddIcon color="primary" />
          </ListItemIcon>
          <Button variant="contained">Log</Button>
          <ListItemIcon>
            <Remove color="error" />
          </ListItemIcon>
        </ListItem>
      </Collapse>
    );
  }