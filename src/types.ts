export interface IExercise {
  name: string;
  description: string;
  oneRepMax?: string;
}

export type WithId<T> = {
  [P in keyof T]: T[P];
} & { id: string };

export interface IExerciseLog {
  date: string;
  exerciseId: string;
  sets: Array<ISet>;
}
export interface IWorkout {
  date: string;
  name: string;
  description: string;
  exerciseIds: Array<string>;
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

  "create-exercise-log",
  "update-exercise-log",

  "create-workout",
  "update-workout",
  "delete-workout",
] as const;

export type ActionType = (typeof ACTIONS)[number];
export interface IEvent {
  action: ActionType;
  entityId: string;
  createdAt: Date;
  payload: {};
}

export interface DbState {
  revision: Date;
  events: Array<WithId<IEvent>>;
  exerciseLogs: Array<WithId<IExerciseLog>>;
  exercises: Array<WithId<IExercise>>;
  workouts: Array<WithId<IWorkout>>;
}
