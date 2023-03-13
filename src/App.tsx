import * as React from "react";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { LabPage } from "./LabPage";
import { ExerciseEditForm } from "./LabPage/ExerciseEditForm";
import { Footer } from "./Footer";
import { WorkoutEditForm } from "./LabPage/WorkoutEditForm";

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
        { path: "exercises/:exerciseId", element: <ExerciseEditForm /> },
        { path: "workouts/:workoutId", element: <WorkoutEditForm /> },
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
