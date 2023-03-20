import type {
  DbState,
  IEvent,
  IExercise,
  IExerciseLog,
  IWorkout,
  WithId,
} from "../types";
import Dexie, { Table as DexieTable } from "dexie";

export class DbClient extends Dexie {
  static readonly DB_NAME = "dadbod";
  static readonly LATEST_VERSION = 16;

  exercises!: DexieTable<WithId<IExercise>>;
  exerciseLogs!: DexieTable<WithId<IExerciseLog>>;
  events!: DexieTable<WithId<IEvent>>;
  workouts!: DexieTable<WithId<IWorkout>>;

  public constructor() {
    super(DbClient.DB_NAME);
    this.version(DbClient.LATEST_VERSION).stores({
      exercises: "id, &name",
      exerciseLogs: "id, &[date+exerciseId], exerciseId",
      events: "id, action, entityId, createdAt",
      workouts: "id, date, &name",
    });
    console.log("inited db client");
  }

  public async serialize(): Promise<DbState> {
    const exercises = await this.exercises.toArray();
    const exerciseLogs = await this.exerciseLogs.toArray();
    const events = await this.events.toArray();
    const workouts = await this.workouts.toArray();
    // Fix date
    return {
      exercises,
      exerciseLogs,
      events: events.slice(events.length - 10),
      workouts,
      revision: await this.getRevision(),
    };
  }

  public async getRevision(): Promise<Date> {
    const lastEvent = await this.events.orderBy("createdAt").last();
    return lastEvent ? new Date(lastEvent.createdAt) : new Date("1907-01-01");
  }

  public async loadRemoteState(remoteState: DbState) {
    this.transaction(
      "rw",
      this.exercises,
      this.exerciseLogs,
      this.events,
      this.workouts,
      async () => {
        await this.exercises.bulkDelete(
          await this.exercises.toCollection().keys()
        );
        await this.exercises.bulkAdd(remoteState.exercises);

        await this.exerciseLogs.bulkDelete(
          await this.exerciseLogs.toCollection().keys()
        );
        await this.exerciseLogs.bulkAdd(remoteState.exerciseLogs);

        await this.events.bulkDelete(await this.events.toCollection().keys());
        await this.events.bulkAdd(remoteState.events);

        await this.workouts.bulkDelete(
          await this.workouts.toCollection().keys()
        );
        await this.workouts.bulkAdd(remoteState.workouts);

        console.log("finished loading remote state");
      }
    );
  }
}
