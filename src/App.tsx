import * as React from "react";
import { Authorize } from "./googlespreadsheet/Auth";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { ExerciseEditForm } from "./LabPage/ExerciseEditForm";
import { Header } from "./Header";
import { WorkoutPage } from "./LabPage/WorkoutEditForm";
import { ExerciseList } from "./LabPage/ExerciseList";
import { WorkoutList } from "./LabPage/WorkoutList";
import { SheetProvider } from "./contexts";

function Root() {
  return (
    <>
      <SheetProvider>
        <Header />
        <div style={{ marginTop: "3ch" }} id="detail">
          <Outlet />
        </div>
      </SheetProvider>
    </>
  );
}
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        { path: "/", element: <WorkoutList /> },
        { path: "/exercises/", element: <ExerciseList /> },
        { path: "/exercises/:exerciseId", element: <ExerciseEditForm /> },
        { path: "/workouts/:workoutId", element: <WorkoutPage /> },
        {
          path: "/spreadsheet/authorize",
          element: <Authorize />,
        },
      ],
    },
  ],
  { basename: "/dadbod" }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
