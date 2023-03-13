import * as React from "react";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { LabPage } from "./LabPage";
import { ExerciseEditForm } from "./LabPage/ExerciseEditForm";
import { Footer } from "./Footer";

function Root() {
  return (
    <>
      <div id="detail">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        { path: "/", element: <LabPage /> },
        { path: "exercises/:id", element: <ExerciseEditForm /> },
      ],
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
