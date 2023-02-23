import * as React from "react";
import { Button } from "@mui/material";
import ReactDom from "react-dom/client";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Button href="/spreadsheet/authorize">Authorize</Button>,
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
