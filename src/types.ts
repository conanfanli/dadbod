export interface IExercise {
  name: string;
  description: string;
}

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
