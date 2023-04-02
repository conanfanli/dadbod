import * as React from "react";
import { debounce, TextField } from "@mui/material";

export function DebouncedTextField({
  name,
  value,
  onPatch,
}: {
  value: string;
  name: string;
  onPatch: (name: string, value: string) => void;
}) {
  const [localValue, setValue] = React.useState(value);

  const debouncedPatch = React.useMemo(
    () => debounce(onPatch, 1000),
    [onPatch]
  );
  const onChange = React.useCallback(
    (e) => {
      setValue(e.target.value);
      debouncedPatch(name, e.target.value);
    },
    [debouncedPatch, name]
  );
  return (
    <TextField
      onChange={onChange}
      value={localValue}
      fullWidth
      required
      helperText={name}
    />
  );
}
