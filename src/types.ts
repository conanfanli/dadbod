export interface IExercise {
    name: string;
    description: string;
}

export interface IExerciseLog {
    date: string;
    exerciseName: string;
    sets: Array<{ setNumber: number; weight: number; reps: number }>
}