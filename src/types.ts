export interface IExercise {
  name: string;
  description: string;
}

export type WithKey<T> = {
  [P in keyof T]: T[P];
} & { key: string };

export interface IExerciseLog {
  date: string;
  exerciseName: string;
  sets: Array<ISet>;
}

export interface ISet {
  setNumber: number;
  weight: number;
  reps: number;
}
