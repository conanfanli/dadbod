import * as React from "react";
import { Button } from "@mui/material";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { Exercises } from "./Exercise";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <div>
          <Button fullWidth>
            <Link to="/spreadsheet/authorize">Spreadsheet</Link>
          </Button>
          <Button fullWidth>
            <Link to="/exercises">Exercises</Link>
          </Button>
        </div>
      ),
    },

    {
      path: "/exercises",
      element: <Exercises />,
    },
    {
      path: "/spreadsheet/authorize",
      element: <Authorize />,
    },
  ],
  { basename: "/dadbod" }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
