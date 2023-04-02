import * as React from "react";
import { Button, Box, TextField } from "@mui/material";
import { getEventService } from "../indexeddb/service";

export function AddExerciseForm() {
  const service = React.useMemo(() => getEventService(), []);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [hidden, setHidden] = React.useState(true);

  function onClickButton(hidden: boolean) {
    if (hidden) {
      setHidden(false);
      return;
    }

    // Form is displaying
    service.createExercise({ name, description });
    setHidden(true);
    setName("");
    setDescription("");
  }
  return (
    <div>
      <Button
        onClick={() => onClickButton(hidden)}
        variant="outlined"
        fullWidth
        disabled={!hidden && name === ""}
      >
        {hidden ? "Add a New Exercise" : "Save"}
      </Button>
      <Box hidden={hidden} noValidate component="form">
        <div>
          <TextField
            error={name === ""}
            onChange={(e) => setName(e.target.value)}
            value={name}
            fullWidth
            required
            helperText="Name"
          />
          <TextField
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            value={description}
            required
            helperText="Description"
          />
        </div>
      </Box>
    </div>
  );
}
