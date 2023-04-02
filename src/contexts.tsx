import * as React from "react";
import { getEventService } from "./indexeddb/service";

interface SheetContextProp {
  refresh: () => Promise<void>;
  remoteRevision?: Date | null;
  setRemoteRevision: (d: Date | null) => void;
  expiry?: number;
}

export const SheetContext = React.createContext<SheetContextProp>({
  refresh: async () => { },
  setRemoteRevision: () => { }
});

export function SheetProvider({ children }) {
  const [remoteRevision, setRemoteRevision] = React.useState<Date | null>(null);
  const [expiry, setExpiry] = React.useState<number | undefined>(undefined);

  const eventService = React.useMemo(() => getEventService(), []);

  React.useEffect(() => {
    async function fetchData() {
      if (await eventService.getConnectedSheetName()) {
        setRemoteRevision(await eventService.getRevision("remote"));
      }
      const token = localStorage.getItem("spreadsheet_token");
      if (token) {
        setExpiry(JSON.parse(token).expireAt - new Date().getTime());
      }
    }
    fetchData();
  }, [eventService]);

  async function refresh() {
    const revision = await eventService.getRevision("remote")
    console.log("Setting remote revision", revision)

    setRemoteRevision(revision);
  }

  return (
    <SheetContext.Provider
      value={{
        refresh,
        remoteRevision,
        setRemoteRevision,
        expiry,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}
