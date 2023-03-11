import * as React from "react";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LabPage } from "./LabPage";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LabPage />,
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
