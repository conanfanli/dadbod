import * as React from "react";
import { AddExerciseForm } from "./AddExerciseForm";
import { getEventService } from "../indexeddb/service";
import { ExercisePageBottomNavigation } from "./ExercisePageBottomNavigation";
import { ExerciseList } from "./ExerciseList";

export function LabPage() {
  console.log("lab");
  const service = React.useMemo(() => getEventService(), []);

  //<ExercisePageBottomNavigation />
  return (
    <div>
      <AddExerciseForm
        onSubmit={async (data) => {
          await service.createExercise(data);
        }}
      />
      <ExerciseList />
    </div>
  );
}
