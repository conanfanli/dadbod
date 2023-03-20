import MenuIcon from "@mui/icons-material/Menu";
import {
  IconButton,
  Box,
  List,
  ListItemButton,
  Drawer,
  ListItem,
  ListItemText,
  Divider,
  ListSubheader,
} from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getEventService } from "./indexeddb/service";

export function NavDrawer() {
  const navigate = useNavigate();

  const eventService = React.useMemo(() => getEventService(), []);
  const [open, setOpen] = React.useState(false);
  const [localRevision, setLocalRevision] = React.useState(new Date("1907"));
  const [remoteRevision, setRemoteRevision] = React.useState(new Date("1907"));

  async function toggleDrawer() {
    setOpen(!open);
    setLocalRevision(await eventService.getRevision("local"));
    setRemoteRevision(await eventService.getRevision("remote"));
  }

  return (
    <Box component="nav">
      <IconButton
        size="large"
        sx={{ mr: 2 }}
        color="inherit"
        edge="start"
        onClick={toggleDrawer}
      >
        <MenuIcon></MenuIcon>
      </IconButton>
      <Drawer
        container={() => window.document.body}
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "80%",
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
          <Divider />
          <List
            sx={{ textAlign: "left" }}
            subheader={<ListSubheader>Revisions:</ListSubheader>}
          >
            <ListItem key="local revision">
              <ListItemText>{`local: ${localRevision.toLocaleString()}`}</ListItemText>
            </ListItem>
            <ListItem key="remote revision">
              <ListItemText>{`remote: ${remoteRevision.toLocaleString()}`}</ListItemText>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
