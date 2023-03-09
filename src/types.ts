export interface IExercise {
  name: string;
  description: string;
}

export type WithId<T> = {
  [P in keyof T]: T[P];
} & { id: string };

export interface IExerciseLog {
  date: string;
  exerciseId: string;
  sets: Array<ISet>;
}

export interface ISet {
  setNumber: number;
  weight: number;
  reps: number;
}

const ACTIONS = [
  "create-exercise",
  "update-exercise",
  "delete-exercise",
  "upload-state",
] as const;

export type ActionType = (typeof ACTIONS)[number];
export interface IEvent {
  action: ActionType;
  entityId: string;
  createdAt: string;
}
