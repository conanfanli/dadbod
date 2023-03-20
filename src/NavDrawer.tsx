import {
  Box,
  List,
  ListItemButton,
  Drawer,
  ListItem,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export function NavDrawer({ open, toggleDrawer }) {
  const navigate = useNavigate();

  return (
    <Box component="nav">
      <Drawer
        container={() => window.document.body}
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "50%",
          },
        }}
      >
        <Box onClick={toggleDrawer} sx={{ textAlign: "center" }}>
          <List>
            <ListItem key="workouts">
              <ListItemButton onClick={() => navigate("/")}>
                <ListItemText>Workouts</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem key="exercises">
              <ListItemButton onClick={() => navigate("/exercises")}>
                <ListItemText>Exercises</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem key="spreadsheet">
              <ListItemButton
                onClick={() => navigate("/spreadsheet/authorize")}
              >
                <ListItemText>Spreadsheet</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
