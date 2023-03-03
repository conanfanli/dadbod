import * as React from "react";
import { Button, Box, TextField } from "@mui/material";

export function AddExerciseForm(props: {
  onSubmit: (data: { name: string; description: string }) => void;
}) {
  const { onSubmit } = props;
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [hidden, setHidden] = React.useState(true);

  function onClickButton(hidden: boolean) {
    if (hidden) {
      setHidden(false);
      return;
    }

    // Form is displaying
    onSubmit({ name, description });
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
            fullWidth
            required
            helperText="Name"
          />
          <TextField
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            helperText="Description"
          />
        </div>
      </Box>
    </div>
  );
}
