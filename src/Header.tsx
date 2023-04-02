import CloudSync from "@mui/icons-material/CloudSync";
import CloudOff from "@mui/icons-material/CloudOff";
import { Button, Box, AppBar, Toolbar } from "@mui/material";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { getEventService, IEventService } from "./indexeddb/service";
import { BackButton } from "./BackButton";
import { NavDrawer } from "./NavDrawer";
import { SheetContext } from "./contexts";
import { useLiveQuery } from "dexie-react-hooks";

export function Header() {
  const sheet = React.useContext(SheetContext);

  const eventService = React.useMemo(() => getEventService(), []);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar color="default" position="static">
          <Toolbar>
            <NavDrawer />
            <div style={{ flexGrow: 1 }}>
              {sheet.remoteRevision ? (
                <SyncButton
                  remoteRevision={sheet.remoteRevision}
                  eventService={eventService}
                />
              ) : (
                <OfflineButton />
              )}
            </div>
            <BackButton />
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}

function OfflineButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/spreadsheet/authorize")}
      endIcon={<CloudOff color="error" />}
    >
      offline
    </Button>
  );
}

function SyncButton({
  remoteRevision,
  eventService,
}: {
  remoteRevision: Date | null;
  eventService: IEventService;
}) {
  console.log("render sheet connection");
  const localRevision =
    useLiveQuery(async () => eventService.getRevision("local")) || null;

  const timeDiff =
    localRevision && remoteRevision
      ? (localRevision.getTime() - remoteRevision.getTime()) / 1000
      : null;

  return (
    <Button
      endIcon={<CloudSync color="primary" />}
      onClick={async () => await eventService.syncState()}
    >
      {getStateDiffLabel(timeDiff)}
    </Button>
  );
}

function getStateDiffLabel(diffInMs: number | null): string {
  if (diffInMs === null) {
    return "NA";
  }
  if (!diffInMs) {
    return "in sync";
  }

  const minutes = diffInMs / 1000 / 60;
  if (minutes < 60) {
    return `${Number(minutes).toFixed(0)} minutes`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Number(hours).toFixed(0)} hours`;
  }
  return `${Number(hours / 24).toFixed(0)} days`;
}
