import * as React from "react";
import { Button } from "@mui/material";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Exercises } from "./Exercise";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Button fullWidth href="/spreadsheet/authorize">
          Spreadsheet
        </Button>
        <Button fullWidth href="/exercise">
          Exercises
        </Button>
      </div>
    ),
  },
  {
    path: "/exercise",
    element: <Exercises />,
  },
  {
    path: "/spreadsheet/authorize",
    element: <Authorize />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
