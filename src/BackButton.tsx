import * as React from "react";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

export function BackButton() {
  const navigate = useNavigate();
  return (
    <IconButton
      color="inherit"
      onClick={() => {
        navigate(-1);
      }}
    >
      <ArrowBack />
    </IconButton>
  );
}
