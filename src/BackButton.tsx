import * as React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();
  return (
    <Button variant="contained" onClick={() => navigate(-1)}>
      Back
    </Button>
  );
}
